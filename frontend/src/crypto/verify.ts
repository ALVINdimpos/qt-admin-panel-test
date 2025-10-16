// src/crypto/verify.ts
import * as ed from "@noble/ed25519";
import { sha512 } from "@noble/hashes/sha512.js"; // note the ".js" ESM path

// Tiny concat (avoids importing @noble/hashes/utils.js)
function concatBytes(...chunks: Uint8Array[]): Uint8Array {
  let len = 0;
  for (const c of chunks) len += c.length;
  const out = new Uint8Array(len);
  let off = 0;
  for (const c of chunks) { out.set(c, off); off += c.length; }
  return out;
}

// Wire required SHA-512 for noble-ed25519 v2 (typed; no "any")
type SHA512SyncSetter = { sha512Sync: (...m: Uint8Array[]) => Uint8Array };
(ed.etc as unknown as SHA512SyncSetter).sha512Sync = (...m: Uint8Array[]) =>
  sha512(concatBytes(...m));

/** Extract raw 32-byte Ed25519 pubkey from SPKI DER (44 bytes) */
function extractRawPublicKey(spkiDer: Uint8Array): Uint8Array {
  if (spkiDer.length !== 44) {
    throw new Error(`Expected SPKI DER length 44, got ${spkiDer.length}`);
  }
  // ASN.1 header for Ed25519 SPKI:
  const hdr = new Uint8Array([0x30,0x2a,0x30,0x05,0x06,0x03,0x2b,0x65,0x70,0x03,0x21,0x00]);
  for (let i = 0; i < hdr.length; i++) {
    if (spkiDer[i] !== hdr[i]) throw new Error(`Invalid SPKI header @${i}`);
  }
  return spkiDer.slice(12, 44); // last 32 bytes are the raw key
}

/**
 * Verify an Ed25519 signature **over precomputed digest bytes**.
 * Your backend signs the digest itself; pass that digest as the "message".
 */
export async function verifySignature(
  signature: Uint8Array,
  digest: Uint8Array,
  publicKeySpkiDer: Uint8Array
): Promise<boolean> {
  try {
    const rawPub = extractRawPublicKey(publicKeySpkiDer);
    // ed.verify takes (sig, message, publicKey)
    return await ed.verify(signature, digest, rawPub);
  } catch (err) {
    console.error("Signature verification failed:", err);
    return false;
  }
}
