//B"H
// Gevurah-Crypto.js: Strength - Encryption and Decryption (INSTRUMENTED FOR LIVE ANALYSIS)

'use strict';

const { createCipheriv, createDecipheriv, timingSafeEqual } = require('crypto');
const { CIPHER_INFO } = require('./Binah-Constants.js');

// === BEGIN PURE JAVASCRIPT POLY1305 IMPLEMENTATION ===
const Poly1305 = (() => {
    const BI_ZERO = BigInt(0);
    const P = BigInt('0x3fffffffffffffffffffffffffffffffb');

    const leToBigInt = (buf) => {
        let n = BI_ZERO;
        for (let i = buf.length - 1; i >= 0; i--) { n = (n << BigInt(8)) + BigInt(buf[i]); }
        return n;
    };
    const bigIntToLe = (n, len) => {
        const buf = Buffer.alloc(len);
        for (let i = 0; i < len; i++) { buf[i] = Number(n & BigInt(0xff)); n >>= BigInt(8); }
        return buf;
    };
    return {
        tag: (key, data) => {
            const r_buf = key.slice(0, 16);
            const s_buf = key.slice(16, 32);
            r_buf[3] &= 15; r_buf[7] &= 15; r_buf[11] &= 15; r_buf[15] &= 15;
            r_buf[4] &= 252; r_buf[8] &= 252; r_buf[12] &= 252;
            const r = leToBigInt(r_buf);
            const s = leToBigInt(s_buf);
            let a = BI_ZERO;
            for (let i = 0; i < data.length; i += 16) {
                const block = data.slice(i, i + 16);
                const n_buf = Buffer.alloc(block.length + 1, 0);
                block.copy(n_buf, 0);
                n_buf[block.length] = 1;
                const n = leToBigInt(n_buf);
                a += n;
                a = (r * a) % P;
            }
            return bigIntToLe(a + s, 16);
        }
    };
})();
// === END PURE JAVASCRIPT POLY1305 IMPLEMENTATION ===

class GevurahCipher {
  constructor(cipherName, macName, iv, key, macKey, onWrite, protocol) {
    this._onWrite = onWrite;
    this._protocol = protocol;
    this.outSeqno = 0n;
    const cipherInfo = CIPHER_INFO[cipherName];
    this._cipherName = cipherName;
    this._cipherInfo = cipherInfo;
    this._key = key.slice(0, cipherInfo.keyLen);
    this._isAEAD = (cipherInfo.authLen > 0);
  }

  // B"H - IN Gevurah-Crypto.js
  // B"H - IN Gevurah-Crypto.js
// ==========================================================
// vvvvv REPLACE THE ENTIRE encrypt METHOD WITH THIS vvvvv
// ==========================================================
encrypt(payload, isDebug = false) {
    const ischacha = (this._cipherName === 'chacha20-poly1305@openssh.com');
    
    // 1. Frame the packet payload
    const blockLen = this._cipherInfo.blockLen;
    let pktLen = 1 + payload.length;
    let padLen = blockLen - (pktLen % blockLen);
    if (padLen < 4) padLen += blockLen;
    pktLen += padLen;
    const packet = Buffer.allocUnsafe(pktLen);
    packet[0] = padLen;
    payload.copy(packet, 1);
    
    // CRITICAL DIAGNOSTIC LOGIC: Override padding for RFC test
    if (isDebug && payload.length === 65 && padLen === 6) {
        Buffer.from([0x4e, 0x43, 0xe8, 0x04, 0xdc, 0x6c]).copy(packet, 1 + payload.length);
    } else {
        require('crypto').randomFillSync(packet, 1 + payload.length, padLen);
    }

    const lenBuf = Buffer.alloc(4);
    lenBuf.writeUInt32BE(packet.length, 0);

    if (this._isAEAD && ischacha) {
        const mainKey = this._key.slice(0, 32); // K_1
        const lenKey = this._key.slice(32);      // K_2

        // Step 1: Encrypt Length
        const lenIV = Buffer.alloc(16, 0);
        lenIV.writeBigUInt64BE(this.outSeqno, 8);
        const lenCipher = createCipheriv('chacha20', lenKey, lenIV);
        const encryptedLen = Buffer.concat([lenCipher.update(lenBuf), lenCipher.final()]);

        // Step 2A: Generate the one-time Poly1305 key
        const polyKeyIV = Buffer.alloc(16, 0);
        polyKeyIV.writeBigUInt64BE(this.outSeqno, 8);
        const polyKeyCipher = createCipheriv('chacha20', mainKey, polyKeyIV);
        const polyKey = polyKeyCipher.update(Buffer.alloc(32, 0));

        // Step 2B: Encrypt the payload
        const payloadIV = Buffer.alloc(16, 0);
        payloadIV.writeUInt32LE(1, 0);
        payloadIV.writeBigUInt64BE(this.outSeqno, 8);
        const payloadCipher = createCipheriv('chacha20', mainKey, payloadIV);
        const encryptedPayload = Buffer.concat([payloadCipher.update(packet), payloadCipher.final()]);

        // Step 3: Authenticate the concatenated ciphertexts
        const dataToAuthenticate = Buffer.concat([encryptedLen, encryptedPayload]);
        const authTag = Poly1305.tag(polyKey, dataToAuthenticate);
        
        this._onWrite(encryptedLen);
        this._onWrite(encryptedPayload);
        this._onWrite(authTag);
    }
    this.outSeqno++;
  }
// ==========================================================
// ^^^^^ REPLACE THE ENTIRE encrypt METHOD WITH THIS ^^^^^
// ==========================================================
  // Helper function to contain the framing logic
  framePacket(payload, isDebug) {
    const blockLen = this._cipherInfo.blockLen;
    let pktLen = 1 + payload.length;
    let padLen = blockLen - (pktLen % blockLen);
    if (padLen < 4) padLen += blockLen;
    pktLen += padLen;
    const packet = Buffer.allocUnsafe(pktLen);
    packet[0] = padLen;
    payload.copy(packet, 1);
    
    if (isDebug && payload.length === 65 && padLen === 6) {
        Buffer.from([0x4e, 0x43, 0xe8, 0x04, 0xdc, 0x6c]).copy(packet, 1 + payload.length);
    } else {
        require('crypto').randomFillSync(packet, 1 + payload.length, padLen);
    }
    return packet;
  }
}

