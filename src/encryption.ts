import { ec } from "elliptic";

const ecCurve = new ec("secp256k1");

export function performDiffieHellman(
  keyPair: ec.KeyPair,
  otherPartyPublicKeyHex: string
): Promise<CryptoKey> {
  const otherPartyPublicKey = ecCurve.keyFromPublic(
    otherPartyPublicKeyHex,
    "hex"
  );
  const sharedSecret = keyPair.derive(otherPartyPublicKey.getPublic()); // DHKE shared secret
  return crypto.subtle.importKey(
    "raw",
    new Uint8Array(sharedSecret.toArray()),
    { name: "AES-GCM" },
    false,
    ["encrypt", "decrypt"]
  );
}

export async function decryptBytes(
  enc: Uint8Array,
  sharedKey: CryptoKey
): Promise<Uint8Array> {
  const coverKey = enc.slice(0, 60);
  const coverIv = enc.slice(60, 72);
  const messageData = enc.slice(72);

  const decryptedData = await crypto.subtle.decrypt(
    { name: "AES-GCM", iv: coverIv },
    sharedKey,
    coverKey
  );

  const messageKey = await crypto.subtle.importKey(
    "raw",
    decryptedData.slice(0, 32),
    { name: "AES-GCM", length: 256 },
    true,
    ["encrypt", "decrypt"]
  );

  const messageIv = decryptedData.slice(32);
  const decryptedMsg = await crypto.subtle.decrypt(
    { name: "AES-GCM", iv: messageIv },
    messageKey,
    messageData
  );

  return new Uint8Array(decryptedMsg);
}

export async function encryptBytes(
  message: Uint8Array,
  sharedKey: CryptoKey
): Promise<Uint8Array> {
  const messageIv = crypto.getRandomValues(new Uint8Array(12));
  const messageKey = await crypto.subtle.generateKey(
    { name: "AES-GCM", length: 256 },
    true,
    ["encrypt", "decrypt"]
  );

  const encryptedData = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv: messageIv },
    messageKey,
    message
  );

  const exportedKey = await crypto.subtle.exportKey("raw", messageKey);
  const keyIv = crypto.getRandomValues(new Uint8Array(12));
  const keyData = new Uint8Array([
    ...new Uint8Array(exportedKey),
    ...messageIv,
  ]);

  const encryptedKey = await crypto.subtle.encrypt(
    {
      name: "AES-GCM",
      iv: keyIv,
    },
    sharedKey,
    keyData
  );

  return new Uint8Array([
    ...new Uint8Array(encryptedKey),
    ...keyIv,
    ...new Uint8Array(encryptedData),
  ]);
}

export async function deriveKeyPair(
  signatureSeed: Uint8Array
): Promise<{ keyPair: ec.KeyPair; publicKeyHex: string }> {
  const hkdfInfo = new TextEncoder().encode("Key derivation for conversation");

  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    signatureSeed,
    { name: "HKDF" },
    false,
    ["deriveBits"]
  );

  // Derive 256 bits (32 bytes) of key material for the private key
  const privateKeyBits = await crypto.subtle.deriveBits(
    {
      name: "HKDF",
      hash: "SHA-256",
      salt: new Uint8Array(32), // No random salt, fixed value of 32 zeroed bytes
      info: hkdfInfo,
    },
    keyMaterial,
    256
  );

  const keyPair = ecCurve.keyFromPrivate(new Uint8Array(privateKeyBits));
  const publicKeyHex = keyPair.getPublic("hex");

  return { keyPair, publicKeyHex };
}
