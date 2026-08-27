// B"H

/**
 * @file utils/crypto/passwordBox.js
 * @chapter The Locked Letter
 * @description Tiny authenticated password encryption using Node's built-in crypto.
 */

const crypto = require('crypto');

const ALG = 'aes-256-gcm';
const KDF = 'sha256';
const ITERS = 120000;

/**
 * @class PasswordBox
 * @description Password-derived AES-GCM envelope.
 */
class PasswordBox {
  /**
   * @static
   * @method seal
   * @param {*} value - JSON-safe value.
   * @param {string} password - Password.
   * @returns {object} Encrypted envelope.
   */
  static seal(value, password) {
    const salt = crypto.randomBytes(16);
    const iv = crypto.randomBytes(12);
    const key = crypto.pbkdf2Sync(String(password), salt, ITERS, 32, KDF);
    const cipher = crypto.createCipheriv(ALG, key, iv);
    const plain = Buffer.from(JSON.stringify(value), 'utf8');
    const body = Buffer.concat([cipher.update(plain), cipher.final()]);

    return {
      __awtsmoosEncrypted: true,
      alg: ALG,
      kdf: KDF,
      iters: ITERS,
      salt: salt.toString('base64'),
      iv: iv.toString('base64'),
      tag: cipher.getAuthTag().toString('base64'),
      body: body.toString('base64')
    };
  }

  /**
   * @static
   * @method open
   * @param {object} envelope - Encrypted envelope.
   * @param {string} password - Password.
   * @returns {*} Decrypted value.
   */
  static open(envelope, password) {
    const salt = Buffer.from(envelope.salt, 'base64');
    const iv = Buffer.from(envelope.iv, 'base64');
    const body = Buffer.from(envelope.body, 'base64');
    const key = crypto.pbkdf2Sync(String(password), salt, envelope.iters || ITERS, 32, envelope.kdf || KDF);
    const decipher = crypto.createDecipheriv(envelope.alg || ALG, key, iv);

    decipher.setAuthTag(Buffer.from(envelope.tag, 'base64'));

    const plain = Buffer.concat([decipher.update(body), decipher.final()]);
    return JSON.parse(plain.toString('utf8'));
  }
}

module.exports = PasswordBox;
