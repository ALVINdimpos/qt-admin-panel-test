export async function sha384(input: Uint8Array | string): Promise<Uint8Array> {
  const bytes = typeof input === "string" ? new TextEncoder().encode(input) : input;
  const buffer = bytes.buffer instanceof ArrayBuffer ? bytes.buffer : new ArrayBuffer(bytes.byteLength);
  const digest = await crypto.subtle.digest("SHA-384", buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength));
  return new Uint8Array(digest);
}
