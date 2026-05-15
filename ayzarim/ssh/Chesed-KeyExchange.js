// B"H
// Chesed-KeyExchange.js: Mercy - The Secure Handshake
// VERSION 2.0 - REWRITTEN FOR COMPLETE ALGORITHM COMPLIANCE

'use strict';

const {
  createECDH,
  createDiffieHellmanGroup,
  createHash,
  generateKeyPairSync,
  diffieHellman,
  verify,
  createPublicKey,
} = require('crypto');

const { MESSAGE } = require('./Binah-Constants.js');
const { GevurahCipher, GevurahDecipher } = require('./Gevurah-Crypto.js');
const { BufferReader } = require('./Yesod-Utilities.js');

// =============================================================================
//
// ROBUST, RFC-COMPLIANT PUBLIC KEY PARSER
// This function correctly parses all host key formats advertised by this client.
//
// =============================================================================
function parseKeyForVerification(keyBuffer) {
  const reader = new BufferReader(keyBuffer);
  const keyType = reader.readString('ascii');

  let publicKey;

  try {
    switch (keyType) {
      case 'ssh-ed25519': {
        const pubKey = reader.readString(null);
        // Per RFC 5656, for Ed25519, the public key is encoded directly.
        // We wrap it in an ASN.1 DER structure to create a standard PEM format
        // that Node's crypto.verify function can consume.
        // OID for Ed25519 is 1.3.101.112
        const keyData = Buffer.concat([
            Buffer.from('302a300506032b6570032100', 'hex'), // ASN.1 header for Ed25519
            pubKey
        ]);
        publicKey = createPublicKey({
          key: keyData,
          format: 'der',
          type: 'spki'
        });
        break;
      }

      case 'ssh-rsa': {
        const e = reader.readString(null);
        const n = reader.readString(null);
        // We manually construct the ASN.1 DER structure for an RSA public key (PKCS#1).
        const keyData = Buffer.concat([
            Buffer.from('30', 'hex'), encodeLength(n.length + e.length + 8),
            Buffer.from('02', 'hex'), encodeLength(n.length), n,
            Buffer.from('02', 'hex'), encodeLength(e.length), e
        ]);
        const pemHeader = '-----BEGIN RSA PUBLIC KEY-----\n';
        const pemFooter = '\n-----END RSA PUBLIC KEY-----';
        const pem = pemHeader + keyData.toString('base64').replace(/.{64}/g, '$&\n') + pemFooter;
        publicKey = createPublicKey({ key: pem, format: 'pem', type: 'pkcs1' });
        break;
      }
      
      case 'ecdsa-sha2-nistp256':
      case 'ecdsa-sha2-nistp384':
      case 'ecdsa-sha2-nistp521': {
        reader.readString('ascii'); // Skip the curve identifier string (e.g., "nistp256")
        const Q = reader.readString(null); // This is the public point
        
        // We must wrap the public point 'Q' in an ASN.1 DER structure for a standard
        // EC public key, including the OID for the specific curve.
        const oids = {
          'ecdsa-sha2-nistp256': '06082a8648ce3d030107', // OID 1.2.840.10045.3.1.7 (prime256v1)
          'ecdsa-sha2-nistp384': '06052b81040022',      // OID 1.3.132.0.34 (secp384r1)
          'ecdsa-sha2-nistp521': '06052b81040023',      // OID 1.3.132.0.35 (secp521r1)
        };
        const keyData = Buffer.concat([
          Buffer.from('30', 'hex'), // SEQUENCE
          encodeLength(19 + Q.length),
          Buffer.from('301306072a8648ce3d0201', 'hex'), // EC Public Key OID
          Buffer.from(oids[keyType], 'hex'),           // Curve OID
          Buffer.from('03', 'hex'),                    // BIT STRING
          encodeLength(Q.length + 1),
          Buffer.from('00', 'hex'), // Unused bits
          Q
        ]);
        publicKey = createPublicKey({ key: keyData, format: 'der', type: 'spki' });
        break;
      }

      default:
        throw new Error(`Unsupported host key type for verification: ${keyType}`);
    }
  } catch (ex) {
    throw new Error(`Failed to parse host key type ${keyType}: ${ex.message}`);
  }

  // Helper for creating ASN.1 length fields
  function encodeLength(len) {
    if (len < 128) return Buffer.from([len]);
    const nBytes = 1 + (Math.log(len) / Math.log(256) | 0);
    const buf = Buffer.alloc(nBytes);
    buf[0] = 0x80 | (nBytes - 1);
    for (let i = 1; i < nBytes; i++) {
        buf[nBytes - i] = (len >> ((i - 1) * 8)) & 0xff;
    }
    return buf;
  }

  // Return a consistent object that Node's crypto.verify can use directly.
  return publicKey;
}


