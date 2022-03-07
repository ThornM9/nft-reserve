use anchor_lang::prelude::*;
use crate::state::*;
use anchor_spl::token::{self, Token, TokenAccount, Transfer};

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
    #[account(mut)]
    pub sender: Signer<'info>,
    pub token_program: Program<'info, Token>,
}

impl<'info> FundReserve<'info> {
    fn transfer_ctx(&self) -> CpiContext<'_, '_, '_, 'info, Transfer<'info>> {
        let cpi_accounts = Transfer {
            from: self.funder_token_account.to_account_info(),
            to: self.token_store.to_account_info(),
            authority: self.sender.to_account_info(),
        };
        CpiContext::new(self.token_program.to_account_info(), cpi_accounts)
    }
}

pub fn handler(ctx: Context<FundReserve>, _token_store_bump: u8, amount: u64) -> Result<()> {
    token::transfer(ctx.accounts.transfer_ctx(), amount)?;
    Ok(())
}