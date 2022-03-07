use anchor_lang::prelude::*;

#[account]
#[derive(Default)]
pub struct Whitelist {
  pub base: Pubkey,
  pub bump: u8,
  pub root: [u8; 32],
}