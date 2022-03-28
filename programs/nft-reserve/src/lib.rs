use anchor_lang::prelude::*;
use instructions::*;

declare_id!("3mk9JnpeBbfdo58S4R4SMHy9m1sFENseiHCJCN9xSUZ1");

pub mod instructions;
pub mod state;
pub mod errors;

#[program]
pub mod nft_reserve {
    use super::*;

    pub fn init_reserve(ctx: Context<InitReserve>, token_authority_bump: u8, repurchase_quantity: u64, burn_purchased_tokens: bool) -> Result<()> {
        instructions::init_reserve::handler(ctx, token_authority_bump, repurchase_quantity, burn_purchased_tokens)
    }

    pub fn add_to_whitelist(ctx: Context<AddToWhitelist>, whitelist_type: bool) -> Result<()> {
        instructions::add_to_whitelist::handler(ctx, whitelist_type)
    }

    pub fn remove_from_whitelist(ctx: Context<RemoveFromWhitelist>, _proof_bump: u8) -> Result<()> {
        instructions::remove_from_whitelist::handler(ctx)
    }

    pub fn fund_reserve(ctx: Context<FundReserve>, token_store_bump: u8, amount: u64) -> Result<()> {
        instructions::fund_reserve::handler(ctx, token_store_bump, amount)
    }

    pub fn redeem_nft(ctx: Context<RedeemNft>, token_store_bump: u8, token_authority_bump: u8) -> Result<()> {
        instructions::redeem_nft::handler(ctx, token_store_bump, token_authority_bump)
    }
}