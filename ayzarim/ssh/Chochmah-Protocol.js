// B"H
// Chochmah-Protocol.js: Wisdom - The Core Protocol Engine
// VERSION 2.0 - REWRITTEN FOR SECURITY HARDENING & FEATURE COMPLETENESS

'use strict';

const { EventEmitter } = require('events');
const { inspect } = require('util');
const { createPublicKey, sign } = require('crypto');
const { dispatch } = require('./Tiferet-Handlers.js');
const { MESSAGE, DISCONNECT_REASON } = require('./Binah-Constants.js');
const { KexHandler } = require('./Chesed-KeyExchange.js');
// NOTE: For better modularity, NullCipher/NullDecipher should be moved to Yesod-Utilities.js.
// This implementation assumes they have been moved and are now imported.
const { NullCipher, NullDecipher } = require('./Yesod-Utilities.js'); 

const { NetzachChannelManager } = require('./Netzach-ChannelManager.js');
const MODULE_VER = '2.0.0';
const IDENT_RAW = Buffer.from(`SSH-2.0-ssh2js-kabbalah-${MODULE_VER}`);
const IDENT = Buffer.from(`${IDENT_RAW}\r\n`);
const RE_IDENT = /^SSH-(2\.0|1\.99)-([^ ]+)(?: (.*))?$/;
const MAX_BANNER_SIZE = 65536; // 64KB limit to prevent DoS

class ChochmahProtocol extends EventEmitter {
  constructor(config) {
    super(config);
    this._server = !!config.server;
    this._onWrite = config.onWrite;
    this._onError = config.onError;
    this._debug = typeof config.debug === 'function' ? config.debug : () => {};
    this._onHeader = config.onHeader;
    this._onHandshakeComplete = () => {
        this.emit('handshake_complete');
        if (config.onHandshakeComplete) config.onHandshakeComplete();
    };

    this._identRaw = IDENT_RAW;
    this._remoteIdentRaw = null;
    
    this._parsingState = 'header';
    
    // This persistent buffer is the core of the fix.
    this._parseBuffer = Buffer.alloc(0);
    
    this._decipher = new NullDecipher(this._onPayload.bind(this));
    this._cipher = null;
    
    this._authenticated = false;
    this._kex = new KexHandler(this);
    this.channelManager = new NetzachChannelManager(this);
    this._pkAuthContext = null;
  }
  
  // Method called from KexHandler to transition the parser state.
  enterEncryptedMode(newDecipher, newCipher) {
    this._debug('STATE CHANGE: Entering encrypted mode.');
    this._decipher = newDecipher;
    this._cipher = newCipher;
    this._parsingState = 'encrypted';
  }

  setOutboundCipher(newCipher) {
    this._debug && this._debug('STATE CHANGE: Activating encrypted outbound packets.');
    this._cipher = newCipher;
  }

  setInboundDecipher(newDecipher) {
    this._debug && this._debug('STATE CHANGE: Activating encrypted inbound packets.');
    this._decipher = newDecipher;
    this._parsingState = 'encrypted';
  }

  start() {
    this._debug && this._debug(`Local ident: ${inspect(IDENT_RAW.toString())}`);
    this._cipher = new (require('./Yesod-Utilities').NullCipher)(this._onWrite);
    this._onWrite(IDENT);
    this._debug && this._debug('Sent our identification string to the server.');
  }

  parse(chunk) {
    this._debug && this._debug(`<<<< INBOUND DATA (state: ${this._parsingState}, length: ${chunk.length})`);
    this._parseBuffer = Buffer.concat([this._parseBuffer, chunk]);

    let continueLoop = true;
    while (continueLoop && this._parseBuffer.length > 0) {
      const initialBufLen = this._parseBuffer.length;

      switch (this._parsingState) {
        case 'header':
          this._parseHeader();
          break;
        case 'kex':
          const p = this._decipher.decrypt(this._parseBuffer, 0, initialBufLen);
          this._parseBuffer = this._parseBuffer.slice(p);
          break;
        case 'encrypted':
          this._decipher.decrypt(this._parseBuffer);
          this._parseBuffer = Buffer.alloc(0);
          break;
      }
      
      if (this._parseBuffer.length === initialBufLen) {
        continueLoop = false;
      }
    }
  }

  sendPacket(payload) {
    this._debug && this._debug(`>>>> OUTBOUND: Sending message type ${payload[0]}`);
    this._cipher.encrypt(payload);
  }