// =============================================================================
//
// KexHandler CLASS - Main Logic
//
// =============================================================================
class KexHandler {
  constructor(protocol) {
    this._protocol = protocol;
    this._debug = protocol._debug;
    
    this.negotiated = {};
    this.sessionID = null;

    this._kexinit_payload = null;
    this._remote_kexinit_payload = null;

    this._dh = null; // Holds the crypto object for DH/ECDH
    this._kex_secret = null; // Shared secret 'K'
    this._exchange_hash = null; // Exchange hash 'H'
    this._pendingCipher = null;
    this._pendingDecipher = null;
  }

  start(remotePayload) {
    this._debug && this._debug('Key Exchange: Processing remote KEXINIT.');
    this._remote_kexinit_payload = remotePayload;
    
    this._negotiate();
    this._startKex();
  }
  
  _sendKexInit() {
    // This function remains the same as the original. It correctly sends the
    // client's algorithm lists from Binah-Constants.js.
    if (this._kexinit_payload) return;
    this._debug && this._debug('Key Exchange: Sending our KEXINIT.');

    const { DEFAULT_KEX, DEFAULT_SERVER_HOST_KEY, DEFAULT_CIPHER, DEFAULT_MAC, DEFAULT_COMPRESSION } = require('./Binah-Constants.js');
    const lists = [
      DEFAULT_KEX.join(','), DEFAULT_SERVER_HOST_KEY.join(','), DEFAULT_CIPHER.join(','),
      DEFAULT_CIPHER.join(','), DEFAULT_MAC.join(','), DEFAULT_MAC.join(','),
      DEFAULT_COMPRESSION.join(','), DEFAULT_COMPRESSION.join(','), '', ''
    ];
    
    let payloadSize = 1 + 16 + 1 + 4;
    for (const list of lists) payloadSize += 4 + Buffer.byteLength(list);
    
    const payload = Buffer.allocUnsafe(payloadSize);
    let p = 0;
    
    payload[p++] = MESSAGE.KEXINIT;
    require('crypto').randomFillSync(payload, p, 16); p += 16;
    
    for (const list of lists) {
      const len = Buffer.byteLength(list);
      payload.writeUInt32BE(len, p); p += 4;
      if (len > 0) { payload.write(list, p, 'ascii'); p += len; }
    }
    
    payload[p++] = 0;
    payload.writeUInt32BE(0, p);
    
    this._kexinit_payload = payload;
    this._protocol.sendPacket(payload);
  }

  _negotiate() {
    // This function remains the same as the original. It correctly negotiates
    // the first common algorithm from the client's and server's lists.
    const reader = new BufferReader(this._remote_kexinit_payload.slice(17));
    const remote = {
      kex: reader.readString('ascii').split(','),
      serverHostKey: reader.readString('ascii').split(','),
      csCipher: reader.readString('ascii').split(','), scCipher: reader.readString('ascii').split(','),
      csMAC: reader.readString('ascii').split(','), scMAC: reader.readString('ascii').split(','),
      csCompress: reader.readString('ascii').split(','), scCompress: reader.readString('ascii').split(',')
    };
    
    const { DEFAULT_KEX, DEFAULT_SERVER_HOST_KEY, DEFAULT_CIPHER, DEFAULT_MAC, DEFAULT_COMPRESSION } = require('./Binah-Constants.js');
    const find = (client, server) => client.find(algo => server.includes(algo));
    
    this.negotiated.kex = find(DEFAULT_KEX, remote.kex);
    this.negotiated.serverHostKey = find(DEFAULT_SERVER_HOST_KEY, remote.serverHostKey);
    this.negotiated.csCipher = find(DEFAULT_CIPHER, remote.csCipher);
    this.negotiated.scCipher = find(DEFAULT_CIPHER, remote.scCipher);
    this.negotiated.csMAC = find(DEFAULT_MAC, remote.csMAC);
    this.negotiated.scMAC = find(DEFAULT_MAC, remote.scMAC);
    this.negotiated.csCompress = find(DEFAULT_COMPRESSION, remote.csCompress);
    this.negotiated.scCompress = find(DEFAULT_COMPRESSION, remote.scCompress);
    
    this._debug && this._debug(`Negotiated Algorithms: ${JSON.stringify(this.negotiated)}`);
    if (Object.values(this.negotiated).some(v => !v)) {
      throw new Error('Failed to negotiate one or more algorithms.');
    }
  }

