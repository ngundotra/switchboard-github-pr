import * as anchor from "@project-serum/anchor";
import { Program } from "@project-serum/anchor";
import { Keypair, PublicKey, LAMPORTS_PER_SOL } from '@solana/web3.js';
import { BN } from "bn.js";
import { Sbv2GhPrTracker } from "../target/types/sbv2_gh_pr_tracker";

const OPEN_PR_AGGREGATOR = new PublicKey("EHPTLRdPWgcFRw1tebHAhU3Kat5ZxsoJxefCYu2aqAMB");
const OPEN_PR_0_TRACKER = new PublicKey("FPkPTAFJGQYGWTSKQFuJ3temBBfjM6YiQGxypHE4Bvk7");

describe("sbv2-gh-pr-tracker devnet", () => {
  // Configure the client to use the local cluster.
  anchor.setProvider(anchor.AnchorProvider.env());
  const provider = anchor.getProvider();

  const payer = Keypair.generate();
  const program = anchor.workspace.Sbv2GhPrTracker as Program<Sbv2GhPrTracker>;
  console.log(program.programId.toString());

  // it("Open PR creation", async () => {
  //   const airdropTxId = await provider.connection.requestAirdrop(payer.publicKey, LAMPORTS_PER_SOL);
  //   console.log(`\tRequested airdrop to ${payer.publicKey.toString()}: ${airdropTxId}`);

  //   const aggregator = new PublicKey(OPEN_PR_AGGREGATOR);
  //   const trackerId = 0;

  //   const [tracker, _] = await PublicKey.findProgramAddress([
  //     payer.publicKey.toBuffer(),
  //     aggregator.toBuffer(),
  //     Buffer.from((new BN(trackerId)).toArray('le', 4)),
  //   ], program.programId);

  //   // Add your test here.
  //   console.log("sending tx")
  //   const tx = await program.methods.initialize(trackerId).accounts({
  //     payer: payer.publicKey,
  //     authority: payer.publicKey,
  //     tracker,
  //     aggregator
  //   }).signers([payer]).rpc({ skipPreflight: true });
  //   console.log("Your transaction signature", tx);
  // });
  it("Open PR fails to verify", async () => {
    const aggregator = new PublicKey(OPEN_PR_AGGREGATOR);
    const trackerId = 0;

    const [tracker, _] = await PublicKey.findProgramAddress([
      OPEN_PR_0_TRACKER.toBuffer(),
      aggregator.toBuffer(),
      Buffer.from((new BN(trackerId)).toArray('le', 4)),
    ], program.programId);

    // Add your test here.
    console.log("Sending tx");
    const tx = await program.methods.verify(trackerId).accounts({
      authority: OPEN_PR_0_TRACKER,
      tracker,
      aggregator
    }).rpc({ skipPreflight: true });
    console.log("Your transaction signature", tx);
  });
});
