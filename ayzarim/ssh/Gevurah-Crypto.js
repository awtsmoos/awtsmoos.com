//B"H
// Gevurah-Crypto.js: Strength - The Final, Definitive, and Flawlessly Working Implementation

'use strict';

const { createCipheriv, createDecipheriv, timingSafeEqual } = require('crypto');
const { CIPHER_INFO } = require('./Binah-Constants.js');
const { Poly1305 } = require('./Yesod-Utilities.js');

// Helper to format logs consistently and vividly
const toHex = (buf) => (buf ? buf.toString('hex') : 'null');
const SEP_IN =  " O=O=O=O=O=O=O=O=O (INBOUND) O=O=O=O=O=O=O=O=O ";
const SEP_OUT = " >-}>-}>-}>-}>-}>-}> (OUTBOUND) >-}>-}>-}>-}>-}>-}> ";

//=================================================================================
//
//                                  GevurahCIPHER
//
//=================================================================================
class GevurahCipher {
  constructor(cipherName, macName, iv, key, macKey, onWrite, protocol) {
    this._onWrite = onWrite;
    this._protocol = protocol;
    this.outSeqno = 0; // Use a standard JavaScript Number for the 32-bit sequence number
    const cipherInfo = CIPHER_INFO[cipherName];
    this._key = key.slice(0, cipherInfo.keyLen);
    this._debug = (this._protocol && this._protocol._debug) ? this._protocol._debug : () => {};
    this._debug(`[GEVURAH-INIT-CIPHER] Cipher object created. Algorithm: ${cipherName}.`);
  }

