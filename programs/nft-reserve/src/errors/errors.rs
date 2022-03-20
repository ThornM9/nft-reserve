use anchor_lang::prelude::*;

#[error_code]
pub enum ErrorCode {
    // generic (0 - 19)
    #[msg("failed to perform some math operation safely")]
    ArithmeticError, //0x1770
    
    Reserved1,
    Reserved2,
    Reserved3,
    Reserved4,
    Reserved5,
    Reserved6,
    Reserved7,
    Reserved8,
    Reserved9,
    Reserved10,
    Reserved11,
    Reserved12,
    Reserved13,
    Reserved14,
    Reserved15,
    Reserved16,
    Reserved17,
    Reserved18,
    Reserved19,

    // reserve errors (20-39)
    #[msg("this nft is not whitelisted by this reserve")]
    NotWhitelisted,

    Reserved21,
    Reserved22,
    Reserved23,
    Reserved24,
    Reserved25,
    Reserved26,
    Reserved27,
    Reserved28,
    Reserved29,
    Reserved30,
    Reserved31,
    Reserved32,
    Reserved33,
    Reserved34,
    Reserved35,
    Reserved36,
    Reserved37,
    Reserved38,
    Reserved39,
}
