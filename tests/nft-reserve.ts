import * as anchor from '@project-serum/anchor';
import { Program } from '@project-serum/anchor';
import { NftReserve } from '../target/types/nft_reserve';
import { Connection, PublicKey } from '@solana/web3.js';
import { TOKEN_PROGRAM_ID, Token, AuthorityType } from "@solana/spl-token";
import { assert } from "chai";

function enc(str: string) {
  return Buffer.from(anchor.utils.bytes.utf8.encode(str))
}

async function airdropSol(address: PublicKey, connection: Connection) {
  await connection.confirmTransaction(
    await connection.requestAirdrop(address, 1 * anchor.web3.LAMPORTS_PER_SOL),
    "processed"
  );
}
describe('nft-reserve', () => {

  // Configure the client to use the local cluster.
  anchor.setProvider(anchor.Provider.env());

  //@ts-ignore
  const program = anchor.workspace.NftReserve as Program<NftReserve>;

  let reserveAccount: anchor.web3.Keypair, managerAccount: anchor.web3.Keypair;
  let tokenMint: Token, mintAuthority: anchor.web3.Keypair, managerTokenAccount: PublicKey;
  let nftMintA: Token, redeemerAccount: anchor.web3.Keypair;
  let redeemerTokenAccount: PublicKey, redeemerNftAccount: PublicKey;
  let repurchaseQuantity = 1, managerInitTokenBal = 1000;
  beforeEach(async () => {
    reserveAccount = anchor.web3.Keypair.generate();
    managerAccount = anchor.web3.Keypair.generate();
    mintAuthority = anchor.web3.Keypair.generate();
    redeemerAccount = anchor.web3.Keypair.generate();

    await airdropSol(managerAccount.publicKey, anchor.getProvider().connection);
    await airdropSol(redeemerAccount.publicKey, anchor.getProvider().connection);

    tokenMint = await Token.createMint(
      anchor.getProvider().connection,
      managerAccount,
      mintAuthority.publicKey,
      null,
      0,
      TOKEN_PROGRAM_ID
    );

    nftMintA = await Token.createMint(
      anchor.getProvider().connection,
      redeemerAccount,
      mintAuthority.publicKey,
      mintAuthority.publicKey,
      0,
      TOKEN_PROGRAM_ID
    )

    managerTokenAccount = await tokenMint.createAssociatedTokenAccount(managerAccount.publicKey);
    redeemerTokenAccount = await tokenMint.createAssociatedTokenAccount(redeemerAccount.publicKey);
    redeemerNftAccount = await nftMintA.createAssociatedTokenAccount(redeemerAccount.publicKey);


    await tokenMint.mintTo(
      managerTokenAccount,
      mintAuthority.publicKey,
      [mintAuthority],
      managerInitTokenBal
    );

    await nftMintA.mintTo(
      redeemerNftAccount,
      mintAuthority.publicKey,
      [mintAuthority],
      1
    );

    await nftMintA.setAuthority(
      nftMintA.publicKey,
      null,
      'MintTokens',
      mintAuthority.publicKey,
      [mintAuthority]
    );

  })

  async function initReserve() {
    let [auth, auth_bump] = await PublicKey.findProgramAddress([
      enc("token-authority"), reserveAccount.publicKey.toBytes(),
    ], program.programId);
    let [store, store_bump] = await PublicKey.findProgramAddress([
      enc("token-store"), reserveAccount.publicKey.toBytes(),
    ], program.programId);  
    await program.rpc.initReserve(store_bump, auth_bump, new anchor.BN(repurchaseQuantity), {
      accounts: {
        reserve: reserveAccount.publicKey,
        manager: managerAccount.publicKey,
        tokenAuthority: auth,
        tokenStore: store,
        tokenMint: tokenMint.publicKey,
        tokenProgram: TOKEN_PROGRAM_ID,
        rent: anchor.web3.SYSVAR_RENT_PUBKEY,
        systemProgram: anchor.web3.SystemProgram.programId,
      },
      signers: [managerAccount, reserveAccount]
    });
    return {
      auth, auth_bump, store, store_bump
    }
  }

  it('Initialize the reserve', async () => {
    await initReserve();
    
    // post tx assertions
    let reserve = await program.account.reserve.fetch(reserveAccount.publicKey);
    assert.ok(reserve.redeemCount.toNumber() === 0);
    assert.ok(reserve.manager.equals(managerAccount.publicKey));
    assert.ok(reserve.repurchaseQuantity.toNumber() === 1);
  });

  async function initAndFundReserve(fundAmount: number) {
    let {auth, auth_bump, store, store_bump} = await initReserve();
    await program.rpc.fundReserve(store_bump, new anchor.BN(fundAmount), {
      accounts: {
        reserve: reserveAccount.publicKey,
        tokenStore: store,
        funderTokenAccount: managerTokenAccount,
        sender: managerAccount.publicKey,
        tokenProgram: TOKEN_PROGRAM_ID,
      },
      signers: [managerAccount]
    });
    return {auth, auth_bump, store, store_bump}
  }

  it('Funds the reserve', async() => {
    let fundAmount = 10;

    // pre tx assertions
    let tokenAccount = await tokenMint.getAccountInfo(managerTokenAccount);
    assert.ok(tokenAccount.amount.toNumber() === managerInitTokenBal);

    await initAndFundReserve(fundAmount);

    // post tx assertions
    tokenAccount = await tokenMint.getAccountInfo(managerTokenAccount);
    assert.ok(tokenAccount.amount.toNumber() === managerInitTokenBal - fundAmount);
  })

  it('Redeems an NFT', async() => {
    let {auth, auth_bump, store, store_bump} = await initAndFundReserve(10);

    // pre tx assertions
    let nftAccount = await nftMintA.getAccountInfo(redeemerNftAccount);
    assert.ok(nftAccount.amount.toNumber() === 1);
    let tokenAccount = await tokenMint.getAccountInfo(redeemerTokenAccount);
    assert.ok(tokenAccount.amount.toNumber() === 0);

    await program.rpc.redeemNft(store_bump, auth_bump, {
      accounts: {
        reserve: reserveAccount.publicKey,
        tokenStore: store,
        tokenAuthority: auth,
        recipientTokenAccount: redeemerTokenAccount,
        nftTokenAccount: redeemerNftAccount,
        nftMint: nftMintA.publicKey,
        redeemer: redeemerAccount.publicKey,
        tokenProgram: TOKEN_PROGRAM_ID,
      },
      signers: [redeemerAccount]
    });

    // post tx assertions
    nftAccount = await nftMintA.getAccountInfo(redeemerNftAccount);
    assert.ok(nftAccount.amount.toNumber() === 0);
    tokenAccount = await tokenMint.getAccountInfo(redeemerTokenAccount);
    assert.ok(tokenAccount.amount.toNumber() === repurchaseQuantity);
  })
});
