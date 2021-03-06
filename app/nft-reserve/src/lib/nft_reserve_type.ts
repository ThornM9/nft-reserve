export type NftReserve = {
  "version": "0.1.0",
  "name": "nft_reserve",
  "instructions": [
    {
      "name": "initReserve",
      "accounts": [
        {
          "name": "reserve",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "manager",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "treasuryAccount",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "tokenAuthority",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "tokenStore",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "tokenMint",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "rent",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "tokenAuthorityBump",
          "type": "u8"
        },
        {
          "name": "repurchaseQuantity",
          "type": "u64"
        },
        {
          "name": "burnPurchasedTokens",
          "type": "bool"
        }
      ]
    },
    {
      "name": "addToWhitelist",
      "accounts": [
        {
          "name": "reserve",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "manager",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "addressToWhitelist",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "whitelistProof",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "whitelistType",
          "type": "bool"
        }
      ]
    },
    {
      "name": "removeFromWhitelist",
      "accounts": [
        {
          "name": "reserve",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "manager",
          "isMut": false,
          "isSigner": true
        },
        {
          "name": "addressToRemove",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "whitelistProof",
          "isMut": true,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "proofBump",
          "type": "u8"
        }
      ]
    },
    {
      "name": "fundReserve",
      "accounts": [
        {
          "name": "reserve",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "tokenStore",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "funderTokenAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "sender",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "tokenStoreBump",
          "type": "u8"
        },
        {
          "name": "amount",
          "type": "u64"
        }
      ]
    },
    {
      "name": "redeemNft",
      "accounts": [
        {
          "name": "reserve",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "tokenStore",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "tokenAuthority",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "reserveTokenMint",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "recipientTokenAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "treasuryAccount",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "treasuryAta",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "nftTokenAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "nftMint",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "redeemer",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "rent",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "associatedTokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "tokenStoreBump",
          "type": "u8"
        },
        {
          "name": "tokenAuthorityBump",
          "type": "u8"
        }
      ]
    }
  ],
  "accounts": [
    {
      "name": "reserve",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "manager",
            "type": "publicKey"
          },
          {
            "name": "treasuryAccount",
            "type": "publicKey"
          },
          {
            "name": "redeemCount",
            "type": "u64"
          },
          {
            "name": "repurchaseQuantity",
            "type": "u64"
          },
          {
            "name": "tokenMint",
            "type": "publicKey"
          },
          {
            "name": "whitelistedMints",
            "type": "u32"
          },
          {
            "name": "whitelistedCreators",
            "type": "u32"
          },
          {
            "name": "burnPurchasedTokens",
            "type": "bool"
          }
        ]
      }
    },
    {
      "name": "whitelistProof",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "whitelistType",
            "type": "bool"
          },
          {
            "name": "initialised",
            "type": "bool"
          },
          {
            "name": "whitelistedAddress",
            "type": "publicKey"
          },
          {
            "name": "reserve",
            "type": "publicKey"
          }
        ]
      }
    }
  ],
  "errors": [
    {
      "code": 6000,
      "name": "ArithmeticError",
      "msg": "failed to perform some math operation safely"
    },
    {
      "code": 6001,
      "name": "Reserved1"
    },
    {
      "code": 6002,
      "name": "Reserved2"
    },
    {
      "code": 6003,
      "name": "Reserved3"
    },
    {
      "code": 6004,
      "name": "Reserved4"
    },
    {
      "code": 6005,
      "name": "Reserved5"
    },
    {
      "code": 6006,
      "name": "Reserved6"
    },
    {
      "code": 6007,
      "name": "Reserved7"
    },
    {
      "code": 6008,
      "name": "Reserved8"
    },
    {
      "code": 6009,
      "name": "Reserved9"
    },
    {
      "code": 6010,
      "name": "Reserved10"
    },
    {
      "code": 6011,
      "name": "Reserved11"
    },
    {
      "code": 6012,
      "name": "Reserved12"
    },
    {
      "code": 6013,
      "name": "Reserved13"
    },
    {
      "code": 6014,
      "name": "Reserved14"
    },
    {
      "code": 6015,
      "name": "Reserved15"
    },
    {
      "code": 6016,
      "name": "Reserved16"
    },
    {
      "code": 6017,
      "name": "Reserved17"
    },
    {
      "code": 6018,
      "name": "Reserved18"
    },
    {
      "code": 6019,
      "name": "Reserved19"
    },
    {
      "code": 6020,
      "name": "NotWhitelisted",
      "msg": "this nft is not whitelisted by this reserve"
    },
    {
      "code": 6021,
      "name": "Reserved21"
    },
    {
      "code": 6022,
      "name": "Reserved22"
    },
    {
      "code": 6023,
      "name": "Reserved23"
    },
    {
      "code": 6024,
      "name": "Reserved24"
    },
    {
      "code": 6025,
      "name": "Reserved25"
    },
    {
      "code": 6026,
      "name": "Reserved26"
    },
    {
      "code": 6027,
      "name": "Reserved27"
    },
    {
      "code": 6028,
      "name": "Reserved28"
    },
    {
      "code": 6029,
      "name": "Reserved29"
    },
    {
      "code": 6030,
      "name": "Reserved30"
    },
    {
      "code": 6031,
      "name": "Reserved31"
    },
    {
      "code": 6032,
      "name": "Reserved32"
    },
    {
      "code": 6033,
      "name": "Reserved33"
    },
    {
      "code": 6034,
      "name": "Reserved34"
    },
    {
      "code": 6035,
      "name": "Reserved35"
    },
    {
      "code": 6036,
      "name": "Reserved36"
    },
    {
      "code": 6037,
      "name": "Reserved37"
    },
    {
      "code": 6038,
      "name": "Reserved38"
    },
    {
      "code": 6039,
      "name": "Reserved39"
    }
  ]
};

