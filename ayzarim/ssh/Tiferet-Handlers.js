// B"H
// Tiferet-Handlers.js: Beauty - Message Processing

'use strict';

const { MESSAGE, DISCONNECT_REASON } = require('./Binah-Constants.js');

// A simple, local Buffer reader class. This will be centralized in Yesod-Utilities.js later.
class BufferReader {
  constructor(buffer) {
    this.buffer = buffer;
    this.pos = 0;
  }
  readUInt32BE() {
    const val = this.buffer.readUInt32BE(this.pos);
    this.pos += 4;
    return val;
  }
  readString(encoding = 'utf8') {
    const len = this.readUInt32BE();
    const str = this.buffer.slice(this.pos, this.pos + len).toString(encoding);
    this.pos += len;
    return str;
  }
  readList() {
    const str = this.readString('ascii');
    return str.length > 0 ? str.split(',') : [];
  }
  readBool() {
    return this.buffer[this.pos++] !== 0;
  }
}

const handlers = {
  [MESSAGE.DISCONNECT]: (protocol, payload) => {
    const reader = new BufferReader(payload.slice(1));
    const reasonCode = reader.readUInt32BE();
    const description = reader.readString();
    protocol._debug && protocol._debug(`Inbound: Received DISCONNECT (reason: ${reasonCode}, desc: "${description}")`);
    protocol._socket.end();
  },

  [MESSAGE.SERVICE_ACCEPT]: (protocol, payload) => {
    const reader = new BufferReader(payload.slice(1));
    const serviceName = reader.readString('ascii');
    protocol._debug && protocol._debug(`Inbound: Service accepted: ${serviceName}`);
    // This event will trigger the auth attempt in Keter-Client
    protocol.emit('service_accept', serviceName);
  },

  // === NEW HANDLERS FOR AUTHENTICATION ===
  [MESSAGE.USERAUTH_FAILURE]: (protocol, payload) => {
    const reader = new BufferReader(payload.slice(1));
    const methods = reader.readList();
    const partialSuccess = reader.readBool();
    protocol._debug && protocol._debug(`Inbound: User auth failed. Can continue with: ${methods.join(',')}`);
    const err = new Error(`Authentication failed. Available methods: ${methods.join(',')}`);
    protocol.emit('error', err);
    protocol.end();
  },

  [MESSAGE.USERAUTH_SUCCESS]: (protocol, payload) => {
    protocol._debug && protocol._debug('Inbound: User auth successful!');
    protocol._authenticated = true;
    protocol.emit('userauth_success');
  },

  [MESSAGE.USERAUTH_BANNER]: (protocol, payload) => {
    const reader = new BufferReader(payload.slice(1));
    const banner = reader.readString();
    protocol._debug && protocol._debug('Inbound: Received auth banner.');
    protocol.emit('banner', banner);
  },
  // ==========================================
  
  // === NEW HANDLERS FOR CHANNELS ===
  [MESSAGE.CHANNEL_SUCCESS]: (protocol, payload) => {
    const reader = new BufferReader(payload.slice(1));
    const recipient = reader.readUInt32BE();
    const chan = protocol.channelManager.get(recipient);
    if (chan) {
      chan.emit('subsystem_success');
    }
  },

  [MESSAGE.CHANNEL_FAILURE]: (protocol, payload) => {
    const reader = new BufferReader(payload.slice(1));
    const recipient = reader.readUInt32BE();
    const chan = protocol.channelManager.get(recipient);
    if (chan) {
      chan.emit('failure');
    }
  },
  // ====================================
};

function dispatch(protocol, payload) {
  const msgType = payload[0];
  const handler = handlers[msgType];

  if (handler) {
    handler(protocol, payload);
  } else {
    protocol._debug && protocol._debug(`Inbound: No handler for message type ${msgType}`);
  }
}

module.exports = { dispatch };