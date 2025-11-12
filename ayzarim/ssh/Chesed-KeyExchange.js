// B"H
// Chesed-KeyExchange.js: Mercy - The Secure Handshake

'use strict';

const { createECDH, createHash, generateKeyPairSync, diffieHellman, createVerify, verify } = require('crypto');

const { MESSAGE, DISCONNECT_REASON, DEFAULT_KEX, DEFAULT_SERVER_HOST_KEY, DEFAULT_CIPHER, DEFAULT_MAC, DEFAULT_COMPRESSION, CIPHER_INFO } = require('./Binah-Constants.js');
const { GevurahCipher, GevurahDecipher } = require('./Gevurah-Crypto.js');

// A temporary, simplified key parser for signature verification.
// This will be replaced by the full Hod-KeyParser.js later.
function parseKeyForVerification(keyBuffer) {
  // A very basic parser for ssh-ed25519 and ssh-rsa public keys in SSH format.
  const reader = {
    buffer: keyBuffer,
    pos: 0,
    readString() {
      if (this.pos + 4 > this.buffer.length) return null;
      const len = this.buffer.readUInt32BE(this.pos);
      this.pos += 4;
      if (this.pos + len > this.buffer.length) return null;
      const str = this.buffer.slice(this.pos, this.pos + len);
      this.pos += len;
      return str;
    }
  };

  const keyType = reader.readString().toString('ascii');
  let publicKey;

  if (keyType === 'ssh-ed25519') {
    const pubKey = reader.readString();
    // Reconstruct the standard PEM format for an Ed25519 public key
    const keyData = Buffer.concat([
        Buffer.from('302a300506032b6570032100', 'hex'), // ASN.1 header for Ed25519
        pubKey
    ]);
    publicKey = {
      key: `-----BEGIN PUBLIC KEY-----\n${keyData.toString('base64')}\n-----END PUBLIC KEY-----`,
      // THE FIX: Use the one-shot `verify` function which correctly handles `null` for Ed25519
      verify: (data, signature) => verify(null, data, publicKey.key, signature)
    };
  } else if (keyType === 'ssh-rsa') {
    // ... (RSA logic is okay, but we can update it for consistency) ...
    const e = reader.readString();
    const n = reader.readString();
    const keyData = Buffer.concat([
      Buffer.from([0x30, 0x82]), ...twoByteLength(n.length + e.length + 15),
      Buffer.from([0x02, 0x01, 0x00, 0x30, 0x0d, 0x06, 0x09, 0x2a, 0x86, 0x48, 0x86, 0xf7, 0x0d, 0x01, 0x01, 0x01, 0x05, 0x00, 0x03, 0x82]),
      ...twoByteLength(n.length + e.length + 7), Buffer.from([0x00, 0x30, 0x82]),
      ...twoByteLength(n.length + e.length + 2), Buffer.from([0x02, 0x82]),
      ...twoByteLength(n.length), n, Buffer.from([0x02]), ...oneByteLength(e.length), e
    ]);

    publicKey = {
      key: `-----BEGIN PUBLIC KEY-----\n${keyData.toString('base64').replace(/.{64}/g, '$&\n')}\n-----END PUBLIC KEY-----`,
      // Let's also update RSA to use the modern one-shot verify for consistency
      verify: (data, signature, hashAlgo = 'sha1') => verify(hashAlgo, data, publicKey.key, signature)
    };
  } else {
    return new Error(`Unsupported key type for verification: ${keyType}`);
  }

  function oneByteLength(len) { return [len]; }
  function twoByteLength(len) { return [(len >> 8) & 0xff, len & 0xff]; }
  
  return publicKey;
}


class KexHandler {
  constructor(protocol) {
    this._protocol = protocol;
    this._debug = protocol._debug;
    
    this.negotiated = {};
    this.sessionID = null;

    this._kexinit_payload = null; // Our KEXINIT payload
    this._remote_kexinit_payload = null; // Their KEXINIT payload

    this._dh = null; // For DH/ECDH key generation
    this._kex_secret = null; // 'K'
    this._exchange_hash = null; // 'H'
  }

