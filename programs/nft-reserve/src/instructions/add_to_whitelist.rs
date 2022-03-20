use anchor_lang::prelude::*;
use solana_safe_math::{SafeMath};

use crate::state::*;

#[derive(Accounts)]
pub struct AddToWhitelist<'info> {
    // reserve
    #[account(mut, has_one = manager)]
    pub reserve: Box<Account<'info, Reserve>>,
    pub manager: Signer<'info>,

    // whitelist
    /// CHECK:
    pub address_to_whitelist: AccountInfo<'info>,
    // must stay init_as_needed, otherwise no way to change afterwards
    #[account(init_if_needed,
        seeds = [
            b"whitelist".as_ref(),
            reserve.key().as_ref(),
            address_to_whitelist.key().as_ref(),
        ],
        bump,
        payer = payer,
        space = 8 + std::mem::size_of::<WhitelistProof>())]
    pub whitelist_proof: Box<Account<'info, WhitelistProof>>,

    // misc
    #[account(mut)]
    pub payer: Signer<'info>,
    pub system_program: Program<'info, System>,
}

pub fn handler(ctx: Context<AddToWhitelist>, whitelist_type: bool) -> Result<()> {
    // create/update whitelist proof
    let proof = &mut ctx.accounts.whitelist_proof;

    // if proof is already initialised, this is an update to the proof
    if proof.initialised {
        let reserve = &mut ctx.accounts.reserve;

        if proof.whitelist_type {
            reserve.whitelisted_creators = reserve.whitelisted_creators.safe_sub(1)?;
        } else {
            reserve.whitelisted_mints = reserve.whitelisted_mints.safe_sub(1)?;
        }
    }

    // record new proof
    proof.whitelist_type = whitelist_type;
    proof.whitelisted_address = ctx.accounts.address_to_whitelist.key();
    proof.reserve = ctx.accounts.reserve.key();

    let reserve = &mut ctx.accounts.reserve;

    if whitelist_type {
        reserve.whitelisted_creators = reserve.whitelisted_creators.safe_add(1)?;
    } else {
        reserve.whitelisted_mints = reserve.whitelisted_mints.safe_add(1)?;
    }
    
    Ok(())
}
