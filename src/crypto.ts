const PASSWORD_GENERATION_COST = 110000;

interface WrappedKey {
  privateKey: string;
  passwordIv: string;
  wrapperIv: string;
}

interface Cipher {
  key: string;
  ciphertext: string;
  iv: string;
}

const arrayBufferToString = (buffer: ArrayBuffer) =>
  new Uint8Array(buffer).reduce(
    (acc, val) => acc + String.fromCharCode(val),
    ""
  );

const stringToArrayBuffer = (val: string) =>
  new Uint8Array(val.split("").map((x) => x.charCodeAt(0)));

const arrayBufferToHexString = (arrayBuffer: ArrayBuffer) =>
  new Uint8Array(arrayBuffer).reduce(
    (acc, v) => acc + v.toString(16).padStart(2, "0"),
    ""
  );

function hexStringToArrayBuffer(hexString: string) {
  return new Uint8Array(
    hexString.match(/.{1,2}/g)!.map((byte) => parseInt(byte, 16))
  );
}

const stretchPassword = async (password: string, salt: Uint8Array) => {
  const key = await crypto.subtle.importKey(
    "raw",
    stringToArrayBuffer(password),
    { name: "PBKDF2" },
    false,
    ["deriveBits"]
  );

  return crypto.subtle.deriveBits(
    {
      name: "PBKDF2",
      salt,
      iterations: PASSWORD_GENERATION_COST,
      hash: { name: "SHA-512" },
    },
    key,
    256
  );
};

const aesIv = () => crypto.getRandomValues(new Uint8Array(96));

const pbkIv = () => crypto.getRandomValues(new Uint8Array(32));

const makeRSAKey = () =>
  crypto.subtle.generateKey(
    {
      name: "RSA-OAEP",
      modulusLength: 2048,
      publicExponent: new Uint8Array([0x01, 0x00, 0x01]),
      hash: "SHA-256",
    },
    true,
    ["encrypt", "decrypt", "wrapKey", "unwrapKey"]
  );

const encryptMessage_ = async (keys: CryptoKey[], plaintext: string) => {
  const messageKey = await crypto.subtle.generateKey(
    { name: "AES-GCM", length: 256 },
    true,
    ["encrypt", "decrypt"]
  );

  const iv = aesIv();

  const ciphertext = await crypto.subtle.encrypt(
    {
      name: "AES-GCM",
      length: 256,
      iv,
    },
    messageKey,
    stringToArrayBuffer(plaintext)
  );

  const wrappedKeys = (
    await Promise.all(
      keys.map((key) =>
        crypto.subtle.wrapKey("jwk", messageKey, key, {
          name: "RSA-OAEP",
        })
      )
    )
  ).map(arrayBufferToHexString);

  return {
    wrappedKeys,
    ciphertext: arrayBufferToHexString(ciphertext),
    iv: arrayBufferToHexString(iv),
  };
};

const decryptMessage_ = async (key: CryptoKey, cipher: Cipher) => {
  const iv = hexStringToArrayBuffer(cipher.iv);

  const messageKey = await crypto.subtle.unwrapKey(
    "jwk",
    hexStringToArrayBuffer(cipher.key),
    key,
    { name: "RSA-OAEP" },
    { name: "AES-GCM" },
    true,
    ["decrypt"]
  );

  return arrayBufferToString(
    await crypto.subtle.decrypt(
      { name: "AES-GCM", iv },
      messageKey,
      hexStringToArrayBuffer(cipher.ciphertext)
    )
  );
};

const createKeys = async () => {
  const keys = await makeRSAKey();

  return {
    publicKey: await crypto.subtle.exportKey("jwk", keys.publicKey),
    privateKey: await crypto.subtle.exportKey("jwk", keys.privateKey),
  };
};

const wrapKey = async (privateKey: JsonWebKey, password: string) => {
  const key = await crypto.subtle.importKey(
    "jwk",
    privateKey,
    { name: "RSA-OAEP", hash: "SHA-256" },
    true,
    ["decrypt", "unwrapKey"]
  );

  const iv = aesIv();
  const ivPw = pbkIv();

  const aesAlg = {
    name: "AES-GCM",
    length: 256,
    iv,
  };

  const wrapper = await crypto.subtle.importKey(
    "raw",
    await stretchPassword(password, ivPw),
    aesAlg,
    true,
    ["wrapKey", "unwrapKey"]
  );

  const wrapped = await crypto.subtle.wrapKey("jwk", key, wrapper, aesAlg);

  return {
    privateKey: arrayBufferToHexString(wrapped),
    passwordIv: arrayBufferToHexString(ivPw),
    wrapperIv: arrayBufferToHexString(iv),
  };
};

const unwrapKey = async (wrappedKey: WrappedKey, password: string) => {
  const ivWrapper = hexStringToArrayBuffer(wrappedKey.wrapperIv);
  const ivPw = hexStringToArrayBuffer(wrappedKey.passwordIv);

  const rsaAlg = {
    name: "RSA-OAEP",
    hash: "SHA-256",
    publicExponent: new Uint8Array([1, 0, 1]),
    modulusLength: 2048,
  };

  const aesAlg = {
    name: "AES-GCM",
    length: 256,
    iv: ivWrapper,
  };

  const wrapper = await crypto.subtle.importKey(
    "raw",
    await stretchPassword(password, ivPw),
    { name: "AES-GCM" },
    true,
    ["wrapKey", "unwrapKey"]
  );

  const key = await crypto.subtle.unwrapKey(
    "jwk",
    hexStringToArrayBuffer(wrappedKey.privateKey),
    wrapper,
    aesAlg,
    rsaAlg,
    true,
    ["decrypt", "unwrapKey"]
  );

  return key ? await crypto.subtle.exportKey("jwk", key) : null;
};

const decryptMessage = async (privateKey: JsonWebKey, cipher: Cipher) => {
  const keyData = await crypto.subtle.importKey(
    "jwk",
    privateKey,
    { name: "RSA-OAEP", hash: "SHA-256" },
    false,
    ["unwrapKey"]
  );

  return decryptMessage_(keyData, cipher);
};

const encryptMessage = async (plaintext: string, publicKeys: JsonWebKey[]) => {
  if (publicKeys.length < 1) {
    throw Error("no pubs");
  }

  const keys = await Promise.all(
    publicKeys.map((key) =>
      crypto.subtle.importKey(
        "jwk",
        key,
        { name: "RSA-OAEP", hash: "SHA-256" },
        false,
        ["wrapKey"]
      )
    )
  );

  return encryptMessage_(keys, plaintext);
};

export { createKeys, encryptMessage, wrapKey, unwrapKey, decryptMessage };