  // Called when the protocol receives a KEXINIT message
   start(remotePayload) {
    this._debug && this._debug('Key Exchange: Processing remote KEXINIT.');
    this._remote_kexinit_payload = remotePayload;
    
    this._negotiate();
    this._startKex();
  }
  
   _sendKexInit() {
    if (this._kexinit_payload) return; // Already sent
    this._debug && this._debug('Key Exchange: Sending our KEXINIT.');

    const lists = [
      DEFAULT_KEX.join(','),
      DEFAULT_SERVER_HOST_KEY.join(','),
      DEFAULT_CIPHER.join(','),
      DEFAULT_CIPHER.join(','),
      DEFAULT_MAC.join(','),
      DEFAULT_MAC.join(','),
      DEFAULT_COMPRESSION.join(','),
      DEFAULT_COMPRESSION.join(','),
      '', '' // languages
    ];
    
    // Calculate size of just the payload
    let payloadSize = 1 + 16 + 1 + 4; // type, cookie, first_kex_follows, reserved
    for (const list of lists) {
      payloadSize += 4 + Buffer.byteLength(list);
    }
    
    const payload = Buffer.allocUnsafe(payloadSize);
    let p = 0;
    
    payload[p++] = MESSAGE.KEXINIT;
    require('crypto').randomFillSync(payload, p, 16);
    p += 16;
    
    for (const list of lists) {
      const len = Buffer.byteLength(list);
      payload.writeUInt32BE(len, p);
      p += 4;
      if (len > 0) {
        payload.write(list, p, 'ascii');
        p += len;
      }
    }
    
    payload[p++] = 0; // first_kex_packet_follows
    payload.writeUInt32BE(0, p); // reserved
    
    this._kexinit_payload = payload;

    // Use the protocol's public method to send the payload.
    // The cipher will handle all framing.
    this._protocol.sendPacket(payload);
  }

  _negotiate() {
    // A simple Buffer reader for parsing the remote KEXINIT
    const reader = {
      buffer: this._remote_kexinit_payload,
      pos: 17, // skip msg type and cookie
      readList: function() {
        const len = this.buffer.readUInt32BE(this.pos);
        this.pos += 4;
        const list = this.buffer.slice(this.pos, this.pos + len).toString('ascii');
        this.pos += len;
        return list.split(',');
      }
    };
    
    const remote = {
      kex: reader.readList(),
      serverHostKey: reader.readList(),
      csCipher: reader.readList(),
      scCipher: reader.readList(),
      csMAC: reader.readList(),
      scMAC: reader.readList(),
      csCompress: reader.readList(),
      scCompress: reader.readList(),
    };
    
    // Find first common algorithm in client-preferred order
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
    let payload;
    let kexType;

    switch (this.negotiated.kex) {
      case 'curve25519-sha256':
      case 'curve25519-sha256@libssh.org':
        this._dh = generateKeyPairSync('x25519');
        const clientPubKey = this._dh.publicKey.export({ type: 'spki', format: 'der' }).slice(-32);
        payload = Buffer.allocUnsafe(1 + 4 + clientPubKey.length);
        kexType = 'KEX_ECDH_INIT';
        payload[0] = MESSAGE.KEXDH_INIT;
        payload.writeUInt32BE(clientPubKey.length, 1);
        clientPubKey.copy(payload, 5);
        break;
      
      default:
        throw new Error(`Unsupported KEX algorithm: ${this.negotiated.kex}`);
    }
    
    this._debug && this._debug(`Outbound: Sending ${kexType}`);

    // THE FIX: Use the protocol's public method.
    this._protocol.sendPacket(payload);
  }

  // Called for any kex-related message after KEXINIT
  handleMessage(payload) {
    const msgType = payload[0];
    
    if (msgType === MESSAGE.KEXDH_REPLY) {
      this._handleDhReply(payload);
    } else if (msgType === MESSAGE.NEWKEYS) {
      this._protocol._decipher = new GevurahDecipher(this.negotiated.scCipher, this.negotiated.scMAC, this._sc_iv, this._sc_key, this._sc_mac_key, this._protocol._onPayload);
      this._protocol._decipher.inSeqno = 0n;
      this._debug && this._debug('Inbound: NEWKEYS. Switched to new decipher.');
      this._protocol._onHandshakeComplete();
    } else {
      throw new Error(`Unexpected KEX message type: ${msgType}`);
    }
  }

