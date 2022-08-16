import * as anchor from "@project-serum/anchor";
import { Program } from "@project-serum/anchor";
import { Keypair, PublicKey } from '@solana/web3.js';
import { BN } from "bn.js";
import { Sbv2GhPrTracker } from "../target/types/sbv2_gh_pr_tracker";

const OPEN_PR_AGGREGATOR = new PublicKey("EHPTLRdPWgcFRw1tebHAhU3Kat5ZxsoJxefCYu2aqAMB");

describe("sbv2-gh-pr-tracker devnet", () => {
  // Configure the client to use the local cluster.
  anchor.setProvider(anchor.AnchorProvider.env());

  const payer = Keypair.generate();
  const program = anchor.workspace.Sbv2GhPrTracker as Program<Sbv2GhPrTracker>;
  console.log(program.programId.toString());

  it("Open PR fails to verify", async () => {
    const trackerId = 0;
    const [tracker, _] = await PublicKey.findProgramAddress([
      payer.publicKey.toBuffer(),
      payer.publicKey.toBuffer(),
      Buffer.from((new BN(trackerId)).toArray('le')),
    ], program.programId);

    const aggregator = new PublicKey(OPEN_PR_AGGREGATOR);
    // Add your test here.
    console.log("sending tx")
    const tx = await program.methods.initialize(trackerId).accounts({
      payer: payer.publicKey,
      authority: payer.publicKey,
      tracker,
      aggregator
    }).signers([payer]).rpc({ skipPreflight: true });
    console.log("Your transaction signature", tx);
  });
});
