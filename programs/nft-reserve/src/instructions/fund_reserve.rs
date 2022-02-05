use anchor_lang::prelude::*;
use crate::state::*;
use anchor_spl::token::{self, Token, Mint, TokenAccount};

#[derive(Accounts)]
#[instruction(token_store_bump: u8)]
pub struct FundReserve<'info> {
    #[account(mut)]
    pub reserve: Box<Account<'info, Reserve>>,
    #[account(mut, seeds = [
            b"token-store".as_ref(),
            reserve.key().as_ref(),
        ],
        bump = token_store_bump,
    )]
    pub token_store: Account<'info, TokenAccount>,
    #[account(mut)]
    pub funder_token_account: Account<'info, TokenAccount>,
}

pub fn handler(ctx: Context<FundReserve>) -> ProgramResult {
    msg!("Reserve successfully initialised");
    Ok(())
}