  _handleDhReply(payload) {
    this._debug && this._debug('Key Exchange: Processing KEXDH_REPLY.');
    // --------------------------------------------------------------------
    //  STEP 1: Parse the incoming KEXDH_REPLY packet from the server.
    // --------------------------------------------------------------------
    // This packet contains the server's public host key (K_S), its ephemeral
    // public key (f), and the signature of the exchange hash.
    const reader = {
      buffer: payload,
      pos: 1,
      readString: function() {
        const len = this.buffer.readUInt32BE(this.pos);
        this.pos += 4;
        const data = this.buffer.slice(this.pos, this.pos + len);
        this.pos += len;
        return data;
      }
    };
    
    const K_S = reader.readString();
    const serverEphPub = reader.readString(); // This is 'f'
    const signatureBlob = reader.readString();

    // --------------------------------------------------------------------
    //  STEP 2: Compute the shared secret 'K' using Diffie-Hellman.
    // --------------------------------------------------------------------
    // This combines our private key with the server's ephemeral public key.
    let secret; // This will become 'K'
    switch (this.negotiated.kex) {
        case 'curve25519-sha256':
        case 'curve25519-sha256@libssh.org':
            const serverEphPubDer = Buffer.concat([ Buffer.from('302a300506032b656e032100', 'hex'), serverEphPub ]);
            secret = diffieHellman({
                privateKey: this._dh.privateKey,
                publicKey: require('crypto').createPublicKey({ key: serverEphPubDer, format: 'der', type: 'spki' })
            });
            break;
        default:
            throw new Error(`Unsupported KEX for secret computation: ${this.negotiated.kex}`);
    }
    
    // Format the shared secret 'K' as a Multi-Precision Integer (mpint) as required by the RFC.
    // This involves adding a leading zero byte if the most significant bit is set.
    let secretMpint = secret;
    if (secret[0] & 0x80) {
      secretMpint = Buffer.concat([Buffer.alloc(1), secret]);
    }
    this._kex_secret = Buffer.alloc(4 + secretMpint.length);
    this._kex_secret.writeUInt32BE(secretMpint.length, 0);
    secretMpint.copy(this._kex_secret, 4);

    // --------------------------------------------------------------------
    //  STEP 3: Calculate the Exchange Hash 'H'. THIS IS THE CRITICAL PART.
    // --------------------------------------------------------------------
    // 'H' is the hash of a precise sequence of 8 data items. All 'string'
    // items must be prefixed with their length. Our helper handles this.
    const hash = createHash('sha256');
    const hashString = (buf) => {
        const lenBuf = Buffer.alloc(4);
        lenBuf.writeUInt32BE(buf.length, 0);
        hash.update(lenBuf);
        hash.update(buf);
    };

    // The 8 components of the hash, in exact RFC 4253 order:
    hashString(this._protocol._identRaw);                      // 1. V_C: Client version string
    hashString(Buffer.from(this._protocol._remoteIdentRaw));    // 2. V_S: Server version string
    hashString(this._kexinit_payload);                         // 3. I_C: Client KEXINIT payload
    hashString(this._remote_kexinit_payload);                  // 4. I_S: Server KEXINIT payload
    hashString(K_S);                                           // 5. K_S: Server public host key

    // === THE SYNTHESIS AND FINAL CORRECTION ===
    // My previous error was failing to correctly format 'e' (our ephemeral
    // public key) as a standard SSH 'string'. This version unifies the
    // logic, using the same trusted helper for ALL string components.
    const clientEphPub = this._dh.publicKey.export({ type: 'spki', format: 'der' }).slice(-32);
    hashString(clientEphPub);                                  // 6. e:   Client ephemeral public key

    hashString(serverEphPub);                                  // 7. f:   Server ephemeral public key
    hash.update(this._kex_secret);                             // 8. K:   The shared secret itself

    this._exchange_hash = hash.digest();
    
    // The session_id is the exchange hash from the first key exchange.
    if (!this.sessionID) {
      this.sessionID = this._exchange_hash;
    }

    // --------------------------------------------------------------------
    //  STEP 4: Verify the server's signature.
    // --------------------------------------------------------------------
    // This proves we are talking to the correct server and not a MITM attacker.
    // The server signs 'H' with its long-term private host key. We verify
    // with the public host key (K_S) it sent us.
    const sigReader = { buffer: signatureBlob, pos: 0, readString: reader.readString };
    const sigAlgo = sigReader.readString().toString('ascii');
    const signature = sigReader.readString();
    
    this._debug && this._debug(`Verifying signature with algorithm: ${sigAlgo}`);
    
    const parsedHostKey = parseKeyForVerification(K_S);
    if (parsedHostKey instanceof Error) throw parsedHostKey;

    const verified = parsedHostKey.verify(this._exchange_hash, signature);
    if (!verified) {
      // If this fails, the hash is likely still wrong. This debug output is critical.
      this._debug && this._debug(`CRITICAL: Server signature verification FAILED.`);
      this._debug && this._debug(`Calculated Exchange Hash (H): ${this._exchange_hash.toString('hex')}`);
      throw new Error('Host key signature verification failed. The exchange hash is likely incorrect.');
    }
    this._debug && this._debug('Server signature verified successfully.');

    // --------------------------------------------------------------------
    //  STEP 5: Derive keys and transition to the encrypted state.
    // --------------------------------------------------------------------
    this._deriveKeys();
    
    // Tell the server we are switching to encrypted mode.
    const newKeysPacket = Buffer.from([MESSAGE.NEWKEYS]);
    this._protocol.sendPacket(newKeysPacket);
    this._debug && this._debug('Outbound: Sending NEWKEYS. Switched to new cipher.');
    
    // Switch our own outbound traffic to use the newly derived keys.
    this._protocol._cipher = new GevurahCipher(
      this.negotiated.csCipher,
      this.negotiated.csMAC,
      this._cs_iv,
      this._cs_key,
      this._cs_mac_key,
      this._protocol._onWrite,
      this._protocol
    );
    this._protocol._cipher.outSeqno = 0n;
  }
  