  encrypt(payload) {
    const log = (msg) => this._debug(`[ENC SEQ=${this.outSeqno}] ${msg}`);
    log(`\n\n${SEP_OUT}`);
    log(">>>>>>>>> [STEP 0] STARTING ENCRYPTION PROCESS <<<<<<<<<");
    log(`[INPUT] Plaintext Payload: Type=${payload[0]}, Length=${payload.length} bytes`);
    
    // ==========================================================
    // STEP 1: SSH PACKET FRAMING & PADDING
    // ==========================================================
    log("\n[STEP 1] --- SSH PACKET FRAMING ---");
    const blockLen = 8;
    const unpaddedLen = 1 + payload.length;
    let padLen = blockLen - (unpaddedLen % blockLen);
    if (padLen < 4) padLen += blockLen;
    const totalPktLen = unpaddedLen + padLen;
    const packet = Buffer.allocUnsafe(totalPktLen);
    packet[0] = padLen;
    payload.copy(packet, 1);
    require('crypto').randomFillSync(packet, payload.length + 1, padLen);
    log(`[FRAME] Framed Plaintext (PadLen|Payload|RandomPad): ${toHex(packet)}`);

    // ==========================================================
    // STEP 2: KEY ASSIGNMENT (THE CORRECT WAY)
    // ==========================================================
    log("\n[STEP 2] --- KEY ASSIGNMENT (Ground Truth from ssh2 lib) ---");
    const mainKey = this._key.slice(0, 32); // K1 IS FOR PAYLOAD AND POLY1305 KEY
    const lenKey  = this._key.slice(32);    // K2 IS FOR PACKET LENGTH
    log(`[KEYS] Main Key   (K1 for Payload): ${toHex(mainKey)}`);
    log(`[KEYS] Length Key (K2 for Length): ${toHex(lenKey)}`);

    // ==========================================================
    // STEP 3: CONSTRUCT NONCES (IVs) (THE CORRECT WAY)
    // ==========================================================
    log("\n[STEP 3] --- CONSTRUCTING NONCES (IVs) ---");
    const iv_counter0 = Buffer.alloc(16, 0);
    // [64-bit LE counter = 0] | [32-bit Zeros] | [32-bit BE seqno]
    iv_counter0.writeUInt32BE(this.outSeqno, 12);
    log(`[IV] Length/Poly IV is [Counter:0 LE][SeqNo:${this.outSeqno} BE] -> ${toHex(iv_counter0)}`);
    
    const iv_counter1 = Buffer.alloc(16, 0);
    // [64-bit LE counter = 1] | [32-bit Zeros] | [32-bit BE seqno]
    iv_counter1[0] = 1; 
    iv_counter1.writeUInt32BE(this.outSeqno, 12);
    log(`[IV] Payload IV is   [Counter:1 LE][SeqNo:${this.outSeqno} BE] -> ${toHex(iv_counter1)}`);

    // ==========================================================
    // STEP 4: ENCRYPT PACKET LENGTH
    // ==========================================================
    log("\n[STEP 4] --- ENCRYPTING PACKET LENGTH ---");
    const lenBuf = Buffer.alloc(4);
    lenBuf.writeUInt32BE(packet.length, 0);
    log(`[LEN] Plaintext length bytes: ${toHex(lenBuf)}`);
    const lenCipher = createCipheriv('chacha20', lenKey, iv_counter0);
    const encryptedLen = Buffer.concat([lenCipher.update(lenBuf), lenCipher.final()]);
    log(`[LEN] >>>>>>>> ENCRYPTED LENGTH: ${toHex(encryptedLen)}`);

    // ==========================================================
    // STEP 5: GENERATE POLY1305 KEY
    // ==========================================================
    log("\n[STEP 5] --- GENERATING POLY1305 KEY ---");
    const polyKeyCipher = createCipheriv('chacha20', mainKey, iv_counter0);
    const polyKey = polyKeyCipher.update(Buffer.alloc(32, 0));
    log(`[POLY] >>>>>>>> DERIVED POLY1305 KEY: ${toHex(polyKey)}`);
    
    // ==========================================================
    // STEP 6: ENCRYPT PAYLOAD
    // ==========================================================
    log("\n[STEP 6] --- ENCRYPTING PAYLOAD ---");
    const payloadCipher = createCipheriv('chacha20', mainKey, iv_counter1);
    const encryptedPayload = Buffer.concat([payloadCipher.update(packet), payloadCipher.final()]);
    log(`[PAYLOAD] >>>>>>>> ENCRYPTED PAYLOAD: ${toHex(encryptedPayload)}`);
    
    // ==========================================================
    // STEP 7: CALCULATE AUTHENTICATION TAG
    // ==========================================================
    log("\n[STEP 7] --- CALCULATING AUTHENTICATION TAG ---");
    const dataToAuthenticate = Buffer.concat([encryptedLen, encryptedPayload]);
    log(`[AUTH] Authenticating this data: ${toHex(dataToAuthenticate)}`);
    const authTag = Poly1305.tag(polyKey, dataToAuthenticate);
    log(`[AUTH] >>>>>>>> FINAL AUTHENTICATION TAG: ${toHex(authTag)}`);
    
    // ==========================================================
    // STEP 8: WRITE TO WIRE & FINALIZE
    // ==========================================================
    log("\n[STEP 8] --- WRITING TO WIRE & FINALIZING ---");
    this._onWrite(encryptedLen);
    this._onWrite(encryptedPayload);
    this._onWrite(authTag);

    this.outSeqno = (this.outSeqno + 1) >>> 0;
    log(`[FINISH] SEQUENCE NUMBER INCREMENTED TO ${this.outSeqno}.`);
    log(`[FINISH] ENCRYPTION PROCESS COMPLETE.\n${SEP_OUT}\n`);
  }
}

//=================================================================================
//
//                                  GevurahDECIPHER
//
//=================================================================================
class GevurahDecipher {
    constructor(cipherName, macName, iv, key, macKey, onPayload) {
        this._onPayload = onPayload; 
        this.inSeqno = 0; // Use a standard JavaScript Number
        const cipherInfo = CIPHER_INFO[cipherName]; 
        this._key = key.slice(0, cipherInfo.keyLen);
        this._debug = () => {};
        this._state = 'LENGTH';
        this._needed = 4;
        this._buffer = Buffer.alloc(0);
        this._encryptedLen = null;
    }

    _setDebug(dbg) { if (dbg) this._debug = dbg; }

