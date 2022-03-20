use anchor_lang::prelude::*;
use solana_safe_math::{SafeMath};

use crate::state::*;

#[derive(Accounts)]
#[instruction(proof_bump: u8)]
pub struct RemoveFromWhitelist<'info> {
    // reserve
    #[account(mut, has_one = manager)]
    pub reserve: Box<Account<'info, Reserve>>,
    pub manager: Signer<'info>,

    // whitelist
    /// CHECK:
    pub address_to_remove: AccountInfo<'info>,
    #[account(mut, close=manager, has_one = reserve, seeds = [
            b"whitelist".as_ref(),
            reserve.key().as_ref(),
            address_to_remove.key().as_ref(),
        ],
        bump = proof_bump)]
    pub whitelist_proof: Box<Account<'info, WhitelistProof>>,
}

pub fn handler(ctx: Context<RemoveFromWhitelist>) -> Result<()> {
    // decrement whitelist counter on reserve
    let reserve = &mut ctx.accounts.reserve;
    let proof = &mut ctx.accounts.whitelist_proof;

    if proof.whitelist_type {
        reserve.whitelisted_creators = reserve.whitelisted_creators.safe_sub(1)?;
    } else {
        reserve.whitelisted_mints = reserve.whitelisted_mints.safe_sub(1)?;
    }

    // note: account is closed at end of instruction due to close=manager macro above
    Ok(())
}
