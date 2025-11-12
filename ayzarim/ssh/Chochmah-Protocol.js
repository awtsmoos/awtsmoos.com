// B"H
// Chochmah-Protocol.js: Wisdom - The Core Protocol Engine (UPDATED FOR HANDSHAKE)

'use strict';
const { dispatch } = require('./Tiferet-Handlers.js');
const { EventEmitter } = require('events');
const { inspect } = require('util');
const { MESSAGE, DISCONNECT_REASON } = require('./Binah-Constants.js');
const { KexHandler } = require('./Chesed-KeyExchange.js'); // Import the KexHandler
const { PacketReader, PacketWriter } = require('./Yesod-Utilities.js'); // For packet framing

// === THIS IS THE MISSING BLOCK ===
const MODULE_VER = '1.0.0'; // Version string
const IDENT_RAW = Buffer.from(`SSH-2.0-ssh2js-kabbalah-${MODULE_VER}`);
const IDENT = Buffer.from(`${IDENT_RAW}\r\n`);
const RE_IDENT = /^SSH-(2\.0|1\.99)-([^ ]+)(?: (.*))?$/;
// A robust NullDecipher that correctly handles packet framing
// In Chochmah-Protocol.js, replace the old NullCipher and NullDecipher with these:

// A protocol-correct NullCipher that handles proper SSH packet framing.
class NullCipher {
  constructor(seqno, onWrite) {
    this._onWrite = onWrite;
  }
  encrypt(payload) {
    const payloadLen = payload.length;
    const block_size = 8;
    
    // The length of the packet *before* padding is added.
    // This includes the 4-byte length field, 1-byte pad_length field, and payload.
    const unpaddedPacketLen = 4 + 1 + payloadLen;

    // Calculate how much padding is needed to make the *total packet size* a multiple of the block size.
    let padLen = block_size - (unpaddedPacketLen % block_size);
    if (unpaddedPacketLen % block_size === 0) {
      padLen = 0;
    }
    // The padding MUST be at least 4 bytes.
    if (padLen < 4) {
      padLen += block_size;
    }

    // This is the length that goes in the initial 4-byte length field.
    // It's the length of everything *except* that field.
    const packet_length_field = 1 + payloadLen + padLen;
    const total_wire_length = 4 + packet_length_field;

    const packet = Buffer.allocUnsafe(total_wire_length);

    // 1. [uint32 packet_length]
    packet.writeUInt32BE(packet_length_field, 0);
    // 2. [byte padding_length]
    packet[4] = padLen;
    // 3. [byte[n1] payload]
    payload.copy(packet, 5);
    // 4. [byte[n2] random padding]
    packet.fill(0, 5 + payloadLen);
    
    this._onWrite(packet);
  }
}

// A protocol-correct NullDecipher that parses SSH packet frames.
class NullDecipher {
  constructor(seqno, onPayload) {
    this._onPayload = onPayload;
    this._len = 0;
    this._lenBytes = 0;
    this._packet = null;
    this._packetPos = 0;
  }
  decrypt(data, p, dataLen) {
    while (p < dataLen) {
      // 1. Read the 4-byte packet length from the network stream
      if (this._lenBytes < 4) {
        let nb = Math.min(4 - this._lenBytes, dataLen - p);
        this._lenBytes += nb;
        while (nb--) this._len = (this._len << 8) + data[p++];
        if (this._lenBytes < 4) return p; // Need more data for the length field
        if (this._len < 5) throw new Error('Bad packet length');
      }
      
      // 2. We have the length, now read the rest of the packet body
      const needed = this._len;
      if (!this._packet) this._packet = Buffer.allocUnsafe(needed);
      
      const nb = Math.min(needed - this._packetPos, dataLen - p);
      data.copy(this._packet, this._packetPos, p, p + nb);

      p += nb;
      this._packetPos += nb;

      if (this._packetPos < needed) return p; // Incomplete packet body, wait for more data

      // 3. We have a full, framed packet. Now, parse its contents.
      const fullPacketBody = this._packet;
      const padLen = fullPacketBody[0]; // First byte of the body is padding_length
      const payload = fullPacketBody.slice(1, needed - padLen);
      
      // 4. Reset state to prepare for the next packet
      this._len = 0;
      this._lenBytes = 0;
      this._packet = null;
      this._packetPos = 0;

      // 5. Process the extracted payload
      const ret = this._onPayload(payload);
      if (ret !== undefined && ret === false) return p;
    }
    return p;
  }
}