    decrypt(data, p, len) {
        const log = (msg) => this._debug(`[DEC SEQ=${this.inSeqno}] ${msg}`);
        
        if (p < len) this._buffer = Buffer.concat([this._buffer, data.slice(p, len)]);

        while (true) {
            if (this._state === 'LENGTH') {
                if (this._buffer.length < 4) return;

                log("\n\n" + SEP_IN);
                log("<<<<<<<<< [STEP 1] DECRYPTING LENGTH <<<<<<<<<");
                
                this._encryptedLen = this._buffer.slice(0, 4);
                this._buffer = this._buffer.slice(4);
                log(`[LEN] Extracted encrypted length from stream: ${toHex(this._encryptedLen)}`);

                const mainKey = this._key.slice(0, 32); // K1 for Payload/Poly
                const lenKey  = this._key.slice(32);    // K2 for Length
                
                const iv_counter0 = Buffer.alloc(16, 0);
                iv_counter0.writeUInt32BE(this.inSeqno, 12);
                log(`[LEN] Using IV: [Counter:0 LE][SeqNo:${this.inSeqno} BE] -> ${toHex(iv_counter0)}`);
                
                const decipher = createDecipheriv('chacha20', lenKey, iv_counter0);
                const decryptedLenBuf = Buffer.concat([decipher.update(this._encryptedLen), decipher.final()]);
                const pktLen = decryptedLenBuf.readUInt32BE(0);
                log(`[LEN] >>>>>>>> PLAINTEXT PAYLOAD LENGTH: ${pktLen} bytes.`);

                if (pktLen > 35000 || pktLen < 8) { // Standard SSH max packet size is 35k
                    throw new Error(`[FATAL] Invalid packet length received: ${pktLen}`);
                }

                this._state = 'PAYLOAD';
                this._needed = pktLen + 16;
                log(`[STATE] Transitioning to PAYLOAD state, expecting ${this._needed} more bytes.`);
            
            } else if (this._state === 'PAYLOAD') {
                if (this._buffer.length < this._needed) return;

                log("\n[STEP 2] --- VALIDATING AND DECRYPTING PAYLOAD ---");

                const fullPacket = this._buffer.slice(0, this._needed);
                this._buffer = this._buffer.slice(this._needed);
                const encryptedPayload = fullPacket.slice(0, this._needed - 16);
                const receivedTag = fullPacket.slice(this._needed - 16);
                log(`[PAYLOAD] Extracted Encrypted Payload: ${toHex(encryptedPayload)}`);
                log(`[PAYLOAD] Extracted Authentication Tag: ${toHex(receivedTag)}`);

                const mainKey = this._key.slice(0, 32); // K1 is for Poly1305 Key
                const iv_counter0 = Buffer.alloc(16, 0);
                iv_counter0.writeUInt32BE(this.inSeqno, 12);

                const polyKeyCipher = createCipheriv('chacha20', mainKey, iv_counter0);
                const polyKey = polyKeyCipher.update(Buffer.alloc(32, 0));
                log(`[AUTH] Re-generated Poly1305 Key: ${toHex(polyKey)}`);
                
                const dataToAuthenticate = Buffer.concat([this._encryptedLen, encryptedPayload]);
                const expectedTag = Poly1305.tag(polyKey, dataToAuthenticate);
                log(`[AUTH] Calculated Expected Tag:      ${toHex(expectedTag)}`);
                
                if (!timingSafeEqual(receivedTag, expectedTag)) {
                    throw new Error('[FATAL] MAC VALIDATION FAILED! PACKET REJECTED.');
                }
                log("!!!!!!!!!!!!!! AUTHENTICATION SUCCESS: TAG IS VALID !!!!!!!!!!!!!!");

                const iv_counter1 = Buffer.alloc(16, 0);
                iv_counter1[0] = 1;
                iv_counter1.writeUInt32BE(this.inSeqno, 12);
                log(`[DECRYPT] Using IV: [Counter:1 LE][SeqNo:${this.inSeqno} BE] -> ${toHex(iv_counter1)}`);
                
                const payloadDecipher = createDecipheriv('chacha20', mainKey, iv_counter1);
                const decryptedPacket = Buffer.concat([payloadDecipher.update(encryptedPayload), payloadDecipher.final()]);
                
                const padLen = decryptedPacket[0];
                const payload = decryptedPacket.slice(1, decryptedPacket.length - padLen);
                
                this._onPayload(payload);
                this.inSeqno = (this.inSeqno + 1) >>> 0;
                log(`[FINISH] SEQUENCE NUMBER INCREMENTED TO ${this.inSeqno}.`);
                log(`[FINISH] DECRYPTION PROCESS COMPLETE.\n${SEP_IN}\n`);

                this._state = 'LENGTH';
                this._needed = 4;
                this._encryptedLen = null;
            }
        }
    }
}


module.exports = { GevurahCipher, GevurahDecipher };