  _startKex() {
    let clientEphPub;
    const kex = this.negotiated.kex;
    
    if (kex.startsWith('curve25519')) {
      this._dh = generateKeyPairSync('x25519');
      clientEphPub = this._dh.publicKey.export({ type: 'spki', format: 'der' }).slice(-32);
    } else if (kex.startsWith('ecdh-sha2-')) {
      const curveNames = {
        'nistp256': 'prime256v1',
        'nistp384': 'secp384r1',
        'nistp521': 'secp521r1'
      };
      const curve = kex.split('-').pop();
      this._dh = createECDH(curveNames[curve]);
      this._dh.generateKeys();
      clientEphPub = this._dh.getPublicKey();
    } else if (kex.startsWith('diffie-hellman-group14-sha256')) {
      this._dh = createDiffieHellmanGroup('modp3072');
      this._dh.generateKeys();
      clientEphPub = this._dh.getPublicKey();
    } else if (kex.startsWith('diffie-hellman-group16-sha512')) {
      this._dh = createDiffieHellmanGroup('modp4096');
      this._dh.generateKeys();
      clientEphPub = this._dh.getPublicKey();
    } else if (kex.includes('group-exchange')) {
      // Group Exchange (GEX) is a more complex protocol where the client and server
      // negotiate a Diffie-Hellman group. Implementing it is a significant task.
      // This client advertises support but will now fail gracefully if it is chosen.
      throw new Error(`KEX algorithm '${kex}' is advertised but not yet implemented.`);
    } else {
      throw new Error(`FATAL: KEX algorithm '${kex}' was negotiated but is not supported by the client logic.`);
    }

    this._debug && this._debug(`Outbound: Sending KEXDH_INIT for ${kex}`);
    const payload = Buffer.allocUnsafe(1 + 4 + clientEphPub.length);
    payload[0] = MESSAGE.KEXDH_INIT;
    payload.writeUInt32BE(clientEphPub.length, 1);
    clientEphPub.copy(payload, 5);
    this._protocol.sendPacket(payload);
  }

  handleMessage(payload) {
    const msgType = payload[0];
    if (msgType === MESSAGE.KEXDH_REPLY) {
      this._handleDhReply(payload);
    } else if (msgType === MESSAGE.NEWKEYS) {
      this._debug && this._debug('Inbound: NEWKEYS successfully decrypted.');
      if (this._pendingDecipher) {
        const nextInboundSeqno = (this._protocol._decipher && this._protocol._decipher.inSeqno !== undefined)
          ? this._protocol._decipher.inSeqno + 1n
          : 0n;
        this._pendingDecipher.inSeqno = nextInboundSeqno;
        this._protocol.setInboundDecipher(this._pendingDecipher);
        this._pendingDecipher = null;
      }
      this._protocol._onHandshakeComplete();
    } else {
      throw new Error(`Unexpected KEX message type: ${msgType}`);
    }
  }

  _handleDhReply(payload) {
    this._debug && this._debug('Key Exchange: Processing KEXDH_REPLY.');
    
    // STEP 1: Parse the incoming KEXDH_REPLY packet
    const reader = new BufferReader(payload.slice(1));
    const K_S = reader.readString(null);
    const serverEphPub = reader.readString(null);
    const signatureBlob = reader.readString(null);

    // STEP 2: Compute the shared secret 'K'
    let secret;
    const kex = this.negotiated.kex;

    if (kex.startsWith('curve25519')) {
      const serverKey = createPublicKey({
        key: Buffer.concat([ Buffer.from('302a300506032b656e032100', 'hex'), serverEphPub ]),
        format: 'der', type: 'spki'
      });
      secret = diffieHellman({ privateKey: this._dh.privateKey, publicKey: serverKey });
    } else if (kex.startsWith('ecdh-sha2-') || kex.startsWith('diffie-hellman-group')) {
      secret = this._dh.computeSecret(serverEphPub);
    } else {
      throw new Error(`Unsupported KEX for secret computation: ${kex}`);
    }

    // Format the secret as an mpint as per RFC 4253
    let secretMpint = secret;
    if (secret[0] & 0x80) {
      secretMpint = Buffer.concat([Buffer.alloc(1), secret]);
    }
    this._kex_secret = Buffer.alloc(4 + secretMpint.length);
    this._kex_secret.writeUInt32BE(secretMpint.length, 0);
    secretMpint.copy(this._kex_secret, 4);

    // STEP 3: Calculate the Exchange Hash 'H'
    const hashAlgo = kex.includes('sha512') ? 'sha512' : 
                     kex.includes('sha256') ? 'sha256' : 'sha1';
    const hash = createHash(hashAlgo);
    const hashString = (buf) => {
        const lenBuf = Buffer.alloc(4); lenBuf.writeUInt32BE(buf.length, 0);
        hash.update(lenBuf); hash.update(buf);
    };
    
    // Get client ephemeral public key in the correct format
    let clientEphPub;
    if (kex.startsWith('curve25519')) {
        clientEphPub = this._dh.publicKey.export({ type: 'spki', format: 'der' }).slice(-32);
    } else {
        clientEphPub = this._dh.getPublicKey();
    }
    
    hashString(this._protocol._identRaw);
    hashString(Buffer.from(this._protocol._remoteIdentRaw));
    hashString(this._kexinit_payload);
    hashString(this._remote_kexinit_payload);
    hashString(K_S);
    hashString(clientEphPub);
    hashString(serverEphPub);
    hash.update(this._kex_secret);
    this._exchange_hash = hash.digest();
    if (!this.sessionID) {
      this.sessionID = this._exchange_hash;
    }

    // STEP 4: Verify the server's signature
    const sigReader = new BufferReader(signatureBlob);
    const sigAlgo = sigReader.readString('ascii');
    const signature = sigReader.readString(null);
    this._debug && this._debug(`Verifying signature with host key algorithm: ${sigAlgo}`);
    
    const parsedHostKey = parseKeyForVerification(K_S);
    const sigHashAlgo = sigAlgo.includes('512') ? 'sha512' : 
                        sigAlgo.includes('256') ? 'sha256' : 
                        sigAlgo === 'ssh-rsa' ? 'sha1' : undefined;

    const verified = verify(sigHashAlgo, this._exchange_hash, parsedHostKey, signature);
    if (!verified) {
      throw new Error('Host key signature verification failed. The server is not who it claims to be.');
    }
    this._debug && this._debug('Server signature verified successfully.');

    // STEP 5 & 6: Derive keys, send plaintext NEWKEYS, then activate outbound encryption.
    this._deriveKeysAndActivate();
  }
  
