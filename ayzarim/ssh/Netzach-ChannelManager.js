// B"H
// Netzach-ChannelManager.js: Endurance - Channel Management
// VERSION 2.0 - REWRITTEN FOR FLAWLESS FLOW CONTROL & BACKPRESSURE

'use strict';

const { EventEmitter } = require('events');
const { MESSAGE, CHANNEL_OPEN_FAILURE } = require('./Binah-Constants.js');
const { BufferReader } = require('./Yesod-Utilities.js');

// Default channel parameters per RFC 4254.
const MAX_CHANNELS = 2 ** 32 - 1;
const DEFAULT_WINDOW = 2 * 1024 * 1024; // 2MB initial window size
const DEFAULT_PACKET_SIZE = 32 * 1024;  // 32KB max payload size

// =============================================================================
//
// Channel CLASS - A flawless implementation of a single SSH channel
//
// =============================================================================
class Channel extends EventEmitter {
  constructor(manager) {
    super();
    this._manager = manager;
    this._protocol = manager._protocol;
    this._debug = this._protocol._debug;

    // Our local properties for this channel.
    this.recipient = manager.add(this); // Our local ID for this channel.
    this.inWindow = DEFAULT_WINDOW;     // How much data we are willing to receive.
    this.inPacketSize = DEFAULT_PACKET_SIZE; // Max size of a single data packet we'll accept.

    // Remote properties, populated by CHANNEL_OPEN_CONFIRMATION or CHANNEL_OPEN.
    this.type = null;
    this.sender = -1;           // The remote end's ID for this channel.
    this.outWindow = 0;         // How much data the remote end is willing to receive.
    this.outPacketSize = 0;     // Max size of a single data packet they'll accept.

    this._state = 'opening'; // 'opening', 'open', 'closing', 'closed'
    this._sendQueue = [];    // Buffer for data when the outWindow is full (backpressure).
  }

  // Called by the manager when a CHANNEL_DATA packet arrives for us.
  _handleData(data) {
    if (this.inWindow < data.length) {
      // This is a protocol violation by the remote end.
      this._protocol._doFatalError('Remote peer exceeded channel window size.');
      return;
    }
    
    this.inWindow -= data.length;
    this.emit('data', data);
    
    // ================== CRITICAL FLOW CONTROL LOGIC ==================
    // If our window has depleted by more than half, we send a WINDOW_ADJUST
    // to replenish it, ensuring the data stream doesn't stall.
    // The amount we add back is the amount we've consumed.
    // =================================================================
    const consumed = DEFAULT_WINDOW - this.inWindow;
    if (consumed >= DEFAULT_WINDOW / 2) {
      this._debug(`[CHAN ${this.recipient}] InWindow depleted to ${this.inWindow}. Adjusting by ${consumed}.`);
      this._adjustInWindow(consumed);
      this.inWindow += consumed;
    }
  }

  _handleExtendedData(type, data) {
    if (this.inWindow < data.length) {
      this._protocol._doFatalError('Remote peer exceeded channel window size.');
      return;
    }

    this.inWindow -= data.length;
    this.emit('extended_data', type, data);

    const consumed = DEFAULT_WINDOW - this.inWindow;
    if (consumed >= DEFAULT_WINDOW / 2) {
      this._debug(`[CHAN ${this.recipient}] InWindow depleted to ${this.inWindow}. Adjusting by ${consumed}.`);
      this._adjustInWindow(consumed);
      this.inWindow += consumed;
    }
  }

  // Send a CHANNEL_WINDOW_ADJUST packet to the remote end.
  _adjustInWindow(bytesToAdd) {
    const payload = Buffer.allocUnsafe(9);
    payload[0] = MESSAGE.CHANNEL_WINDOW_ADJUST;
    payload.writeUInt32BE(this.sender, 1);
    payload.writeUInt32BE(bytesToAdd, 5);
    this._protocol.sendPacket(payload);
  }

