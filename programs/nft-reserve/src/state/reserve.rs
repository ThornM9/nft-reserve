use anchor_lang::prelude::*;

#[account]
pub struct Reserve {
  pub manager: Pubkey,
  pub redeem_count: u64,
  pub repurchase_quantity: u64,
  pub whitelisted: bool,
}