class GevurahDecipher {
    constructor(cipherName, macName, iv, key, macKey, onPayload) {
        this._onPayload = onPayload;
        this.inSeqno = 0n;
        const cipherInfo = CIPHER_INFO[cipherName];
        if (!cipherInfo) throw new Error(`Unsupported cipher: ${cipherName}`);
        this._cipherName = cipherName;
        this._cipherInfo = cipherInfo;
        this._key = key.slice(0, cipherInfo.keyLen);
        this._isAEAD = (cipherInfo.authLen > 0);
        
        this._buffer = null;
        this._state = 'LENGTH';
        this._needed = this._isAEAD ? 4 : 0;
    }

    decrypt(chunk) {
    this._buffer = this._buffer ? Buffer.concat([this._buffer, chunk]) : chunk;
  
    while (this._buffer && this._buffer.length >= this._needed) {
        if (this._state === 'LENGTH') {
            const encryptedLen = this._buffer.slice(0, 4);
            const lenKey = this._key.slice(32);
            
            const lenIV = Buffer.alloc(16, 0);
            lenIV.writeBigUInt64LE(this.inSeqno, 8); // Nonce = seqno
            const decipher = createDecipheriv('chacha20', lenKey, lenIV);
            const decryptedLenBuf = Buffer.concat([decipher.update(encryptedLen), decipher.final()]);
            
            const pktLen = decryptedLenBuf.readUInt32BE(0);
            if (pktLen > 262144) throw new Error(`Invalid packet length: ${pktLen}`);
            
            this._state = { name: 'PAYLOAD', encryptedLen, pktLen, decryptedLenBuf };
            this._needed = pktLen + 16;
            this._buffer = this._buffer.slice(4);

        } else if (this._state.name === 'PAYLOAD') {
            if (this._buffer.length < this._needed) return;

            const encryptedPayload = this._buffer.slice(0, this._state.pktLen);
            const receivedTag = this._buffer.slice(this._state.pktLen, this._needed);
            const mainKey = this._key.slice(0, 32);

            const polyKeyIV = Buffer.alloc(16, 0);
            polyKeyIV.writeBigUInt64LE(this.inSeqno, 8); // Nonce = seqno
            const polyKeyCipher = createCipheriv('chacha20', mainKey, polyKeyIV);
            const polyKey = Buffer.concat([polyKeyCipher.update(Buffer.alloc(32, 0)), polyKeyCipher.final()]);

            const dataToAuthenticate = Buffer.concat([this._state.decryptedLenBuf, encryptedPayload]);
            const expectedTag = Poly1305.tag(polyKey, dataToAuthenticate);
            
            if (!timingSafeEqual(receivedTag, expectedTag)) {
                throw new Error('MAC validation failed.');
            }
            
            const payloadIV = Buffer.alloc(16, 0);
            payloadIV.writeBigUInt64LE(1n, 0); // Block Counter = 1
            payloadIV.writeBigUInt64LE(this.inSeqno, 8); // Nonce = seqno
            const payloadDecipher = createDecipheriv('chacha20', mainKey, payloadIV);
            const decryptedPacket = Buffer.concat([payloadDecipher.update(encryptedPayload), payloadDecipher.final()]);

            const padLen = decryptedPacket[0];
            const payload = decryptedPacket.slice(1, decryptedPacket.length - padLen);
            
            this._onPayload(payload);
            
            this.inSeqno++; 
            this._state = 'LENGTH';
            this._needed = 4;
            this._buffer = this._buffer.slice(this._needed);
        }
    }
  }
}

module.exports = { GevurahCipher, GevurahDecipher };