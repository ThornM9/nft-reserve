use std::str::FromStr;
use anchor_lang::prelude::*;
use solana_safe_math::{SafeMath};
use anchor_spl::token::{self, Token, TokenAccount, Transfer, Burn, Mint};
use solana_program::{
    program_option::COption,
};
use metaplex_token_metadata::state::Metadata;
use crate::{state::*, errors::errors::ErrorCode};

#[derive(Accounts)]
#[instruction(token_store_bump: u8, token_authority_bump: u8)]
pub struct RedeemNft<'info> {
    #[account(mut)]
    pub reserve: Box<Account<'info, Reserve>>,
    #[account(mut, seeds = [
            b"token-store".as_ref(),
            reserve.key().as_ref(),
        ],
        bump = token_store_bump,
    )]
    pub token_store: Account<'info, TokenAccount>,
    #[account(
        seeds = [
            b"token-authority".as_ref(),
            reserve.key().as_ref(),
        ],
        bump = token_authority_bump,
    )]
    /// CHECK: This is not dangerous because only the key is used and it's a PDA checked by anchor
    pub token_authority: AccountInfo<'info>,
    #[account(mut)]
    pub recipient_token_account: Account<'info, TokenAccount>, // where funds are deposited

    #[account(mut)]
    pub nft_token_account: Account<'info, TokenAccount>, // where nft is taken from
    #[account(mut)]
    pub nft_mint: Box<Account<'info, Mint>>,

    #[account(mut)]
    pub redeemer: Signer<'info>,
    pub token_program: Program<'info, Token>,
}

impl<'info> RedeemNft<'info> {
    fn transfer_to_redeemer_ctx(&self) -> CpiContext<'_, '_, '_, 'info, Transfer<'info>> {
        let cpi_accounts = Transfer {
            from: self.token_store.to_account_info(),
            to: self.recipient_token_account.to_account_info(),
            authority: self.token_authority.to_account_info(),
        };
        CpiContext::new(self.token_program.to_account_info(), cpi_accounts)
    }

    fn burn_ctx(&self) -> CpiContext<'_, '_, '_, 'info, Burn<'info>> {
        let cpi_accounts = Burn {
            mint: self.nft_mint.to_account_info(),
            to: self.nft_token_account.to_account_info(),
            authority: self.redeemer.to_account_info(),
        };
        CpiContext::new(self.token_program.to_account_info(), cpi_accounts)
    }
}

fn assert_valid_metadata(
    gem_metadata: &AccountInfo,
    gem_mint: &Pubkey,
) -> core::result::Result<Metadata, ProgramError> {
    let metadata_program = Pubkey::from_str("metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s").unwrap();

    // 1 verify the owner of the account is metaplex's metadata program
    assert_eq!(gem_metadata.owner, &metadata_program);

    // 2 verify the PDA seeds match
    let seed = &[
        b"metadata".as_ref(),
        metadata_program.as_ref(),
        gem_mint.as_ref(),
    ];

    let (metadata_addr, _bump) = Pubkey::find_program_address(seed, &metadata_program);
    assert_eq!(metadata_addr, gem_metadata.key());

    Metadata::from_account_info(gem_metadata)
}

fn assert_valid_whitelist_proof<'info>(
    whitelist_proof: &AccountInfo<'info>,
    reserve: &Pubkey,
    address_to_whitelist: &Pubkey,
    program_id: &Pubkey,
    expected_whitelist_type: bool,
) -> Result<()> {
    // 1 verify the PDA seeds match
    let seed = &[
        b"whitelist".as_ref(),
        reserve.as_ref(),
        address_to_whitelist.as_ref(),
    ];
    let (whitelist_addr, _bump) = Pubkey::find_program_address(seed, program_id);

    // we can't use an assert_eq statement, we want to catch this error and continue along to creator testing
    if whitelist_addr != whitelist_proof.key() {
        return Err(error!(ErrorCode::NotWhitelisted));
    }

    // 2 no need to verify ownership, deserialization does that for us
    // https://github.com/project-serum/anchor/blob/fcb07eb8c3c9355f3cabc00afa4faa6247ccc960/lang/src/account.rs#L36
    let proof = Account::<'info, WhitelistProof>::try_from(whitelist_proof)?;

    msg!("{}", proof.initialised);
    // check that the proof is initialised and correct whitelist type
    if !proof.initialised || proof.whitelist_type != expected_whitelist_type {
        return Err(error!(ErrorCode::NotWhitelisted));
    }

    Ok(())
}