export const IDL: NftReserve = {
  "version": "0.1.0",
  "name": "nft_reserve",
  "instructions": [
    {
      "name": "initReserve",
      "accounts": [
        {
          "name": "reserve",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "manager",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "treasuryAccount",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "tokenAuthority",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "tokenStore",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "tokenMint",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "rent",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "tokenAuthorityBump",
          "type": "u8"
        },
        {
          "name": "repurchaseQuantity",
          "type": "u64"
        },
        {
          "name": "burnPurchasedTokens",
          "type": "bool"
        }
      ]
    },
    {
      "name": "addToWhitelist",
      "accounts": [
        {
          "name": "reserve",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "manager",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "addressToWhitelist",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "whitelistProof",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "whitelistType",
          "type": "bool"
        }
      ]
    },
    {
      "name": "removeFromWhitelist",
      "accounts": [
        {
          "name": "reserve",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "manager",
          "isMut": false,
          "isSigner": true
        },
        {
          "name": "addressToRemove",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "whitelistProof",
          "isMut": true,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "proofBump",
          "type": "u8"
        }
      ]
    },
    {
      "name": "fundReserve",
      "accounts": [
        {
          "name": "reserve",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "tokenStore",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "funderTokenAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "sender",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "tokenStoreBump",
          "type": "u8"
        },
        {
          "name": "amount",
          "type": "u64"
        }
      ]
    },
    {
      "name": "redeemNft",
      "accounts": [
        {
          "name": "reserve",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "tokenStore",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "tokenAuthority",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "reserveTokenMint",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "recipientTokenAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "treasuryAccount",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "treasuryAta",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "nftTokenAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "nftMint",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "redeemer",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "rent",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "associatedTokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "tokenStoreBump",
          "type": "u8"
        },
        {
          "name": "tokenAuthorityBump",
          "type": "u8"
        }
      ]
    }
  ],
  "accounts": [
    {
      "name": "reserve",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "manager",
            "type": "publicKey"
          },
          {
            "name": "treasuryAccount",
            "type": "publicKey"
          },
          {
            "name": "redeemCount",
            "type": "u64"
          },
          {
            "name": "repurchaseQuantity",
            "type": "u64"
          },
          {
            "name": "tokenMint",
            "type": "publicKey"
          },
          {
            "name": "whitelistedMints",
            "type": "u32"
          },
          {
            "name": "whitelistedCreators",
            "type": "u32"
          },
          {
            "name": "burnPurchasedTokens",
            "type": "bool"
          }
        ]
      }
    },
    {
      "name": "whitelistProof",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "whitelistType",
            "type": "bool"
          },
          {
            "name": "initialised",
            "type": "bool"
          },
          {
            "name": "whitelistedAddress",
            "type": "publicKey"
          },
          {
            "name": "reserve",
            "type": "publicKey"
          }
        ]
      }
    }
  ],
  "errors": [
    {
      "code": 6000,
      "name": "ArithmeticError",
      "msg": "failed to perform some math operation safely"
    },
    {
      "code": 6001,
      "name": "Reserved1"
    },
    {
      "code": 6002,
      "name": "Reserved2"
    },
    {
      "code": 6003,
      "name": "Reserved3"
    },
    {
      "code": 6004,
      "name": "Reserved4"
    },
    {
      "code": 6005,
      "name": "Reserved5"
    },
    {
      "code": 6006,
      "name": "Reserved6"
    },
    {
      "code": 6007,
      "name": "Reserved7"
    },
    {
      "code": 6008,
      "name": "Reserved8"
    },
    {
      "code": 6009,
      "name": "Reserved9"
    },
    {
      "code": 6010,
      "name": "Reserved10"
    },
    {
      "code": 6011,
      "name": "Reserved11"
    },
    {
      "code": 6012,
      "name": "Reserved12"
    },
    {
      "code": 6013,
      "name": "Reserved13"
    },
    {
      "code": 6014,
      "name": "Reserved14"
    },
    {
      "code": 6015,
      "name": "Reserved15"
    },
    {
      "code": 6016,
      "name": "Reserved16"
    },
    {
      "code": 6017,
      "name": "Reserved17"
    },
    {
      "code": 6018,
      "name": "Reserved18"
    },
    {
      "code": 6019,
      "name": "Reserved19"
    },
    {
      "code": 6020,
      "name": "NotWhitelisted",
      "msg": "this nft is not whitelisted by this reserve"
    },
    {
      "code": 6021,
      "name": "Reserved21"
    },
    {
      "code": 6022,
      "name": "Reserved22"
    },
    {
      "code": 6023,
      "name": "Reserved23"
    },
    {
      "code": 6024,
      "name": "Reserved24"
    },
    {
      "code": 6025,
      "name": "Reserved25"
    },
    {
      "code": 6026,
      "name": "Reserved26"
    },
    {
      "code": 6027,
      "name": "Reserved27"
    },
    {
      "code": 6028,
      "name": "Reserved28"
    },
    {
      "code": 6029,
      "name": "Reserved29"
    },
    {
      "code": 6030,
      "name": "Reserved30"
    },
    {
      "code": 6031,
      "name": "Reserved31"
    },
    {
      "code": 6032,
      "name": "Reserved32"
    },
    {
      "code": 6033,
      "name": "Reserved33"
    },
    {
      "code": 6034,
      "name": "Reserved34"
    },
    {
      "code": 6035,
      "name": "Reserved35"
    },
    {
      "code": 6036,
      "name": "Reserved36"
    },
    {
      "code": 6037,
      "name": "Reserved37"
    },
    {
      "code": 6038,
      "name": "Reserved38"
    },
    {
      "code": 6039,
      "name": "Reserved39"
    }
  ]
};
