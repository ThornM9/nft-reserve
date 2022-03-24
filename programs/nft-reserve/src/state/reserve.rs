use anchor_lang::prelude::*;

#[account]
pub struct Reserve {
  pub manager: Pubkey,
  pub treasury_account: Pubkey,
  pub redeem_count: u64,
  pub repurchase_quantity: u64,
  pub token_mint: Pubkey,
  pub whitelisted_mints: u32,
  pub whitelisted_creators: u32,
  pub burn_purchased_tokens: bool,
}