fn assert_whitelisted(ctx: &Context<RedeemNft>) -> Result<()> {
    let reserve = &*ctx.accounts.reserve;
    let mint = &*ctx.accounts.nft_mint;
    let remaining_accs = &mut ctx.remaining_accounts.iter();

    // whitelisted mint is always the 1st optional account
    // this is because it's applicable to both NFTs and standard fungible tokens
    let mint_whitelist_proof_info = next_account_info(remaining_accs)?;

    // attempt to verify based on mint
    if reserve.whitelisted_mints > 0 {
        if let Ok(()) = assert_valid_whitelist_proof(
            mint_whitelist_proof_info,
            &reserve.key(),
            &mint.key(),
            ctx.program_id,
            false,
        ) {
            // msg!("mint whitelisted: {}, going ahead", &mint.key());
            return Ok(());
        }
    }

    // if mint verification above failed, attempt to verify based on creator
    if reserve.whitelisted_creators > 0 {
        // 2 additional accounts are expected - metadata and creator whitelist proof
        let metadata_info = next_account_info(remaining_accs)?;
        let creator_whitelist_proof_info = next_account_info(remaining_accs)?;

        // verify metadata is legit
        let metadata = assert_valid_metadata(metadata_info, &mint.key())?;

        // metaplex constraints this to max 5, so won't go crazy on compute
        // (empirical testing showed there's practically 0 diff between stopping at 0th and 5th creator)
        for creator in &metadata.data.creators.unwrap() {
            // verify creator actually signed off on this nft
            if !creator.verified {
                continue;
            }

            // check if creator is whitelisted, returns an error if not
            let attempted_proof = assert_valid_whitelist_proof(
                creator_whitelist_proof_info,
                &reserve.key(),
                &creator.address,
                ctx.program_id,
                true,
            );

            match attempted_proof {
                //proof succeeded, return out of the function, no need to continue looping
                Ok(()) => return Ok(()),
                //proof failed, continue to check next creator
                Err(_e) => continue,
            }
        }
    }
    // if both conditions above failed to return Ok(()), then verification failed
    Err(error!(ErrorCode::NotWhitelisted))
}

fn assert_valid_token_account<'info>(nft_token_account: &AccountInfo<'info>, nft_mint: &Pubkey, treasury: &Pubkey) {
    let token_program = Pubkey::from_str("TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA").unwrap();
    let associated_token_program = Pubkey::from_str("ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL").unwrap();

    // verify the owner of the account is the spl token program
    assert_eq!(nft_token_account.owner, &token_program);

    // verify the PDA seeds match
    let seeds = &[
        treasury.as_ref(),
        token_program.as_ref(),
        nft_mint.as_ref(),
    ];
    let (ata_address, _bump) = Pubkey::find_program_address(seeds, &associated_token_program);
    assert_eq!(ata_address, nft_token_account.key())
}

pub fn handler<'a, 'b, 'c, 'info>(ctx: Context<'a,'b,'c,'info, RedeemNft<'info>>, _token_store_bump: u8, token_authority_bump: u8) -> Result<()> {
    let remaining_accs = &mut ctx.remaining_accounts.iter();

    // check we're burning an nft and not a random spl token
    assert_eq!(ctx.accounts.nft_mint.supply, 1);
    assert_eq!(ctx.accounts.nft_mint.decimals, 0);
    assert_eq!(ctx.accounts.nft_mint.mint_authority, COption::None);

    // check that the nft is whitelisted
    let reserve = &*ctx.accounts.reserve;
    if reserve.whitelisted_mints > 0 || reserve.whitelisted_creators > 0 {
        assert_whitelisted(&ctx)?;
    } else {
        return Err(error!(ErrorCode::NotWhitelisted));
    }

    if reserve.burn_purchased_tokens {
        // burn the nft
        token::burn(ctx.accounts.burn_ctx(), 1)?;
    } else {
        // optional account required if sending nfts to the treasury. this should be an ata owned by the treasury account
        let treasury_ata = next_account_info(remaining_accs)?;

        // assert it's a valid account (owned by the treasury, valid TokenAccount struct)
        assert_valid_token_account(treasury_ata, &ctx.accounts.nft_mint.key(), &ctx.accounts.reserve.treasury_account);
        
        // transfer nft to the ata
        let cpi_accounts = Transfer {
            from: ctx.accounts.nft_token_account.to_account_info(),
            to: treasury_ata.clone(),
            authority: ctx.accounts.redeemer.to_account_info(),
        };
        token::transfer(
            CpiContext::new(
                ctx.accounts.token_program.to_account_info(), 
                cpi_accounts
            ), 1
        )?;
    }

    // send tokens from store to redeemer
    token::transfer(
        ctx.accounts
            .transfer_to_redeemer_ctx()
            .with_signer(&[&[b"token-authority".as_ref(), ctx.accounts.reserve.key().as_ref(), &[token_authority_bump]]]), 
        ctx.accounts.reserve.repurchase_quantity
    )?;
    ctx.accounts.reserve.redeem_count = ctx.accounts.reserve.redeem_count.safe_add(1)?;
    Ok(())
}