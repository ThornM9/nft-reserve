use anchor_lang::prelude::*;

#[account]
pub struct Reserve {
  pub manager: Pubkey,
  pub redeem_count: u64,
}