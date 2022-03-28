import * as anchor from "@project-serum/anchor";
import { Connection, Keypair, PublicKey } from "@solana/web3.js";
import {
  Token,
  TOKEN_PROGRAM_ID,
  ASSOCIATED_TOKEN_PROGRAM_ID,
} from "@solana/spl-token";
import { NftReserve } from "./nft_reserve_type";
import { enc } from "@/lib/utils";
import { RESERVE_PROGRAM_ID } from "./constants";

export class ReserveClient {
  reserveProgram!: anchor.Program<NftReserve>;
  provider!: anchor.Provider;

  constructor(
    conn: Connection,
    wallet: anchor.Wallet,
    reserveIdl: anchor.Idl,
    reserveProgramId: PublicKey
  ) {
    this.provider = new anchor.Provider(
      conn,
      wallet,
      anchor.Provider.defaultOptions()
    );
    anchor.setProvider(this.provider);

    this.reserveProgram = new anchor.Program<NftReserve>(
      reserveIdl as any,
      reserveProgramId,
      this.provider
    );
  }

  async findAllReserves(manager?: PublicKey): Promise<any[]> {
    const filter = manager
      ? [
          {
            memcmp: {
              offset: 8, //need to prepend 8 bytes for anchor's disc
              bytes: manager.toBase58(),
            },
          },
        ]
      : [];
    const pdas = await this.reserveProgram.account.reserve.all(filter);
    console.log(`found a total of ${pdas.length} reserve PDAs`);
    return pdas;
  }

  async findAllWhitelistProofs(reserve: PublicKey): Promise<any[]> {
    const filter = reserve
      ? [
          {
            memcmp: {
              offset: 42, //need to prepend 8 bytes for anchor's disc
              bytes: reserve.toBase58(),
            },
          },
        ]
      : [];
    const pdas = await this.reserveProgram.account.whitelistProof.all(filter);
    console.log(`found a total of ${pdas.length} whitelist proofs PDAs`);
    return pdas;
  }

  async initReserve(
    reserveAccount: Keypair,
    tokenMintKey: PublicKey,
    repurchaseQuantity: number,
    burnNfts: boolean,
    treasuryAccount: PublicKey
  ): Promise<void> {
    const [auth, auth_bump] = await PublicKey.findProgramAddress(
      [enc("token-authority"), reserveAccount.publicKey.toBytes()],
      RESERVE_PROGRAM_ID
    );
    const [store] = await PublicKey.findProgramAddress(
      [enc("token-store"), reserveAccount.publicKey.toBytes()],
      RESERVE_PROGRAM_ID
    );

    await this.reserveProgram.rpc.initReserve(
      auth_bump,
      new anchor.BN(repurchaseQuantity),
      burnNfts,
      {
        accounts: {
          reserve: reserveAccount.publicKey,
          manager: this.provider.wallet.publicKey,
          treasuryAccount: treasuryAccount
            ? treasuryAccount
            : anchor.web3.Keypair.generate().publicKey,
          tokenAuthority: auth,
          tokenStore: store,
          tokenMint: tokenMintKey,
          tokenProgram: TOKEN_PROGRAM_ID,
          rent: anchor.web3.SYSVAR_RENT_PUBKEY,
          systemProgram: anchor.web3.SystemProgram.programId,
        },
        signers: [reserveAccount],
      }
    );
  }

  async fundReserve(
    reservePk: PublicKey,
    tokenMintPk: PublicKey,
    fundAmount: number
  ): Promise<void> {
    const [store, store_bump] = await PublicKey.findProgramAddress(
      [enc("token-store"), reservePk.toBytes()],
      RESERVE_PROGRAM_ID
    );

    const managerTokenAcc = await Token.getAssociatedTokenAddress(
      ASSOCIATED_TOKEN_PROGRAM_ID,
      TOKEN_PROGRAM_ID,
      tokenMintPk,
      this.provider.wallet.publicKey
    );

    await this.reserveProgram.rpc.fundReserve(
      store_bump,
      new anchor.BN(fundAmount),
      {
        accounts: {
          reserve: reservePk,
          tokenStore: store,
          funderTokenAccount: managerTokenAcc,
          sender: this.provider.wallet.publicKey,
          tokenProgram: TOKEN_PROGRAM_ID,
        },
      }
    );
  }

  async addToWhitelist(
    reservePk: PublicKey,
    addressToWhitelist: PublicKey,
    whitelist_type: boolean
  ): Promise<void> {
    const [whitelist, whitelist_bump] = await PublicKey.findProgramAddress(
      [enc("whitelist"), reservePk.toBytes(), addressToWhitelist.toBytes()],
      RESERVE_PROGRAM_ID
    );

    await this.reserveProgram.rpc.addToWhitelist(whitelist_type, {
      accounts: {
        reserve: reservePk,
        manager: this.provider.wallet.publicKey,
        addressToWhitelist: addressToWhitelist,
        whitelistProof: whitelist,
        systemProgram: anchor.web3.SystemProgram.programId,
      },
    });
  }