  // Called by the manager when the remote window is adjusted.
  _handleWindowAdjust(bytesToAdd) {
    this.outWindow += bytesToAdd;
    this._debug(`[CHAN ${this.recipient}] OutWindow adjusted by ${bytesToAdd}. New size: ${this.outWindow}.`);
    
    // Now that we have more window space, try to send any queued data.
    this._flushQueue();
    if (this._state === 'open') {
        this.emit('drain'); // Signal that the channel is ready for more data.
    }
  }

  // Public API to send data over the channel. Implements backpressure.
  data(data) {
    if (this._state !== 'open') {
      this._debug(`[CHAN ${this.recipient}] Warning: Attempted to write data while channel state is '${this._state}'.`);
      return false;
    }

    if (this._sendQueue.length > 0) {
      this._sendQueue.push(data);
      return false; // Channel is already congested.
    }
    
    const sent = this._send(data);
    const remaining = data.slice(sent);
    
    if (remaining.length > 0) {
      this._sendQueue.push(remaining);
      return false; // Window was consumed; signal backpressure.
    }
    
    return true; // All data was sent immediately.
  }
  
  // Internal method to send data and manage the outWindow.
  _send(data) {
    let sent = 0;
    while (sent < data.length && this.outWindow > 0) {
      const payloadSize = Math.min(data.length - sent, this.outWindow, this.outPacketSize);
      if (payloadSize <= 0) break;

      const payload = data.slice(sent, sent + payloadSize);
      const packet = Buffer.allocUnsafe(9 + payload.length);
      packet[0] = MESSAGE.CHANNEL_DATA;
      packet.writeUInt32BE(this.sender, 1);
      packet.writeUInt32BE(payload.length, 5);
      payload.copy(packet, 9);
      this._protocol.sendPacket(packet);

      this.outWindow -= payloadSize;
      sent += payloadSize;
    }
    return sent;
  }
  
  // Try to send data from the internal queue.
  _flushQueue() {
    if (this._sendQueue.length === 0) return;
    
    const chunk = this._sendQueue[0];
    const sent = this._send(chunk);
    
    if (sent === chunk.length) {
      this._sendQueue.shift(); // Sent the whole chunk
    } else {
      this._sendQueue[0] = chunk.slice(sent); // Sent a partial chunk
    }

    // If there's still more to send, we'll wait for the next WINDOW_ADJUST.
  }
  
  // Signal that we will not send any more data.
  eof() {
    if (this._state !== 'open') return;
    this._debug(`[CHAN ${this.recipient}] Sending EOF.`);
    this._state = 'closing';
    const payload = Buffer.allocUnsafe(5);
    payload[0] = MESSAGE.CHANNEL_EOF;
    payload.writeUInt32BE(this.sender, 1);
    this._protocol.sendPacket(payload);
  }
  
  // Request to close the channel.
  close() {
    if (this._state === 'closed') return;
    this._debug(`[CHAN ${this.recipient}] Sending CLOSE.`);
    this._state = 'closed';
    const payload = Buffer.allocUnsafe(5);
    payload[0] = MESSAGE.CHANNEL_CLOSE;
    payload.writeUInt32BE(this.sender, 1);
    this._protocol.sendPacket(payload);
    this._manager.remove(this.recipient);
    this.emit('close');
  }

  _handleClose() {
    if (this._state === 'closed') return;
    this._debug(`[CHAN ${this.recipient}] Received CLOSE from remote.`);
    this._state = 'closed';
    const payload = Buffer.allocUnsafe(5);
    payload[0] = MESSAGE.CHANNEL_CLOSE;
    payload.writeUInt32BE(this.sender, 1);
    this._protocol.sendPacket(payload);
    this._manager.remove(this.recipient);
    this.emit('close');
  }
}


// =============================================================================
//
// NetzachChannelManager CLASS - Manages all channels for the connection.
//
// =============================================================================
class NetzachChannelManager {
  constructor(protocol) {
    this._protocol = protocol;
    this._debug = protocol._debug;
    this._channels = new Map();
    this._nextChan = 0;
  }

