// B"H — MongoDB-compatible ObjectId for the AwtsmoosDB compat layer.
// Mirrors the mongodb npm driver's ObjectId: 12 bytes (4s timestamp, 5s random, 3s counter),
// 24-char lowercase hex string form.
'use strict';
const crypto = require('crypto');

let counter = Math.floor(Math.random() * 0xffffff);

function isHex24(s) {
  return typeof s === 'string' && /^[0-9a-fA-F]{24}$/.test(s);
}

class ObjectId {
  constructor(input) {
    if (input === undefined || input === null) {
      const t = Math.floor(Date.now() / 1000);
      const r = crypto.randomBytes(5);
      counter = (counter + 1) % 0xffffff;
      this._hex =
        t.toString(16).padStart(8, '0') +
        r.toString('hex') +
        counter.toString(16).padStart(6, '0');
    } else if (typeof input === 'string') {
      if (!isHex24(input)) {
        throw new Error('Argument passed in must be a string of 12 bytes or a string of 24 hex characters');
      }
      this._hex = input.toLowerCase();
    } else if (input instanceof ObjectId) {
      this._hex = input._hex;
    } else if (input && typeof input === 'object' && typeof input.toHexString === 'function') {
      const h = input.toHexString();
      if (!isHex24(h)) throw new Error('Argument passed in must be a string of 12 bytes or a string of 24 hex characters');
      this._hex = h.toLowerCase();
    } else {
      throw new Error('Argument passed in must be a string of 12 bytes or a string of 24 hex characters');
    }
  }

  toHexString() { return this._hex; }
  toString() { return this._hex; }
  toJSON() { return this._hex; }
  valueOf() { return this._hex; }

  equals(other) {
    if (other instanceof ObjectId) return this._hex === other._hex;
    if (typeof other === 'string') return this._hex === other.toLowerCase();
    if (other && typeof other === 'object' && typeof other.toHexString === 'function') {
      try { return this._hex === String(other.toHexString()).toLowerCase(); }
      catch (e) { return false; }
    }
    return false;
  }

  getTimestamp() {
    return new Date(parseInt(this._hex.slice(0, 8), 16) * 1000);
  }

  static createFromHexString(s) { return new ObjectId(s); }
  static isValid(s) { return isHex24(s); }
}

module.exports = { ObjectId };
