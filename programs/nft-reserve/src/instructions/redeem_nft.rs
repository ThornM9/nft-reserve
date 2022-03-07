use anchor_lang::prelude::*;
use crate::state::*;
use anchor_spl::token::{self, Token, TokenAccount, Transfer, Burn, Mint};
use solana_program::{
    program_option::COption,
};

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
    pub recipient_token_account: Account<'info, TokenAccount>,

    #[account(mut)]
    pub nft_token_account: Account<'info, TokenAccount>,
    #[account(mut)]
    pub nft_mint: Box<Account<'info, Mint>>,

    #[account(mut)]
    pub redeemer: Signer<'info>,
    pub token_program: Program<'info, Token>,
}

impl<'info> RedeemNft<'info> {
    fn transfer_ctx(&self) -> CpiContext<'_, '_, '_, 'info, Transfer<'info>> {
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

pub fn handler(ctx: Context<RedeemNft>, _token_store_bump: u8, token_authority_bump: u8) -> Result<()> {
    // check we're burning an nft and not a random spl token
    assert_eq!(ctx.accounts.nft_mint.supply, 1);
    assert_eq!(ctx.accounts.nft_mint.decimals, 0);
    assert_eq!(ctx.accounts.nft_mint.mint_authority, COption::None);

    // burn the nft
    token::burn(ctx.accounts.burn_ctx(), 1)?;

    // send tokens from store to redeemer
    token::transfer(
        ctx.accounts
            .transfer_ctx()
            .with_signer(&[&[b"token-authority".as_ref(), ctx.accounts.reserve.key().as_ref(), &[token_authority_bump]]]), 
        ctx.accounts.reserve.repurchase_quantity
    )?;
    ctx.accounts.reserve.redeem_count = ctx.accounts.reserve.redeem_count + 1;
    Ok(())
}