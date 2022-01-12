use anchor_lang::prelude::*;
use instructions::*;

declare_id!("Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFsLnS");

#[program]
pub mod nft_reserve {
    use super::*;

    pub fn init_reserve(ctx: Context<InitReserve>) -> ProgramResult {
        instructions::init_reserve::handler(ctx);
    }

    pub fn fund_reserve(ctx: Context<FundReserve>) -> ProgramResult {
        // TODO
        Ok(())
    }

    pub fn redeem_nft(ctx: Context<RedeemNft>) -> ProgramResult {
        // TODO
        Ok(())
    }
}