class ChochmahProtocol extends EventEmitter {
  constructor(config) {
    super();
    this._server = !!config.server;
    this._onWrite = config.onWrite;
    this._onError = config.onError;
    this._debug = config.debug;
    this._onHeader = config.onHeader;
    this._onHandshakeComplete = config.onHandshakeComplete;

    // === THE FIX IS HERE ===
    // Store our own ident string as an instance property so other components can access it.
    this._identRaw = IDENT_RAW;
    // =======================

    this._parse = this._parseHeader;
    this._buffer = undefined;
    this._remoteIdentRaw = null;
    this._cipher = new NullCipher(0, this._onWrite);
    this._decipher = new NullDecipher(0, this._onPayload.bind(this));
    this._authenticated = false;
    this._packetRW = { read: new PacketReader(), write: new PacketWriter(this) };
    this._kex = new KexHandler(this);
  }

  start() {
    this._debug && this._debug(`Local ident: ${inspect(IDENT_RAW.toString())}`);
    this._onWrite(IDENT);
    this._debug && this._debug('Sent our identification string to the server.');
  }

  parse(chunk) {
    this._debug && this._debug(`<<<< INBOUND DATA (length: ${chunk.length})`);
    let p = 0;
    while (p < chunk.length && p < Infinity) {
      p = this._parse(chunk, p, chunk.length);
    }
  }
  
  requestService(name) {
    this._debug && this._debug(`Requesting service: ${name}`);
    const nameLen = Buffer.byteLength(name);
    const payload = Buffer.allocUnsafe(1 + 4 + nameLen);
    
    payload[0] = MESSAGE.SERVICE_REQUEST;
    payload.writeUInt32BE(nameLen, 1);
    payload.write(name, 5, 'ascii');
    
    this.sendPacket(payload);
  }
  
  sendPacket(payload) {
    this._debug && this._debug(`>>>> OUTBOUND: Sending message type ${payload[0]}`);
    // The cipher is now solely responsible for all framing (length, padding, etc.)
    this._cipher.encrypt(payload);
  }
  
  authPassword(username, password) {
    this._debug && this._debug('Attempting password authentication...');
    const userLen = Buffer.byteLength(username);
    const passLen = Buffer.byteLength(password);
    
    // Calculate payload size for USERAUTH_REQUEST with password
    // msg type + user len + user + service len + service + method len + method + bool + pass len + pass
    const payloadSize = 1 + 4 + userLen + 4 + 14 + 4 + 8 + 1 + 4 + passLen;
    const payload = Buffer.allocUnsafe(payloadSize);
    
    let p = 0;
    payload[p++] = MESSAGE.USERAUTH_REQUEST;
    
    payload.writeUInt32BE(userLen, p); p += 4;
    payload.write(username, p, 'utf8'); p += userLen;

    payload.writeUInt32BE(14, p); p += 4;
    payload.write('ssh-connection', p, 'ascii'); p += 14;

    payload.writeUInt32BE(8, p); p += 4;
    payload.write('password', p, 'ascii'); p += 8;
    
    payload[p++] = 0; // boolean: false (no password change)

    payload.writeUInt32BE(passLen, p); p += 4;
    payload.write(password, p, 'utf8');

    this.sendPacket(payload);
  }

  // Placeholder for future PEM key auth
  authPublicKey(username, privateKey) {
    this._debug && this._debug('Public key authentication is not yet implemented.');
    // Logic from Hod-KeyParser and Chesed-KeyExchange would go here.
  }