  add(channel) {
    // Find the next available channel ID.
    while (this._channels.has(this._nextChan)) {
      this._nextChan = (this._nextChan + 1) % MAX_CHANNELS;
    }
    this._channels.set(this._nextChan, channel);
    this._debug(`Channel Manager: Added channel, local ID ${this._nextChan}`);
    return this._nextChan;
  }
  
  remove(localId) {
    this._channels.delete(localId);
    this._debug(`Channel Manager: Removed channel, local ID ${localId}`);
  }

  get(localId) {
    return this._channels.get(localId);
  }

  // Open a new 'session' channel (for shell, exec, or subsystems).
  openSession() {
    return this.openChannel('session');
  }

  openDirectTcpip(host, port, originHost = '127.0.0.1', originPort = 0) {
    const extra = [
      this._string(host),
      this._uint32(port),
      this._string(originHost),
      this._uint32(originPort),
    ];
    return this.openChannel('direct-tcpip', extra);
  }

  openChannel(type, extra = []) {
    const chan = new Channel(this);
    chan.type = type;
    const extraLen = extra.reduce((sum, part) => sum + part.length, 0);
    
    const payload = Buffer.allocUnsafe(17 + chan.type.length + extraLen);
    let p = 0;
    payload[p++] = MESSAGE.CHANNEL_OPEN;
    payload.writeUInt32BE(chan.type.length, p); p += 4;
    payload.write(chan.type, p, 'ascii'); p += chan.type.length;
    payload.writeUInt32BE(chan.recipient, p); p += 4; // Our local ID
    payload.writeUInt32BE(chan.inWindow, p); p += 4;
    payload.writeUInt32BE(chan.inPacketSize, p); p += 4;
    for (const part of extra) {
      part.copy(payload, p);
      p += part.length;
    }

    this._protocol.sendPacket(payload);
    this._debug(`Channel Manager: Opening ${type} channel (local ID ${chan.recipient})`);
    return chan;
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
  
  handleMessage(payload) {
    const reader = new BufferReader(payload);
    const msgType = reader.readByte();
    const recipient = reader.readUInt32BE(); // The local channel ID
    const chan = this.get(recipient);

    if (!chan) {
      this._debug(`Warning: Received message type ${msgType} for unknown channel ${recipient}.`);
      return;
    }

    switch(msgType) {
      case MESSAGE.CHANNEL_OPEN_CONFIRMATION: {
        chan.sender = reader.readUInt32BE(); // The new remote ID
        chan.outWindow = reader.readUInt32BE();
        chan.outPacketSize = reader.readUInt32BE();
        chan._state = 'open';
        this._debug(`[CHAN ${recipient}] Confirmed, remote ID is ${chan.sender}, outWindow is ${chan.outWindow}`);
        chan.emit('ready');
        break;
      }
      case MESSAGE.CHANNEL_OPEN_FAILURE: {
        chan._state = 'closed';
        this.remove(recipient);
        chan.emit('error', new Error('Channel open failed by remote.'));
        chan.emit('close');
        break;
      }
      case MESSAGE.CHANNEL_DATA: {
        const data = reader.readString(null);
        chan._handleData(data);
        break;
      }
      case MESSAGE.CHANNEL_EXTENDED_DATA: {
        const type = reader.readUInt32BE();
        const data = reader.readString(null);
        chan._handleExtendedData(type, data);
        break;
      }
      case MESSAGE.CHANNEL_WINDOW_ADJUST: {
        const bytesToAdd = reader.readUInt32BE();
        chan._handleWindowAdjust(bytesToAdd);
        break;
      }
      case MESSAGE.CHANNEL_EOF: {
        chan.emit('eof');
        break;
      }
      case MESSAGE.CHANNEL_CLOSE: {
        chan._handleClose();
        break;
      }
      // Messages like CHANNEL_REQUEST are handled in Tiferet-Handlers
      // to keep this manager focused on data flow.
    }
  }
}

// NOTE: The server-side CHANNEL_OPEN logic (accepting incoming channels)
// would reside in Tiferet-Handlers. This manager is now client-focused.

module.exports = { NetzachChannelManager, Channel };