   _deriveKeys() {
    // Get the negotiated cipher information
    const csCipherInfo = CIPHER_INFO[this.negotiated.csCipher];
    const scCipherInfo = CIPHER_INFO[this.negotiated.scCipher];

    const derive = (char, len) => {
      if (len === 0) return Buffer.alloc(0);
      const hash = createHash('sha256');
      hash.update(this._kex_secret);
      hash.update(this._exchange_hash);
      hash.update(char);
      hash.update(this.sessionID);
      let key = hash.digest();
      while (key.length < len) {
        const nextHash = createHash('sha256');
        nextHash.update(this._kex_secret);
        nextHash.update(this._exchange_hash);
        nextHash.update(key);
        key = Buffer.concat([key, nextHash.digest()]);
      }
      return key.slice(0, len);
    };
    
    // Use the key and IV lengths from CIPHER_INFO.
    // This will correctly derive a 64-byte key for chacha20-poly1305.
    this._cs_iv = derive('A', csCipherInfo.ivLen);
    this._sc_iv = derive('B', scCipherInfo.ivLen);
    this._cs_key = derive('C', csCipherInfo.keyLen);
    this._sc_key = derive('D', scCipherInfo.keyLen);
    this._cs_mac_key = derive('E', 32); // MAC key length is separate
    this._sc_mac_key = derive('F', 32);
    
     this._debug(`[DIAG] Derived CS Key (to Gevurah): ${this._cs_key.toString('hex')}`);
    this._debug(`[DIAG] Exchange Hash (H): ${this._exchange_hash.toString('hex')}`);
  }
}

module.exports = { KexHandler };