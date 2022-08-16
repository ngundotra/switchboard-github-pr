use anchor_lang::prelude::*;
use switchboard_v2::AggregatorAccountData;

declare_id!("6R5FUxyQMT2WbzXe1419Wy5qFc7Pd59xjiGeJB5rrM9d");

fn compare_value(value: f64, threshold_value: f64, comparison_type: ComparisonType) -> bool {
    match comparison_type {
        ComparisonType::EqualTo => value == threshold_value,
        ComparisonType::GreaterThan => value > threshold_value,
        ComparisonType::GreaterThanEqualTo => value >= threshold_value,
        ComparisonType::LessThan => value < threshold_value,
        ComparisonType::LessThanEqualTo => value <= threshold_value,
    }
}

#[program]
pub mod sbv2_gh_pr_tracker {
    use super::*;

    pub fn initialize<'info>(
        ctx: Context<'_, '_, '_, 'info, InitializeTracker<'info>>,
        tracker_account_id: u32,
    ) -> Result<()> {
        let aggregator = ctx.accounts.aggregator.load()?;
        let val: f64 = aggregator.get_result()?.try_into()?;

        let tracker = &mut ctx.accounts.tracker;
        tracker.authority = ctx.accounts.authority.key();
        tracker.comparison_type = ComparisonType::GreaterThan;
        tracker.threshold_value = 1.5;

        msg!(
            "Created new tracker account with id: {}",
            tracker_account_id
        );
        if compare_value(val, tracker.threshold_value, tracker.comparison_type) {
            msg!("\tThreshold value is passed");
        } else {
            msg!("\tThreshold value is not passed");
        }
        Ok(())
    }

    pub fn verify<'info>(
        ctx: Context<'_, '_, '_, 'info, VerifyTracker<'info>>,
        _tracker_account_id: u32,
    ) -> Result<()> {
        let aggregator = ctx.accounts.aggregator.load()?;
        let val = aggregator.get_result()?.try_into()?;
        aggregator.check_staleness(Clock::get().unwrap().unix_timestamp, 300)?;

        let tracker = &ctx.accounts.tracker;
        if !compare_value(val, tracker.threshold_value, tracker.comparison_type) {
            Err(TrackerError::ThresholdNotPassed.into())
        } else {
            Ok(())
        }
    }
}

#[error_code]
pub enum TrackerError {
    #[msg("Threshold value not yet passed")]
    ThresholdNotPassed,

    #[msg("Account failed to be validated")]
    AccountValidationFailed,
}

#[derive(Accounts)]
#[instruction(tracker_account_id: u32)]
pub struct InitializeTracker<'info> {
    #[account(mut)]
    pub payer: Signer<'info>,
    #[account(
        init,
        payer=payer,
        space=49,
        seeds=[
            authority.key().as_ref(),
            aggregator.key().as_ref(),
            &tracker_account_id.to_le_bytes(),
        ],
        bump
    )]
    pub tracker: Account<'info, Tracker>,
    /// CHECK: this account is neither read from nor written to
    pub authority: Signer<'info>,
    // /// CHECK: unique per github pr issue
    pub aggregator: AccountLoader<'info, AggregatorAccountData>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
#[instruction(tracker_account_id: u32)]
pub struct VerifyTracker<'info> {
    #[account(mut)]
    pub payer: Signer<'info>,
    #[account(
        seeds=[
            authority.key().as_ref(),
            aggregator.key().as_ref(),
            &tracker_account_id.to_le_bytes(),
        ],
        bump
    )]
    pub tracker: Account<'info, Tracker>,
    /// CHECK: this account is neither read from nor written to
    pub authority: Signer<'info>,
    /// CHECK: unique per github pr issue
    pub aggregator: AccountLoader<'info, AggregatorAccountData>,
}

#[account]
pub struct Tracker {
    pub authority: Pubkey,
    pub comparison_type: ComparisonType,
    pub threshold_value: f64,
}

#[derive(AnchorSerialize, AnchorDeserialize, PartialEq, Copy, Clone)]
#[repr(C)]
pub enum ComparisonType {
    GreaterThanEqualTo,
    LessThanEqualTo,
    GreaterThan,
    LessThan,
    EqualTo,
}