  subsystem(recipient, name, wantReply) {
    const nameLen = Buffer.byteLength(name);
    const payload = Buffer.allocUnsafe(1 + 4 + 4 + 9 + 1 + 4 + nameLen);
    let p = 0;

    payload[p++] = MESSAGE.CHANNEL_REQUEST;
    payload.writeUInt32BE(recipient, p); p += 4;
    payload.writeUInt32BE(9, p); p += 4;
    payload.write('subsystem', p, 'ascii'); p += 9;
    payload[p++] = wantReply ? 1 : 0;
    payload.writeUInt32BE(nameLen, p); p += 4;
    payload.write(name, p, 'utf8');

    this.sendPacket(payload);
  }

  _parseHeader(chunk, p, len) {
    this._debug && this._debug('Parsing header data...');
    const data = this._buffer ? Buffer.concat([this._buffer, chunk.slice(p, len)]) : chunk.slice(p, len);
    let start = 0;

    for (let i = 0; i < data.length; ++i) {
      if (i > 0 && data[i] === 10 /* \n */) {
        const end = (data[i - 1] === 13 /* \r */) ? i - 1 : i;
        const line = data.slice(start, end);
        const lineStr = line.toString('ascii');
        
        this._debug && this._debug(`Parsed a line from server: "${lineStr}"`);

        if (lineStr.startsWith('SSH-2.0-')) {
          const m = RE_IDENT.exec(lineStr);
          if (!m) return this._doFatalError('Invalid identification string format');

          this._debug && this._debug('SUCCESS: Matched SSH identification string!');

          const header = { /* ... header object ... */ };
          this._remoteIdentRaw = lineStr;
          this._onHeader(header);
          
          this._parse = this._parsePacket;
          this._buffer = undefined;

          // *** NEW: Immediately send our KEXINIT response ***
          this._kex._sendKexInit();

          const remainingDataOffset = i + 1;
          if (remainingDataOffset < data.length) {
              this._debug && this._debug('There is extra data in the header packet, parsing it as a protocol packet.');
              this._parsePacket(data, remainingDataOffset, data.length);
          }
          
          return len; // Consume the whole chunk
        }
        start = i + 1;
      }
    }

    this._debug && this._debug('Did not find a full identification line, buffering for more data.');
    this._buffer = data;
    return len;
  }
  
  // *** NEW: This is no longer a placeholder ***
  _parsePacket(chunk, p, len) {
    return this._decipher.decrypt(chunk, p, len);
  }

  _onPayload(payload) {
    const msgType = payload[0];
    this._debug && this._debug(`Inbound: Received message type ${msgType}`);
    
    if (msgType >= 20 && msgType <= 49) { // Key Exchange Message
      if (this._kex) {
        if (msgType === MESSAGE.KEXINIT) {
          this._kex.start(payload);
        } else {
          this._kex.handleMessage(payload);
        }
      }
    } else {
      //  Dispatch all other messages to our central handler
      dispatch(this, payload);
    }
  }
  
  disconnect(reason = DISCONNECT_REASON.BY_APPLICATION) {
    // Simplified disconnect packet for now
    const pktLen = 1 + 4 + 4 + 4;
    const packet = this._cipher.allocPacket(pktLen);
    let p = 5; // Start after packet length and padding length bytes
    packet[p++] = MESSAGE.DISCONNECT;
    packet.writeUInt32BE(reason, p);
    p += 4;
    packet.writeUInt32BE(0, p); // No description
    p += 4;
    packet.writeUInt32BE(0, p); // No language tag
    this._cipher.encrypt(packet);
  }

  _doFatalError(msg) {
    const err = new Error(msg);
    err.level = 'protocol';
    this.disconnect(DISCONNECT_REASON.PROTOCOL_ERROR);
    this._onError(err);
    return Infinity; // Stop parsing
  }



}

module.exports = { ChochmahProtocol };
  
  
  