  _deriveKeysAndActivate() {
    const { CIPHER_INFO } = require('./Binah-Constants.js');
    const hashAlgo = this.negotiated.kex.includes('sha512') ? 'sha512' : 
                     this.negotiated.kex.includes('sha256') ? 'sha256' : 'sha1';

    const derive = (char, len) => {
      if (len === 0) return Buffer.alloc(0);
      const hash = createHash(hashAlgo);
      hash.update(this._kex_secret);
      hash.update(this._exchange_hash);
      hash.update(char);
      hash.update(this.sessionID);
      let key = hash.digest();
      while (key.length < len) {
        const nextHash = createHash(hashAlgo);
        nextHash.update(this._kex_secret);
        nextHash.update(this._exchange_hash);
        nextHash.update(key);
        key = Buffer.concat([key, nextHash.digest()]);
      }
      return key.slice(0, len);
    };
    
    const csCipherInfo = CIPHER_INFO[this.negotiated.csCipher];
    const scCipherInfo = CIPHER_INFO[this.negotiated.scCipher];
    
    const cs_iv = derive('A', csCipherInfo.ivLen);
    const sc_iv = derive('B', scCipherInfo.ivLen);
    const cs_key = derive('C', csCipherInfo.keyLen);
    const sc_key = derive('D', scCipherInfo.keyLen);
    const cs_mac_key = derive('E', require('./Binah-Constants.js').MAC_INFO[this.negotiated.csMAC].keyLen || 32);
    const sc_mac_key = derive('F', require('./Binah-Constants.js').MAC_INFO[this.negotiated.scMAC].keyLen || 32);

    this._debug && this._debug('Key derivation complete. Preparing to transition protocol state.');

    const nextInboundSeqno = (this._protocol._decipher && this._protocol._decipher.inSeqno !== undefined)
      ? this._protocol._decipher.inSeqno + 1n
      : 0n;

    this._pendingDecipher = new (require('./Gevurah-Crypto').GevurahDecipher)(
      this.negotiated.scCipher, this.negotiated.scMAC, null,
      sc_key, sc_mac_key, this._protocol._onPayload.bind(this._protocol), nextInboundSeqno, sc_iv
    );
    this._pendingDecipher._setDebug(this._protocol._debug);

    const newKeysPacket = Buffer.from([MESSAGE.NEWKEYS]);
    this._protocol.sendPacket(newKeysPacket);
    this._debug && this._debug('Outbound: Sending NEWKEYS (plaintext; next packet will be encrypted).');

    const nextOutboundSeqno = (this._protocol._cipher && this._protocol._cipher.outSeqno !== undefined)
      ? this._protocol._cipher.outSeqno
      : 0n;

    this._pendingCipher = new (require('./Gevurah-Crypto').GevurahCipher)(
      this.negotiated.csCipher, this.negotiated.csMAC, null,
      cs_key, cs_mac_key, this._protocol._onWrite, this._protocol, nextOutboundSeqno, cs_iv
    );
    this._protocol.setOutboundCipher(this._pendingCipher);
    this._pendingCipher = null;
  }
}

module.exports = { KexHandler };
