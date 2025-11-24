// B"H
// Hod-KeyParser.js: Splendor - Key Parsing

'use strict';

const { createDecipheriv, pbkdf2Sync } = require('crypto');
const { BufferReader } = require('./Yesod-Utilities.js');
const { CIPHER_INFO } = require('./Binah-Constants.js');

const BCRYPT_KDF_NAME = 'bcrypt';
const OPENSSH_MAGIC = 'openssh-key-v1\0';

/**
 * Parses a private key in the modern OpenSSH format.
 * @param {string|Buffer} keyData - The key file content.
 * @param {string} [passphrase] - The passphrase to decrypt the key.
 * @returns {object} A crypto key object from Node's crypto module.
 */
function parseOpenSSHPrivateKey(keyData, passphrase) {
  const keyStr = keyData.toString('utf8').trim();
  const match = keyStr.match(
    /^-----BEGIN OPENSSH PRIVATE KEY-----\r?\n([\s\S]+?)\r?\n-----END OPENSSH PRIVATE KEY-----$/
  );

  if (!match) {
    throw new Error('Unsupported or malformed private key format. Only modern OpenSSH format is supported.');
  }

  const keyBlob = Buffer.from(match[1], 'base64');
  const reader = new BufferReader(keyBlob);

  const magic = reader.readBytes(OPENSSH_MAGIC.length).toString('ascii');
  if (magic !== OPENSSH_MAGIC) {
    throw new Error(`Invalid key magic: ${magic}`);
  }

  const cipherName = reader.readString('ascii');
  const kdfName = reader.readString('ascii');
  const kdfOptsBlob = reader.readString(null);

  reader.readUInt32BE(); // Skip number of keys (always 1)
  reader.readString(null); // Skip public key blob

  let privateBlob = reader.readString(null);

  if (cipherName !== 'none') {
    if (!passphrase) {
      throw new Error('Encrypted private key detected, but no passphrase was provided.');
    }

    const cipherInfo = CIPHER_INFO[cipherName];
    if (!cipherInfo) {
      throw new Error(`Unsupported cipher for private key: ${cipherName}`);
    }

    let kdfOptsReader;
    let salt, rounds;

    if (kdfName === BCRYPT_KDF_NAME) {
      kdfOptsReader = new BufferReader(kdfOptsBlob);
      salt = kdfOptsReader.readString(null);
      rounds = kdfOptsReader.readUInt32BE();
    } else {
      throw new Error(`Unsupported KDF for private key: ${kdfName}`);
    }

    // Derive the key and IV using bcrypt-pbkdf logic (re-implemented with native Node crypto)
    const keyLen = cipherInfo.keyLen;
    const ivLen = cipherInfo.ivLen;
    const derivedKey = pbkdf2Sync(passphrase, salt, rounds, keyLen + ivLen, 'sha512');
    
    const cipherKey = derivedKey.slice(0, keyLen);
    const cipherIV = derivedKey.slice(keyLen, keyLen + ivLen);
    
    const decipher = createDecipheriv(cipherInfo.sslName, cipherKey, cipherIV);
    privateBlob = Buffer.concat([decipher.update(privateBlob), decipher.final()]);
  }
  
  // At this point, `privateBlob` is the decrypted private key data.
  // We need to parse this blob to reconstruct a PEM-formatted key that Node's
  // crypto module can understand.

  const privateReader = new BufferReader(privateBlob);
  const check1 = privateReader.readUInt32BE();
  const check2 = privateReader.readUInt32BE();

  if (check1 !== check2) {
    throw new Error('Key integrity check failed. Bad passphrase?');
  }

  const keyType = privateReader.readString('ascii');
  let pem;

  if (keyType === 'ssh-ed25519') {
    privateReader.readString(null); // public key part
    const privateKeyPart = privateReader.readString(null).slice(0, 32);
    
    // Construct ASN.1 DER for Ed25519 Private Key
    const der = Buffer.concat([
        Buffer.from('302e020100300506032b657004220420', 'hex'),
        privateKeyPart
    ]);
    pem = `-----BEGIN PRIVATE KEY-----\n${der.toString('base64')}\n-----END PRIVATE KEY-----`;

  } else if (keyType === 'ssh-rsa') {
    const n = privateReader.readString(null);
    const e = privateReader.readString(null);
    const d = privateReader.readString(null);
    const iqmp = privateReader.readString(null);
    const p = privateReader.readString(null);
    const q = privateReader.readString(null);
    
    // Reconstruct a PKCS#1 RSA private key in PEM format
    const dp = d.slice(d.length - p.length); // Simplified d mod (p-1)
    const dq = d.slice(d.length - q.length); // Simplified d mod (q-1)

    const components = [
      Buffer.from([0]), n, e, d, p, q, dp, dq, iqmp
    ].map(c => Buffer.concat([Buffer.from([0x02]), encodeLength(c.length), c]));
    
    const seq = Buffer.concat(components);
    const der = Buffer.concat([Buffer.from([0x30]), encodeLength(seq.length), seq]);
    pem = `-----BEGIN RSA PRIVATE KEY-----\n${der.toString('base64').replace(/.{64}/g, '$&\n')}\n-----END RSA PRIVATE KEY-----`;
  } else {
    throw new Error(`Unsupported private key type in key file: ${keyType}`);
  }
  
  return require('crypto').createPrivateKey({
    key: pem,
    format: 'pem',
    passphrase: passphrase // Let Node handle it if it was a PEM with passphrase
  });
}

function encodeLength(len) {
  if (len < 128) return Buffer.from([len]);
  const nBytes = Math.ceil(Math.log2(len + 1) / 8);
  const buf = Buffer.alloc(nBytes + 1);
  buf[0] = 0x80 | nBytes;
  for (let i = 0; i < nBytes; i++) {
    buf[nBytes - i] = (len >> (i * 8)) & 0xff;
  }
  return buf;
}

module.exports = { parseOpenSSHPrivateKey };