  // =======================================================================
  // AUTHENTICATION METHODS
  // =======================================================================

  authPassword(username, password) {
    this._debug && this._debug('Attempting password authentication...');
    const userLen = Buffer.byteLength(username);
    const passLen = Buffer.byteLength(password);
    
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

  authPublicKey(username, privateKey) {
    this._debug && this._debug('Attempting public key authentication (stage 1: probe)...');
    
    // Store context for stage 2 (the signature)
    this._pkAuthContext = { username, privateKey };

    // The public key needs to be in the raw SSH format.
    // Node's crypto.createPrivateKey().export() can generate this directly.
    const { keyAlgo, pubKeyBlob } = this._getSshPublicKey(privateKey);

    const userLen = Buffer.byteLength(username);
    const keyAlgoLen = Buffer.byteLength(keyAlgo);
    const pubKeyBlobLen = pubKeyBlob.length;

    // msg type + user len + user + service len + service + method len + method + has_sig(false) + algo len + algo + key blob len + key blob
    const payloadSize = 1 + 4 + userLen + 4 + 14 + 4 + 10 + 1 + 4 + keyAlgoLen + 4 + pubKeyBlobLen;
    const payload = Buffer.allocUnsafe(payloadSize);

    let p = 0;
    payload[p++] = MESSAGE.USERAUTH_REQUEST;

    payload.writeUInt32BE(userLen, p); p += 4;
    payload.write(username, p, 'utf8'); p += userLen;

    payload.writeUInt32BE(14, p); p += 4;
    payload.write('ssh-connection', p, 'ascii'); p += 14;

    payload.writeUInt32BE(10, p); p += 4;
    payload.write('publickey', p, 'ascii'); p += 10;

    payload[p++] = 0; // **IMPORTANT**: Stage 1 has no signature, so this is FALSE (0).

    payload.writeUInt32BE(keyAlgoLen, p); p += 4;
    payload.write(keyAlgo, p, 'ascii'); p += keyAlgoLen;
    
    payload.writeUInt32BE(pubKeyBlobLen, p); p += 4;
    pubKeyBlob.copy(payload, p);

    this.sendPacket(payload);
  }

  // This is the second stage of public key auth, triggered by a USERAUTH_PK_OK message.
  _continuePkAuth() {
    this._debug && this._debug('Public key confirmed, proceeding with authentication (stage 2: signature)...');
    const { username, privateKey } = this._pkAuthContext;
    this._pkAuthContext = null; // Consume the context

    const { keyAlgo, pubKeyBlob } = this._getSshPublicKey(privateKey);

    // =========================================================================
    // RFC 4252, Section 7: The signature is NOT on the public key. It is on a
    // meticulously constructed buffer containing the session ID and the current
    // user authentication request parameters.
    // =========================================================================
    const userLen = Buffer.byteLength(username);
    const keyAlgoLen = Buffer.byteLength(keyAlgo);
    const pubKeyBlobLen = pubKeyBlob.length;

    const dataToSignSize = 4 + this._kex.sessionID.length + 1 + 4 + userLen + 4 + 14 + 4 + 10 + 1 + 4 + keyAlgoLen + 4 + pubKeyBlobLen;
    const dataToSign = Buffer.allocUnsafe(dataToSignSize);
    
    let p = 0;
    dataToSign.writeUInt32BE(this._kex.sessionID.length, p); p += 4;
    this._kex.sessionID.copy(dataToSign, p); p += this._kex.sessionID.length;
    
    dataToSign[p++] = MESSAGE.USERAUTH_REQUEST;
    dataToSign.writeUInt32BE(userLen, p); p += 4;
    dataToSign.write(username, p, 'utf8'); p += userLen;
    dataToSign.writeUInt32BE(14, p); p += 4;
    dataToSign.write('ssh-connection', p, 'ascii'); p += 14;
    dataToSign.writeUInt32BE(10, p); p += 4;
    dataToSign.write('publickey', p, 'ascii'); p += 10;
    dataToSign[p++] = 1; // has_sig is TRUE (1)
    dataToSign.writeUInt32BE(keyAlgoLen, p); p += 4;
    dataToSign.write(keyAlgo, p, 'ascii'); p += keyAlgoLen;
    dataToSign.writeUInt32BE(pubKeyBlobLen, p); p += 4;
    pubKeyBlob.copy(dataToSign, p);
    
    // Determine the correct signature algorithm
    const sigHashAlgo = keyAlgo.includes('512') ? 'sha512' : 
                        keyAlgo.includes('256') ? 'sha256' :
                        keyAlgo === 'ssh-rsa' ? 'sha1' : undefined;
    
    const signature = sign(sigHashAlgo, dataToSign, privateKey);

    // Now, build the final request packet that includes the signature
    const sigBlob = Buffer.allocUnsafe(4 + keyAlgoLen + 4 + signature.length);
    sigBlob.writeUInt32BE(keyAlgoLen, 0);
    sigBlob.write(keyAlgo, 4, 'ascii');
    sigBlob.writeUInt32BE(signature.length, 4 + keyAlgoLen);
    signature.copy(sigBlob, 8 + keyAlgoLen);
    
    const payloadSize = 1 + 4 + userLen + 4 + 14 + 4 + 10 + 1 + 4 + keyAlgoLen + 4 + pubKeyBlobLen + 4 + sigBlob.length;
    const payload = Buffer.allocUnsafe(payloadSize);

    p = 0;
    payload[p++] = MESSAGE.USERAUTH_REQUEST;
    payload.writeUInt32BE(userLen, p); p += 4;
    payload.write(username, p, 'utf8'); p += userLen;
    payload.writeUInt32BE(14, p); p += 4;
    payload.write('ssh-connection', p, 'ascii'); p += 14;
    payload.writeUInt32BE(10, p); p += 4;
    payload.write('publickey', p, 'ascii'); p += 10;
    payload[p++] = 1; // **IMPORTANT**: Stage 2 has a signature, so this is TRUE (1).
    payload.writeUInt32BE(keyAlgoLen, p); p += 4;
    payload.write(keyAlgo, p, 'ascii'); p += keyAlgoLen;
    payload.writeUInt32BE(pubKeyBlobLen, p); p += 4;
    pubKeyBlob.copy(payload, p); p += pubKeyBlobLen;
    payload.writeUInt32BE(sigBlob.length, p); p += 4;
    sigBlob.copy(payload, p);

    this.sendPacket(payload);
  }

  // =======================================================================
  // PARSING & STATE MACHINE
  // =======================================================================

  _parseHeader() {
    if (this._parseBuffer.length > MAX_BANNER_SIZE) {
      return this._doFatalError(`Server banner exceeded max size of ${MAX_BANNER_SIZE} bytes.`);
    }

    const newlineIdx = this._parseBuffer.indexOf(10);
    if (newlineIdx === -1) {
      return;
    }
    
    const end = (this._parseBuffer[newlineIdx - 1] === 13) ? newlineIdx - 1 : newlineIdx;
    const line = this._parseBuffer.slice(0, end);
    const lineStr = line.toString('ascii');
    
    this._parseBuffer = this._parseBuffer.slice(newlineIdx + 1);

    if (RE_IDENT.test(lineStr)) {
      this._debug && this._debug('SUCCESS: Matched SSH identification string!');
      const header = { identRaw: lineStr };
      this._remoteIdentRaw = lineStr;
      if (this._onHeader) this._onHeader(header);
      
      this._parsingState = 'kex';
      this._debug('STATE CHANGE: header -> kex');
      this._kex._sendKexInit();
    } else {
      this._debug(`Parsed a line from server: "${lineStr}" (pre-ident banner)`);
    }
  }
  
  subsystem(recipient, name, wantReply) {
    this.channelRequest(recipient, 'subsystem', wantReply, [this._string(name)]);
  }

  exec(recipient, command, wantReply) {
    this.channelRequest(recipient, 'exec', wantReply, [this._string(command)]);
  }

  shell(recipient, wantReply) {
    this.channelRequest(recipient, 'shell', wantReply);
  }

  env(recipient, name, value, wantReply = false) {
    this.channelRequest(recipient, 'env', wantReply, [this._string(name), this._string(value)]);
  }

  pty(recipient, options = {}, wantReply = true) {
    const term = options.term || 'xterm-256color';
    const cols = options.cols || 80;
    const rows = options.rows || 24;
    const width = options.width || 640;
    const height = options.height || 480;
    const modes = options.modes || Buffer.from([0]);
    const extra = [
      this._string(term),
      this._uint32(cols),
      this._uint32(rows),
      this._uint32(width),
      this._uint32(height),
      this._string(modes),
    ];
    this.channelRequest(recipient, 'pty-req', wantReply, extra);
  }

  windowChange(recipient, options = {}) {
    const extra = [
      this._uint32(options.cols || 80),
      this._uint32(options.rows || 24),
      this._uint32(options.width || 640),
      this._uint32(options.height || 480),
    ];
    this.channelRequest(recipient, 'window-change', false, extra);
  }

  signal(recipient, signalName) {
    this.channelRequest(recipient, 'signal', false, [this._string(signalName)]);
  }

  channelRequest(recipient, requestName, wantReply, extra = []) {
    const requestLen = Buffer.byteLength(requestName);
    const extraLen = extra.reduce((sum, part) => sum + part.length, 0);
    const payload = Buffer.allocUnsafe(1 + 4 + 4 + requestLen + 1 + extraLen);
    let p = 0;

    payload[p++] = MESSAGE.CHANNEL_REQUEST;
    payload.writeUInt32BE(recipient, p); p += 4;
    payload.writeUInt32BE(requestLen, p); p += 4;
    payload.write(requestName, p, 'ascii'); p += requestName.length;
    payload[p++] = wantReply ? 1 : 0;
    for (const part of extra) {
      part.copy(payload, p);
      p += part.length;
    }

    this.sendPacket(payload);
  }

  globalRequest(name, wantReply, extra = []) {
    const nameLen = Buffer.byteLength(name);
    const extraLen = extra.reduce((sum, part) => sum + part.length, 0);
    const payload = Buffer.allocUnsafe(1 + 4 + nameLen + 1 + extraLen);
    let p = 0;

    payload[p++] = MESSAGE.GLOBAL_REQUEST;
    payload.writeUInt32BE(nameLen, p); p += 4;
    payload.write(name, p, 'ascii'); p += nameLen;
    payload[p++] = wantReply ? 1 : 0;
    for (const part of extra) {
      part.copy(payload, p);
      p += part.length;
    }

    this.sendPacket(payload);
  }

  _string(value) {
    const body = Buffer.isBuffer(value) ? value : Buffer.from(String(value), 'utf8');
    const packet = Buffer.allocUnsafe(4 + body.length);
    packet.writeUInt32BE(body.length, 0);
    body.copy(packet, 4);
    return packet;
  }

  _uint32(value) {
    const packet = Buffer.allocUnsafe(4);
    packet.writeUInt32BE(value >>> 0, 0);
    return packet;
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

 _onPayload(payload) {
    const msgType = payload[0];
    this._debug && this._debug(`Inbound: Received message type ${msgType}`);
    if (this.channelManager && msgType >= MESSAGE.CHANNEL_OPEN_CONFIRMATION && msgType <= MESSAGE.CHANNEL_CLOSE) {
      this.channelManager.handleMessage(payload);
      return;
    }
    if (msgType >= 20 && msgType <= 49) {
      if (this._kex) {
        if (msgType === MESSAGE.KEXINIT) this._kex.start(payload);
        else this._kex.handleMessage(payload);
      }
    } else {
      dispatch(this, payload);
    }
  }
  
  disconnect(reason = DISCONNECT_REASON.BY_APPLICATION) {
    const payload = Buffer.alloc(13);
    payload[0] = MESSAGE.DISCONNECT;
    payload.writeUInt32BE(reason, 1);
    // Description and language tag are empty (length 0).
    this.sendPacket(payload);
  }

  _doFatalError(msg) {
    const err = new Error(msg);
    err.level = 'protocol';
    this.disconnect(DISCONNECT_REASON.PROTOCOL_ERROR);
    this._onError(err);
    return Infinity; // Stop parsing
  }

  _getSshPublicKey(privateKey) {
    // This helper extracts the public key from a private key object
    // in the specific format required by the SSH protocol.
    const pubKey = createPublicKey(privateKey);
    const pubKeySsh = pubKey.export({ format: 'ssh' });
    
    // The exported format is "key_type key_data", so we split it.
    const parts = pubKeySsh.toString('ascii').split(' ');
    const keyAlgo = parts[0];
    const pubKeyBlob = Buffer.from(parts[1], 'base64');
    return { keyAlgo, pubKeyBlob };
  }
}

module.exports = { ChochmahProtocol };
