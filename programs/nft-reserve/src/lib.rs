use anchor_lang::prelude::*;
use instructions::*;
use state::*;

declare_id!("8vdqBghr2zC4uGeajcXHHD8XNpuAavtdbYUy5LcGdfm3");

pub mod instructions;
pub mod state;

#[program]
pub mod nft_reserve {
    use super::*;

    pub fn init_reserve(ctx: Context<InitReserve>, token_store_bump: u8, token_authority_bump: u8) -> ProgramResult {
        instructions::init_reserve::handler(ctx, token_store_bump, token_authority_bump)
    }

    pub fn fund_reserve(ctx: Context<FundReserve>) -> ProgramResult {
        instructions::fund_reserve::handler(ctx)
    }

    // pub fn redeem_nft(ctx: Context<RedeemNft>) -> ProgramResult {
    //     // TODO
    //     Ok(())
    // }
}