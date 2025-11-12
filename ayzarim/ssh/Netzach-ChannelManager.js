// B"H
// Netzach-ChannelManager.js: Endurance - Channel Management

'-use strict';

const { EventEmitter } = require('events');
const { MESSAGE, CHANNEL_OPEN_FAILURE } = require('./Binah-Constants.js');
const { readUInt32BE, writeUInt32BE, BufferReader } = require('./Yesod-Utilities.js');

const MAX_CHANNELS = 2 ** 32 - 1;
const DEFAULT_WINDOW = 2 * 1024 * 1024; // 2MB
const DEFAULT_PACKET_SIZE = 32 * 1024; // 32KB

// Represents a single SSH channel
class Channel extends EventEmitter {
  constructor(manager, info) {
    super();
    this._manager = manager;
    this._protocol = manager._protocol;
    
    // Incoming info from the remote side
    this.type = info.type;
    this.sender = info.sender; // Remote channel ID
    this.window = info.window; // Remote window size
    this.packetSize = info.packetSize; // Remote max packet size

    // Our local info for this channel
    this.recipient = manager.add(this); // Local channel ID
    this.inWindow = DEFAULT_WINDOW;
    this.inPacketSize = DEFAULT_PACKET_SIZE;

    this.ended = false; // Set to true when we receive CHANNEL_EOF
  }

  // Called when we receive data for this channel
  handleData(data) {
    this.inWindow -= data.length;
    this.emit('data', data);
    // TODO: We should send a WINDOW_ADJUST if the window gets too low
  }
  
  // Send data over this channel
  data(data) {
    if (this.window === 0) {
      // TODO: Implement backpressure by queueing data
      return false;
    }
    
    const sliceSize = Math.min(data.length, this.window, this.packetSize);
    const payload = data.slice(0, sliceSize);
    
    const packet = this._protocol._packetRW.write.alloc(1 + 4 + 4 + payload.length);
    let p = this._protocol._packetRW.write.allocStart;
    
    packet[p++] = MESSAGE.CHANNEL_DATA;
    writeUInt32BE(packet, this.sender, p); p += 4;
    writeUInt32BE(packet, payload.length, p); p += 4;
    payload.copy(packet, p);

    this.window -= sliceSize;
    this._protocol.sendPacket(this._protocol._packetRW.write.finalize(packet));

    if (sliceSize < data.length) {
      // Data was too large, send the rest in the next turn
      // TODO: Queue remaining data
    }
    return true;
  }
  
  // Signal the end of the data stream from our side
  eof() {
    const packet = this._protocol._packetRW.write.alloc(1 + 4);
    let p = this._protocol._packetRW.write.allocStart;

    packet[p++] = MESSAGE.CHANNEL_EOF;
    writeUInt32BE(packet, this.sender, p);
    this._protocol.sendPacket(this._protocol._packetRW.write.finalize(packet));
  }
  
  // Close the channel
  close() {
    const packet = this._protocol._packetRW.write.alloc(1 + 4);
    let p = this._protocol._packetRW.write.allocStart;

    packet[p++] = MESSAGE.CHANNEL_CLOSE;
    writeUInt32BE(packet, this.sender, p);
    this._protocol.sendPacket(this._protocol._packetRW.write.finalize(packet));
  }
}

// Manages all channels for a single SSH connection
class NetzachChannelManager {
  constructor(protocol) {
    this._protocol = protocol;
    this._debug = protocol._debug;
    this._channels = new Map();
    this._nextChan = 0;
  }

  // Add a new channel to our tracking map and return its local ID
  add(channel) {
    const id = this._nextChan++;
    if (this._nextChan > MAX_CHANNELS) {
      this._nextChan = 0;
    }
    this._channels.set(id, channel);
    this._debug && this._debug(`Channel Manager: Added channel, local ID ${id}`);
    return id;
  }
  
  get(localId) {
    return this._channels.get(localId);
  }

  // Open a new 'session' channel (e.g., for exec or shell)
  openSession() {
    const chan = new Channel(this, {
        type: 'session',
        sender: -1, // We don't know the remote ID yet
        window: 0,
        packetSize: 0,
    });

    const packet = this._protocol._packetRW.write.alloc(1 + 4 + 7 + 4 + 4 + 4);
    let p = this._protocol._packetRW.write.allocStart;
    
    packet[p++] = MESSAGE.CHANNEL_OPEN;
    writeUInt32BE(packet, 7, p); p += 4;
    packet.write('session', p, 'ascii'); p += 7;
    writeUInt32BE(packet, chan.recipient, p); p += 4; // Our local ID
    writeUInt32BE(packet, chan.inWindow, p); p += 4;
    writeUInt32BE(packet, chan.inPacketSize, p);

    this._protocol.sendPacket(this._protocol._packetRW.write.finalize(packet));
    this._debug && this._debug(`Channel Manager: Opening session channel (local ID ${chan.recipient})`);
    
    return chan;
  }
  