  async removeFromWhitelist(
    reservePk: PublicKey,
    addressToRemove: PublicKey
  ): Promise<void> {
    const [whitelist, whitelist_bump] = await PublicKey.findProgramAddress(
      [enc("whitelist"), reservePk.toBytes(), addressToRemove.toBytes()],
      RESERVE_PROGRAM_ID
    );

    await this.reserveProgram.rpc.removeFromWhitelist(whitelist_bump, {
      accounts: {
        reserve: reservePk,
        manager: this.provider.wallet.publicKey,
        addressToRemove: addressToRemove,
        whitelistProof: whitelist,
      },
    });
  }

  async getReserveBalance(
    reservePk: PublicKey,
    tokenMintPk: PublicKey
  ): Promise<number> {
    const [store] = await PublicKey.findProgramAddress(
      [enc("token-store"), reservePk.toBytes()],
      RESERVE_PROGRAM_ID
    );
    const tokenMint = new Token(
      this.provider.connection,
      tokenMintPk,
      TOKEN_PROGRAM_ID,
      Keypair.generate()
    );
    const tokenAccount = await tokenMint.getAccountInfo(store);
    return tokenAccount.amount.toNumber();
  }

  async redeemNft(
    tokenMintPk: PublicKey,
    treasuryPk: PublicKey,
    reserve: PublicKey,
    nftMintPk: PublicKey,
    nftAccount: PublicKey,
    creatorPk: PublicKey
  ): Promise<void> {
    const [auth, authBump] = await PublicKey.findProgramAddress(
      [enc("token-authority"), reserve.toBytes()],
      this.reserveProgram.programId
    );
    const [store, storeBump] = await PublicKey.findProgramAddress(
      [enc("token-store"), reserve.toBytes()],
      this.reserveProgram.programId
    );
    const [mintProof, mintBump] = await PublicKey.findProgramAddress(
      [enc("whitelist"), reserve.toBytes(), nftMintPk.toBytes()],
      this.reserveProgram.programId
    );
    const [creatorProof, creatorBump] = await PublicKey.findProgramAddress(
      [enc("whitelist"), reserve.toBytes(), creatorPk.toBytes()],
      this.reserveProgram.programId
    );
    const metadataProgram = new PublicKey(
      "metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s"
    );
    const [metadata, metadataBump] = await PublicKey.findProgramAddress(
      [enc("metadata"), metadataProgram.toBytes(), nftMintPk.toBytes()],
      metadataProgram
    );

    const [treasuryAtaPda, treasuryAtaPdaBump] =
      await PublicKey.findProgramAddress(
        [treasuryPk.toBytes(), TOKEN_PROGRAM_ID.toBytes(), nftMintPk.toBytes()],
        ASSOCIATED_TOKEN_PROGRAM_ID
      );

    const [recTokAccPda, recTokAccPdaBump] = await PublicKey.findProgramAddress(
      [
        this.provider.wallet.publicKey.toBytes(),
        TOKEN_PROGRAM_ID.toBytes(),
        tokenMintPk.toBytes(),
      ],
      ASSOCIATED_TOKEN_PROGRAM_ID
    );

    const remainingAccounts: any[] = [];
    remainingAccounts.push({
      pubkey: mintProof,
      isWritable: false,
      isSigner: false,
    });
    remainingAccounts.push({
      pubkey: metadata,
      isWritable: false,
      isSigner: false,
    });
    remainingAccounts.push({
      pubkey: creatorProof,
      isWritable: false,
      isSigner: false,
    });

    const a = {
      reserve: reserve,
      tokenStore: store,
      tokenAuthority: auth,
      reserveTokenMint: tokenMintPk,
      recipientTokenAccount: recTokAccPda,
      treasuryAccount: treasuryPk,
      treasuryAta: treasuryAtaPda,
      nftTokenAccount: nftAccount,
      nftMint: nftMintPk,
      redeemer: this.provider.wallet.publicKey,
      rent: anchor.web3.SYSVAR_RENT_PUBKEY,
      tokenProgram: TOKEN_PROGRAM_ID,
      systemProgram: anchor.web3.SystemProgram.programId,
    };
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    //@ts-ignore
    for (const key of Object.keys(a)) {
      console.log(`${key}: ${a[key].toString()}`);
    }

    await this.reserveProgram.rpc.redeemNft(storeBump, authBump, {
      accounts: {
        reserve: reserve,
        tokenStore: store,
        tokenAuthority: auth,
        reserveTokenMint: tokenMintPk,
        recipientTokenAccount: recTokAccPda,
        treasuryAccount: treasuryPk,
        treasuryAta: treasuryAtaPda,
        nftTokenAccount: nftAccount,
        nftMint: nftMintPk,
        redeemer: this.provider.wallet.publicKey,
        rent: anchor.web3.SYSVAR_RENT_PUBKEY,
        associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
        tokenProgram: TOKEN_PROGRAM_ID,
        systemProgram: anchor.web3.SystemProgram.programId,
      },
      signers: [],
      remainingAccounts,
    });
  }
}
