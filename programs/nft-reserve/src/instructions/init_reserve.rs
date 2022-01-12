use anchor_lang::prelude::*;
use crate::state::*;

#[derive(Accounts)]
pub struct InitReserve<'info> {
    #[account(init, payer=payer, space=8 + std::mem::size_of::<Reserve>())]
    pub reserve: Box<Account<'info, Reserve>>,
    pub manager: Signer<'info>,

    #[account(mut)]
    pub payer: Signer<'info>,
    pub system_program: Program<'info, System>,
}

pub fn handler(ctx: Context<InitReserve>) -> ProgramResult {
    let reserve = &mut ctx.accounts.reserve;

    reserve.manager = ctx.accounts.manager.key();
    reserve.redeem_count = 0;

    msg!("Reserve successfully initialised");
    Ok(());
}