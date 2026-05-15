// B"H
// Tiferet-Handlers.js: Beauty - Message Processing
// VERSION 2.0 - REWRITTEN FOR COMPLETE & ROBUST DISPATCHING

'use strict';

const { MESSAGE } = require('./Binah-Constants.js');
const { BufferReader } = require('./Yesod-Utilities.js');

// This 'handlers' object maps incoming SSH message types to functions that process them.
const handlers = {
  // === Transport Layer Messages ===

  [MESSAGE.DISCONNECT]: (protocol, payload) => {
    const reader = new BufferReader(payload.slice(1));
    const reasonCode = reader.readUInt32BE();
    const description = reader.readString();
    protocol._debug && protocol._debug(`Inbound: Received DISCONNECT (reason: ${reasonCode}, desc: "${description}")`);
    // The server is telling us the connection is over.
    protocol._socket.end();
  },

  // === Service and Authentication Messages ===

  [MESSAGE.SERVICE_ACCEPT]: (protocol, payload) => {
    const reader = new BufferReader(payload.slice(1));
    const serviceName = reader.readString('ascii');
    protocol._debug && protocol._debug(`Inbound: Service accepted: ${serviceName}`);
    protocol.emit('service_accept', serviceName);
  },

  [MESSAGE.USERAUTH_FAILURE]: (protocol, payload) => {
    const reader = new BufferReader(payload.slice(1));
    const methods = reader.readString('ascii').split(',');
    // const partialSuccess = reader.readBool(); // Unused for now
    protocol._debug && protocol._debug(`Inbound: User auth failed. Can continue with: ${methods.join(',')}`);
    const err = new Error(`Authentication failed. Available methods: ${methods.join(',')}`);
    protocol.emit('error', err);
    protocol.disconnect();
  },

  [MESSAGE.USERAUTH_SUCCESS]: (protocol, payload) => {
    protocol._debug && protocol._debug('Inbound: User auth successful!');
    protocol._authenticated = true;
    // This event tells Keter-Client that it's safe to proceed to SFTP/shell etc.
    protocol.emit('userauth_success');
  },
  
  [MESSAGE.USERAUTH_BANNER]: (protocol, payload) => {
    const reader = new BufferReader(payload.slice(1));
    const banner = reader.readString();
    protocol._debug && protocol._debug('Inbound: Received auth banner.');
    protocol.emit('banner', banner);
  },

  [MESSAGE.REQUEST_SUCCESS]: (protocol, payload) => {
    protocol.emit('request_success', payload.slice(1));
  },

  [MESSAGE.REQUEST_FAILURE]: (protocol, payload) => {
    protocol.emit('request_failure', payload.slice(1));
  },
  
  [MESSAGE.USERAUTH_PK_OK]: (protocol, payload) => {
    // This message from the server confirms our public key is acceptable
    // and that we should proceed to send a signature.
    protocol._debug && protocol._debug('Inbound: Received USERAUTH_PK_OK. Continuing with signature.');
    if (protocol._pkAuthContext) {
      protocol._continuePkAuth();
    } else {
      protocol._debug && protocol._debug('Warning: Received unsolicited USERAUTH_PK_OK.');
    }
  },

  // === Channel-Related Messages (CRITICAL FOR SFTP) ===

  [MESSAGE.CHANNEL_SUCCESS]: (protocol, payload) => {
    const reader = new BufferReader(payload.slice(1));
    const recipient = reader.readUInt32BE(); // Our local channel ID
    const chan = protocol.channelManager.get(recipient);
    if (chan) {
      protocol._debug && protocol._debug(`[CHAN ${recipient}] Received CHANNEL_SUCCESS.`);
      // This is often in response to a subsystem request, like for SFTP.
      chan.emit('success'); // A more generic success event
      chan.emit('subsystem_success'); // A specific event for the sftp logic
    }
  },

  [MESSAGE.CHANNEL_FAILURE]: (protocol, payload) => {
    const reader = new BufferReader(payload.slice(1));
    const recipient = reader.readUInt32BE();
    const chan = protocol.channelManager.get(recipient);
    if (chan) {
      protocol._debug && protocol._debug(`[CHAN ${recipient}] Received CHANNEL_FAILURE.`);
      chan.emit('failure');
    }
  },

  [MESSAGE.CHANNEL_REQUEST]: (protocol, payload) => {
    const reader = new BufferReader(payload.slice(1));
    const recipient = reader.readUInt32BE();
    const request = reader.readString('ascii');
    const wantReply = reader.readBool();
    const chan = protocol.channelManager.get(recipient);

    if (!chan) return;

    if (request === 'exit-status') {
      chan.emit('exit_status', reader.readUInt32BE());
      return;
    }

    if (request === 'exit-signal') {
      chan.emit('exit_signal', reader.readString('ascii'));
      return;
    }

    protocol._debug && protocol._debug(`[CHAN ${recipient}] Ignored channel request "${request}" (wantReply=${wantReply}).`);
  },
  
  // Note: Most channel messages (DATA, WINDOW_ADJUST, EOF, CLOSE, OPEN_CONFIRMATION)
  // are handled directly by Netzach-ChannelManager.js for efficiency.
  // This file only handles the non-data-flow messages.
};

/**
 * The main dispatch function. It takes the protocol instance and a raw payload,
 * identifies the message type, and calls the appropriate handler.
 * @param {ChochmahProtocol} protocol - The active protocol instance.
 * @param {Buffer} payload - The complete, decrypted SSH message payload.
 */
function dispatch(protocol, payload) {
  const msgType = payload[0];
  const handler = handlers[msgType];

  if (handler) {
    try {
      handler(protocol, payload);
    } catch (ex) {
      protocol._debug(`Error in handler for message type ${msgType}: ${ex.message}`);
      protocol._doFatalError('Error processing incoming packet.');
    }
  } else {
    protocol._debug && protocol._debug(`Inbound: No handler for message type ${msgType}, ignoring.`);
  }
}

module.exports = { dispatch };
