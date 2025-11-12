// B"H
// Gevurah-Crypto.js: Strength - Encryption and Decryption

'use strict';

const { createCipheriv, createDecipheriv, createHmac, timingSafeEqual } = require('crypto');
const { CIPHER_INFO, MAC_INFO } = require('./Binah-Constants.js');

const ZEROS = Buffer.alloc(16);

class GevurahCipher {
  constructor(cipherName, macName, iv, key, macKey, onWrite) {
    this._onWrite = onWrite;
    this.outSeqno = 0n; // Use BigInt for the 64-bit sequence number

    const cipherInfo = CIPHER_INFO[cipherName];
    if (!cipherInfo) throw new Error(`Unsupported cipher: ${cipherName}`);
    
    this._cipherName = cipherName;
    this._cipherInfo = cipherInfo;
    this._key = key.slice(0, cipherInfo.keyLen);
    this._iv = iv.slice(0, cipherInfo.ivLen);
    
    this._isAEAD = (cipherInfo.authLen > 0);
    
    if (!this._isAEAD) {
      const macInfo = MAC_INFO[macName];
      if (!macInfo) throw new Error(`Unsupported MAC: ${macName}`);
      this._macInfo = macInfo;
      this._macKey = macKey.slice(0, macInfo.len);
    }
  }

  allocPacket(payloadLen) {
    const blockLen = this._cipherInfo.blockLen;
    let pktLen = 4 + 1 + payloadLen;
    let padLen = blockLen - (pktLen % blockLen);
    if (padLen < 4) padLen += blockLen;
    pktLen += padLen;
    
    const packet = Buffer.allocUnsafe(pktLen);
    packet.writeUInt32BE(pktLen - 4, 0);
    packet[4] = padLen;
    require('crypto').randomFillSync(packet, 5 + payloadLen, padLen);
    
    return packet;
  }

   encrypt(payload) {
    const ischacha = (this._cipherName === 'chacha20-poly1305@openssh.com');
    
    // 1. Frame the packet payload (pad_len + payload + padding)
    const blockLen = this._cipherInfo.blockLen;
    let pktLen = 1 + payload.length;
    let padLen = blockLen - (pktLen % blockLen);
    if (padLen < 4) padLen += blockLen;
    pktLen += padLen;
    const packet = Buffer.allocUnsafe(pktLen);
    packet[0] = padLen;
    payload.copy(packet, 1);
    require('crypto').randomFillSync(packet, 1 + payload.length, padLen);

    const lenBuf = Buffer.alloc(4);
    lenBuf.writeUInt32BE(packet.length, 0);

    if (this._isAEAD) {
      if (ischacha) {
        // Split the 64-byte key into two 32-byte keys.
        // The spec requires K_1 (first half) for the payload and K_2 (second half) for the length.
        const mainKey = this._key.slice(0, 32); // K_1 for the payload
        const lenKey = this._key.slice(32);      // K_2 for the length

        // 1. Encrypt the 4-byte length field with K_2.
        const lenIV = Buffer.alloc(16, 0);
        lenIV.writeBigUInt64LE(this.outSeqno, 8);
        const lenCipher = createCipheriv('chacha20', lenKey, lenIV);
        const encryptedLen = Buffer.concat([lenCipher.update(lenBuf), lenCipher.final()]);

        // 2. Encrypt the payload with K_1.
        const payloadNonce = Buffer.alloc(12, 0);
        payloadNonce.writeBigUInt64LE(this.outSeqno, 4);
        const payloadCipher = createCipheriv('chacha20-poly1305', mainKey, payloadNonce, { authTagLength: 16 });
        payloadCipher.setAAD(lenBuf);
        const encryptedPayload = Buffer.concat([payloadCipher.update(packet), payloadCipher.final()]);
        const authTag = payloadCipher.getAuthTag();

        this._onWrite(encryptedLen);
        this._onWrite(encryptedPayload);
        this._onWrite(authTag);
      } else { // AES-GCM logic (should already be correct)
        const cipher = createCipheriv(this._cipherInfo.sslName, this._key, this._iv, { authTagLength: 16 });
        cipher.setAAD(lenBuf);
        const encrypted = Buffer.concat([cipher.update(packet), cipher.final()]);
        const tag = cipher.getAuthTag();
        this._onWrite(lenBuf);
        this._onWrite(encrypted);
        this._onWrite(tag);
        for (let i = this._iv.length - 1; i >= 4; --i) {
          if (++this._iv[i] !== 0) break;
        }
      }
    }  else {
      // CBC/HMAC logic (remains unchanged and correct)
      const hmacPayload = Buffer.concat([lenBuf, packet]);
      const cipher = createCipheriv(this._cipherInfo.sslName, this._key, this._iv);
      const encrypted = Buffer.concat([cipher.update(hmacPayload), cipher.final()]);
      this._iv = encrypted.slice(encrypted.length - this._cipherInfo.ivLen);
      const hmac = createHmac(this._macInfo.sslName, this._macKey);
      const seqnoBuf = Buffer.alloc(4);
      seqnoBuf.writeUInt32BE(this.outSeqno, 0);
      hmac.update(seqnoBuf);
      hmac.update(hmacPayload); // Corrected: HMAC is on plaintext for non-ETM
      const mac = hmac.digest();
      this._onWrite(encrypted);
      this._onWrite(mac.slice(0, this._macInfo.actualLen));
    }
    this.outSeqno++;
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
        this._iv = iv.slice(0, cipherInfo.ivLen);
        
        this._isAEAD = (cipherInfo.authLen > 0);
        
        if (!this._isAEAD) {
            const macInfo = MAC_INFO[macName];
            if (!macInfo) throw new Error(`Unsupported MAC: ${macName}`);
            this._macInfo = macInfo;
            this._macKey = macKey.slice(0, macInfo.len);
        }
        
        // Packet reading state
        this._buffer = null;
        this._state = 'LENGTH';
        this._needed = this._isAEAD ? 4 : this._cipherInfo.blockLen;
    }

