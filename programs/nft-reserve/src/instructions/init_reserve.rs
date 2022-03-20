use anchor_lang::prelude::*;
use crate::state::*;
use anchor_spl::token::{Token, Mint, TokenAccount};


#[derive(Accounts)]
#[instruction(token_authority_bump: u8)]
pub struct InitReserve<'info> {
    #[account(init, payer=manager, space=8 + std::mem::size_of::<Reserve>())]
    pub reserve: Box<Account<'info, Reserve>>,
    #[account(mut)]
    pub manager: Signer<'info>,
    #[account(
        seeds = [
            b"token-authority".as_ref(),
            reserve.key().as_ref(),
        ],
        bump = token_authority_bump,
    )]
    /// CHECK: This is not dangerous because only the key is used and it's a PDA checked by anchor
    pub token_authority: AccountInfo<'info>,
    #[account(init,
        seeds = [
            b"token-store".as_ref(),
            reserve.key().as_ref(),
        ],
        bump,
        token::mint = token_mint,
        token::authority = token_authority,
        payer = manager,
    )]
    pub token_store: Account<'info, TokenAccount>,
    pub token_mint: Box<Account<'info, Mint>>,

    pub token_program: Program<'info, Token>,
    pub rent: Sysvar<'info, Rent>,
    pub system_program: Program<'info, System>,
}

pub fn handler(ctx: Context<InitReserve>, _token_authority_bump: u8, repurchase_quantity: u64) -> Result<()> {
    let reserve = &mut ctx.accounts.reserve;
    
    reserve.manager = ctx.accounts.manager.key();
    reserve.redeem_count = 0;
    reserve.repurchase_quantity = repurchase_quantity;
    reserve.token_mint = ctx.accounts.token_mint.key();

    msg!("Reserve successfully initialised");
    Ok(())
}