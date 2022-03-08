import * as anchor from '@project-serum/anchor';
import { Program } from '@project-serum/anchor';
import { NftReserve } from '../target/types/nft_reserve';
import { Connection, PublicKey } from '@solana/web3.js';
import { TOKEN_PROGRAM_ID, Token, AuthorityType } from "@solana/spl-token";
import { assert, expect } from "chai";
import { MerkleTree } from 'merkletreejs';
import keccak256 from 'keccak256';

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
  let nftMintA: Token, nftMintB: Token,redeemerAccount: anchor.web3.Keypair;
  let redeemerTokenAccount: PublicKey, redeemerNftAccountA: PublicKey, redeemerNftAccountB: PublicKey;
  let repurchaseQuantity = 2, managerInitTokenBal = 1000;
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

    managerTokenAccount = await tokenMint.createAssociatedTokenAccount(managerAccount.publicKey);
    redeemerTokenAccount = await tokenMint.createAssociatedTokenAccount(redeemerAccount.publicKey);

    await tokenMint.mintTo(
      managerTokenAccount,
      mintAuthority.publicKey,
      [mintAuthority],
      managerInitTokenBal
    );

    [nftMintA, redeemerNftAccountA] = await createNftAccounts();
    [nftMintB, redeemerNftAccountB] = await createNftAccounts();
    
  })

  async function createNftAccounts(): Promise<[Token, PublicKey]> {
    let nftMint = await Token.createMint(
      anchor.getProvider().connection,
      redeemerAccount,
      mintAuthority.publicKey,
      mintAuthority.publicKey,
      0,
      TOKEN_PROGRAM_ID
    );

    let nftTokenAccount = await nftMint.createAssociatedTokenAccount(redeemerAccount.publicKey);

    await nftMint.mintTo(
      nftTokenAccount,
      mintAuthority.publicKey,
      [mintAuthority],
      1
    );

    await nftMint.setAuthority(
      nftMint.publicKey,
      null,
      'MintTokens',
      mintAuthority.publicKey,
      [mintAuthority]
    );
    return [nftMint, nftTokenAccount];
  }

  async function initReserve() {
    let [auth, auth_bump] = await PublicKey.findProgramAddress([
      enc("token-authority"), reserveAccount.publicKey.toBytes(),
    ], program.programId);
    let [store, store_bump] = await PublicKey.findProgramAddress([
      enc("token-store"), reserveAccount.publicKey.toBytes(),
    ], program.programId);
    let [whitelist, whitelist_bump] = await PublicKey.findProgramAddress([
      enc("whitelist"), reserveAccount.publicKey.toBytes(),
    ], program.programId)
    
    await program.rpc.initReserve(auth_bump, new anchor.BN(repurchaseQuantity), {
      accounts: {
        reserve: reserveAccount.publicKey,
        manager: managerAccount.publicKey,
        tokenAuthority: auth,
        tokenStore: store,
        whitelist: whitelist,
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

  xit('Initialize the reserve', async () => {
    await initReserve();

    // post tx assertions
    let reserve = await program.account.reserve.fetch(reserveAccount.publicKey);
    assert.ok(reserve.redeemCount.toNumber() === 0);
    assert.ok(reserve.manager.equals(managerAccount.publicKey));
    assert.ok(reserve.repurchaseQuantity.toNumber() === 2);
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

  async function setWhitelist(leaves: Buffer[]) {
    const tree = new MerkleTree(
      leaves,
      keccak256,
      {sortPairs: true, hashLeaves: true}
    );
    const root = tree.getRoot();
    
    let [whitelist, whitelist_bump] = await PublicKey.findProgramAddress([
      enc("whitelist"), reserveAccount.publicKey.toBytes(),
    ], program.programId);
    await program.rpc.setWhitelist(whitelist_bump, root, {
      accounts: {
        reserve: reserveAccount.publicKey,
        whitelist: whitelist,
        payer: managerAccount.publicKey,
        systemProgram: anchor.web3.SystemProgram.programId,
      },
      signers: [managerAccount],
    })
  } 

  async function redeemNft(nftMintKey: PublicKey, nftAccountKey: PublicKey) {
    let [auth, auth_bump] = await PublicKey.findProgramAddress([
      enc("token-authority"), reserveAccount.publicKey.toBytes(),
    ], program.programId);
    let [store, store_bump] = await PublicKey.findProgramAddress([
      enc("token-store"), reserveAccount.publicKey.toBytes(),
    ], program.programId);

    await program.rpc.redeemNft(store_bump, auth_bump, {
      accounts: {
        reserve: reserveAccount.publicKey,
        tokenStore: store,
        tokenAuthority: auth,
        recipientTokenAccount: redeemerTokenAccount,
        nftTokenAccount: nftAccountKey,
        nftMint: nftMintKey,
        redeemer: redeemerAccount.publicKey,
        tokenProgram: TOKEN_PROGRAM_ID,
      },
      signers: [redeemerAccount]
    });
  }


  xit('Funds the reserve', async() => {
    let fundAmount = 10;

    // pre tx assertions
    let tokenAccount = await tokenMint.getAccountInfo(managerTokenAccount);
    assert.ok(tokenAccount.amount.toNumber() === managerInitTokenBal);

    await initAndFundReserve(fundAmount);

    // post tx assertions
    tokenAccount = await tokenMint.getAccountInfo(managerTokenAccount);
    assert.ok(tokenAccount.amount.toNumber() === managerInitTokenBal - fundAmount);
  })

  xit('Redeems an NFT', async() => {
    let {auth, auth_bump, store, store_bump} = await initAndFundReserve(10);

    // pre tx assertions
    let nftAccount = await nftMintA.getAccountInfo(redeemerNftAccountA);
    assert.ok(nftAccount.amount.toNumber() === 1);
    let tokenAccount = await tokenMint.getAccountInfo(redeemerTokenAccount);
    assert.ok(tokenAccount.amount.toNumber() === 0);

    await redeemNft(nftMintA.publicKey, redeemerNftAccountA);

    // post tx assertions
    let reserve = await program.account.reserve.fetch(reserveAccount.publicKey);
    nftAccount = await nftMintA.getAccountInfo(redeemerNftAccountA);
    assert.ok(nftAccount.amount.toNumber() === 0);
    tokenAccount = await tokenMint.getAccountInfo(redeemerTokenAccount);
    assert.ok(tokenAccount.amount.toNumber() === repurchaseQuantity);
    assert.ok(reserve.redeemCount.toNumber() === 1);
  })

  function addRandomLeaves(leaves: Buffer[], number) {
    for (let i = 0; i < number; i++) {
      let leaf = anchor.web3.Keypair.generate();
      leaves.push(leaf.publicKey.toBuffer());
    }
  }


  it('Sets a whitelist', async() => {
    await initReserve();

    const leaves: Buffer[] = [];

    addRandomLeaves(leaves, 100);
    await setWhitelist(leaves);
  })

  it('Can redeem whitelisted NFT', async() => {
    await initAndFundReserve(10);

    const leaves = [
      nftMintA.publicKey.toBuffer(),
    ];

    addRandomLeaves(leaves, 100);
    await setWhitelist(leaves);

    await redeemNft(nftMintA.publicKey, redeemerNftAccountA);
  })

  it("Can't redeem NFT that isn't whitelisted", async() => {
    await initAndFundReserve(10);

    const leaves = [
      nftMintA.publicKey.toBuffer(),
    ];

    addRandomLeaves(leaves, 100);
    await setWhitelist(leaves);

    expect(await redeemNft(nftMintB.publicKey, redeemerNftAccountB)).to.throw("Error")
  })
});
