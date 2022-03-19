import * as anchor from "@project-serum/anchor";
import { Connection, Keypair, PublicKey } from "@solana/web3.js";
import { Token } from "@solana/spl-token";
import { NftReserve } from "./nft_reserve_type";
import { enc } from "@/lib/utils";
import { RESERVE_PROGRAM_ID } from "./constants";
import { TOKEN_PROGRAM_ID } from "@solana/spl-token";

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

  async findAllReserves(manager: PublicKey): Promise<any[]> {
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

  async initReserve(
    reserveAccount: Keypair,
    tokenMintKey: PublicKey,
    repurchaseQuantity: number
  ): Promise<void> {
    const [auth, auth_bump] = await PublicKey.findProgramAddress(
      [enc("token-authority"), reserveAccount.publicKey.toBytes()],
      RESERVE_PROGRAM_ID
    );
    const [store] = await PublicKey.findProgramAddress(
      [enc("token-store"), reserveAccount.publicKey.toBytes()],
      RESERVE_PROGRAM_ID
    );
    const [whitelist] = await PublicKey.findProgramAddress(
      [enc("whitelist"), reserveAccount.publicKey.toBytes()],
      RESERVE_PROGRAM_ID
    );

    await this.reserveProgram.rpc.initReserve(
      auth_bump,
      new anchor.BN(repurchaseQuantity),
      {
        accounts: {
          reserve: reserveAccount.publicKey,
          manager: this.provider.wallet.publicKey,
          tokenAuthority: auth,
          tokenStore: store,
          whitelist: whitelist,
          tokenMint: tokenMintKey,
          tokenProgram: TOKEN_PROGRAM_ID,
          rent: anchor.web3.SYSVAR_RENT_PUBKEY,
          systemProgram: anchor.web3.SystemProgram.programId,
        },
        signers: [reserveAccount],
      }
    );
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
}
