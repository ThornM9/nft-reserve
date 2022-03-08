use anchor_lang::prelude::*;
use crate::state::*;

#[derive(Accounts)]
#[instruction(whitelist_bump: u8, _root: [u8; 32])]
pub struct SetWhitelist<'info> {
    #[account(mut)]
    pub reserve: Box<Account<'info, Reserve>>,

    #[account(
        mut,
        seeds = [
            b"whitelist".as_ref(),
            reserve.key().as_ref(),
        ],
        bump=whitelist_bump,
    )]
    pub whitelist: Box<Account<'info, Whitelist>>,

    #[account(mut)]
    pub payer: Signer<'info>,

    pub system_program: Program<'info, System>,
}

pub fn handler(ctx: Context<SetWhitelist>, _whitelist_bump: u8, root: [u8; 32]) -> Result<()> {
    assert_eq!(ctx.accounts.payer.key(), ctx.accounts.reserve.manager);

    let whitelist = &mut ctx.accounts.whitelist;
    whitelist.base = ctx.accounts.payer.key();
    whitelist.root = root;

    Ok(())
}