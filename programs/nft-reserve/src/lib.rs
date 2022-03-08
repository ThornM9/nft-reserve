use anchor_lang::prelude::*;
use instructions::*;

declare_id!("8vdqBghr2zC4uGeajcXHHD8XNpuAavtdbYUy5LcGdfm3");

pub mod instructions;
pub mod state;

#[program]
pub mod nft_reserve {
    use super::*;

    pub fn init_reserve(ctx: Context<InitReserve>, token_authority_bump: u8, repurchase_quantity: u64) -> Result<()> {
        instructions::init_reserve::handler(ctx, token_authority_bump, repurchase_quantity)
    }

    pub fn set_whitelist(ctx: Context<SetWhitelist>, whitelist_bump: u8, root: [u8; 32]) -> Result<()> {
        instructions::set_whitelist::handler(ctx, whitelist_bump, root)
    }

    pub fn fund_reserve(ctx: Context<FundReserve>, token_store_bump: u8, amount: u64) -> Result<()> {
        instructions::fund_reserve::handler(ctx, token_store_bump, amount)
    }

    pub fn redeem_nft(ctx: Context<RedeemNft>, token_store_bump: u8, token_authority_bump: u8, whitelist_bump: u8, whitelist_proof: Vec<[u8; 32]>) -> Result<()> {
        instructions::redeem_nft::handler(ctx, token_store_bump, token_authority_bump, whitelist_bump, whitelist_proof)
    }
}