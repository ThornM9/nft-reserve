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
          "name": "whitelist",
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
        }
      ]
    },
    {
      "name": "setWhitelist",
      "accounts": [
        {
          "name": "reserve",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "whitelist",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "payer",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "whitelistBump",
          "type": "u8"
        },
        {
          "name": "root",
          "type": {
            "array": [
              "u8",
              32
            ]
          }
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
          "name": "whitelist",
          "isMut": false,
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
          "name": "recipientTokenAccount",
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
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "redeemer",
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
          "name": "tokenAuthorityBump",
          "type": "u8"
        },
        {
          "name": "whitelistBump",
          "type": "u8"
        },
        {
          "name": "whitelistProof",
          "type": {
            "vec": {
              "array": [
                "u8",
                32
              ]
            }
          }
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
            "name": "redeemCount",
            "type": "u64"
          },
          {
            "name": "repurchaseQuantity",
            "type": "u64"
          }
        ]
      }
    },
    {
      "name": "whitelist",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "base",
            "type": "publicKey"
          },
          {
            "name": "bump",
            "type": "u8"
          },
          {
            "name": "root",
            "type": {
              "array": [
                "u8",
                32
              ]
            }
          }
        ]
      }
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
          "name": "whitelist",
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
        }
      ]
    },
    {
      "name": "setWhitelist",
      "accounts": [
        {
          "name": "reserve",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "whitelist",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "payer",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "whitelistBump",
          "type": "u8"
        },
        {
          "name": "root",
          "type": {
            "array": [
              "u8",
              32
            ]
          }
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
          "name": "whitelist",
          "isMut": false,
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
          "name": "recipientTokenAccount",
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
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "redeemer",
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
          "name": "tokenAuthorityBump",
          "type": "u8"
        },
        {
          "name": "whitelistBump",
          "type": "u8"
        },
        {
          "name": "whitelistProof",
          "type": {
            "vec": {
              "array": [
                "u8",
                32
              ]
            }
          }
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
            "name": "redeemCount",
            "type": "u64"
          },
          {
            "name": "repurchaseQuantity",
            "type": "u64"
          }
        ]
      }
    },
    {
      "name": "whitelist",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "base",
            "type": "publicKey"
          },
          {
            "name": "bump",
            "type": "u8"
          },
          {
            "name": "root",
            "type": {
              "array": [
                "u8",
                32
              ]
            }
          }
        ]
      }
    }
  ]
};
