import * as anchor from '@project-serum/anchor';
import { Program } from '@project-serum/anchor';
import { NftReserve } from '../target/types/nft_reserve';
import { Connection, PublicKey } from '@solana/web3.js';
import { TOKEN_PROGRAM_ID, Token } from "@solana/spl-token";

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

  const program = anchor.workspace.NftReserve as Program<NftReserve>;

    // pub reserve: Box<Account<'info, Reserve>>,
    // pub manager: Signer<'info>,
    // pub token_authority: AccountInfo<'info>,
    // pub token_store: Account<'info, TokenAccount>,
    // pub token_mint: Box<Account<'info, Mint>>,

    // pub token_program: Program<'info, Token>,
    // pub rent: Sysvar<'info, Rent>,
    // pub system_program: Program<'info, System>,
  let reserveAccount: anchor.web3.Keypair, managerAccount: anchor.web3.Keypair;
  let tokenMint: Token, mintAuthority: anchor.web3.Keypair;
  beforeEach(async () => {
    reserveAccount = anchor.web3.Keypair.generate();
    managerAccount = anchor.web3.Keypair.generate();
    mintAuthority = anchor.web3.Keypair.generate();
    await airdropSol(managerAccount.publicKey, anchor.getProvider().connection);

    tokenMint =  await Token.createMint(
      anchor.getProvider().connection,
      managerAccount,
      mintAuthority.publicKey,
      null,
      0,
      TOKEN_PROGRAM_ID
    );
  })

  async function initReserve() {
    let [auth, auth_bump] = await PublicKey.findProgramAddress([
      enc("token-authority"), reserveAccount.publicKey.toBytes(),
    ], program.programId);
    let [store, store_bump] = await PublicKey.findProgramAddress([
      enc("token-store"), reserveAccount.publicKey.toBytes(),
    ], program.programId);
    const tx = await program.rpc.initReserve(store_bump, auth_bump, {
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
  });

  it('Funds the reserve', async() => {
    let {auth, auth_bump, store, store_bump} = await initReserve();
    
  })
});
