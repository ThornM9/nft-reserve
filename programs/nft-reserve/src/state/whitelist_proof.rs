use anchor_lang::prelude::*;

#[account]
pub struct WhitelistProof {
    pub whitelist_type: bool, // 0 is mint, 1 is creator
    pub initialised: bool, // checked when updating a proof
    pub whitelisted_address: Pubkey,
    pub reserve: Pubkey,
}