  // Handles all incoming channel-related messages
  handleMessage(payload) {
    const msgType = payload[0];
    const reader = new BufferReader(payload.slice(1));

    switch(msgType) {
      case MESSAGE.CHANNEL_OPEN: {
        const type = reader.readString('ascii');
        const sender = reader.readUInt32BE(); // Remote ID
        const window = reader.readUInt32BE();
        const packetSize = reader.readUInt32BE();
        
        this._debug && this._debug(`Channel Manager: Inbound CHANNEL_OPEN for type ${type}`);
        
        // For now, we only accept session channels as a server.
        // A full implementation would check against allowed channel types.
        if (this._protocol._server && type === 'session') {
            const chan = new Channel(this, { type, sender, window, packetSize });
            const packet = this._protocol._packetRW.write.alloc(1 + 4 + 4 + 4 + 4);
            let p = this._protocol._packetRW.write.allocStart;
            
            packet[p++] = MESSAGE.CHANNEL_OPEN_CONFIRMATION;
            writeUInt32BE(packet, chan.sender, p); p += 4;
            writeUInt32BE(packet, chan.recipient, p); p += 4;
            writeUInt32BE(packet, chan.inWindow, p); p += 4;
            writeUInt32BE(packet, chan.inPacketSize, p);
            
            this._protocol.sendPacket(this._protocol._packetRW.write.finalize(packet));
            this._protocol.emit('channel', chan);
        } else {
            // Reject the channel open request
            const packet = this._protocol._packetRW.write.alloc(1 + 4 + 4 + 4 + 4);
            let p = this._protocol._packetRW.write.allocStart;

            packet[p++] = MESSAGE.CHANNEL_OPEN_FAILURE;
            writeUInt32BE(packet, sender, p); p += 4;
            writeUInt32BE(packet, CHANNEL_OPEN_FAILURE.ADMINISTRATIVELY_PROHIBITED, p); p += 4;
            writeUInt32BE(packet, 0, p); p += 4; // No description
            writeUInt32BE(packet, 0, p); // No lang tag

            this._protocol.sendPacket(this._protocol._packetRW.write.finalize(packet));
        }
        break;
      }
      
      case MESSAGE.CHANNEL_OPEN_CONFIRMATION: {
        const recipient = reader.readUInt32BE(); // Our local ID
        const sender = reader.readUInt32BE(); // The new remote ID
        const window = reader.readUInt32BE();
        const packetSize = reader.readUInt32BE();
        
        const chan = this.get(recipient);
        if (chan) {
            chan.sender = sender;
            chan.window = window;
            chan.packetSize = packetSize;
            this._debug && this._debug(`Channel Manager: Confirmed channel ${recipient}, remote ID is now ${sender}`);
            chan.emit('ready');
        }
        break;
      }
      
      case MESSAGE.CHANNEL_DATA: {
        const recipient = reader.readUInt32BE();
        const data = reader.readString(null); // Read as buffer
        const chan = this.get(recipient);
        if (chan) {
            chan.handleData(data);
        }
        break;
      }
      
      case MESSAGE.CHANNEL_EOF: {
        const recipient = reader.readUInt32BE();
        const chan = this.get(recipient);
        if (chan) {
            chan.ended = true;
            chan.emit('eof');
        }
        break;
      }
      
      case MESSAGE.CHANNEL_CLOSE: {
        const recipient = reader.readUInt32BE();
        const chan = this.get(recipient);
        if (chan) {
            this._channels.delete(recipient);
            chan.emit('close');
        }
        break;
      }

      case MESSAGE.CHANNEL_WINDOW_ADJUST: {
        const recipient = reader.readUInt32BE();
        const bytesToAdd = reader.readUInt32BE();
        const chan = this.get(recipient);
        if (chan) {
            chan.window += bytesToAdd;
            this._debug && this._debug(`Channel Manager: Window adjust for channel ${recipient}, new window is ${chan.window}`);
            chan.emit('window_adjust');
        }
        break;
      }
    }
  }
}

module.exports = { NetzachChannelManager };