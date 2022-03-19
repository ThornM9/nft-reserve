import * as anchor from "@project-serum/anchor";

export function enc(str: string): Buffer {
  return Buffer.from(anchor.utils.bytes.utf8.encode(str));
}