    decrypt(chunk) {
    this._buffer = this._buffer ? Buffer.concat([this._buffer, chunk]) : chunk;
    
    while (this._buffer && this._buffer.length >= this._needed) {
        const data = this._buffer.slice(0, this._needed);
        this._buffer = this._buffer.slice(this._needed);
        
        if (this._state === 'LENGTH') {
            const ischacha = (this._cipherName === 'chacha20-poly1305@openssh.com');
            let pktLen;
            if (ischacha) {
                // === CORRECTED DECRYPTION LOGIC FOR CHACHA20 LENGTH ===
                const lenKey = this._key.slice(32); // K_2 is the second half
                
                const lenIV = Buffer.alloc(16, 0);
                lenIV.writeBigUInt64LE(this.inSeqno, 8); 

                const decipher = createDecipheriv('chacha20', lenKey, lenIV);
                const decryptedLenBuf = Buffer.concat([
                    decipher.update(data),
                    decipher.final()
                  ]);
                
                pktLen = decryptedLenBuf.readUInt32BE(0);
                this._state = { name: 'PAYLOAD', pktLen, lenBuf: decryptedLenBuf };
            } else { // AES-GCM
                pktLen = data.readUInt32BE(0);
                this._state = { name: 'PAYLOAD', pktLen, lenBuf: data };
            }
            this._needed = pktLen + this._cipherInfo.authLen;
        } else if (this._state.name === 'PAYLOAD') {
            const { pktLen, lenBuf } = this._state;
            const encryptedPayload = data.slice(0, pktLen);
            const authTag = data.slice(pktLen);

            let decipher;
            if (this._cipherName === 'chacha20-poly1305@openssh.com') {
                 const mainKey = this._key.slice(0, 32); // K_1 is the first half

                const nonce = Buffer.alloc(12, 0);
                nonce.writeBigUInt64LE(this.inSeqno, 4); 
                
                decipher = createDecipheriv('chacha20-poly1305', mainKey, nonce, { authTagLength: 16 });
                decipher.setAAD(lenBuf);
            } else { // AES-GCM
                decipher = createDecipheriv(this._cipherInfo.sslName, this._key, this._iv, { authTagLength: 16 });
                decipher.setAAD(lenBuf);
                for (let i = this._iv.length - 1; i >= 4; --i) {
                  if (++this._iv[i] !== 0) break;
                }
            }

            decipher.setAuthTag(authTag);
            const decrypted = Buffer.concat([decipher.update(encryptedPayload), decipher.final()]);
            
            const padLen = decrypted[0];
            const payload = decrypted.slice(1, decrypted.length - padLen);
            
            this._onPayload(payload);
            this.inSeqno++; 
            
            this._state = 'LENGTH';
            this._needed = this._isAEAD ? 4 : this._cipherInfo.blockLen;
        }
    }
  }
}


module.exports = { GevurahCipher, GevurahDecipher };