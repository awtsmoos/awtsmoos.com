// B"H
// Keter-Client.js: The Crown - The Highest Interface
// VERSION 2.0 - REWRITTEN FOR ROBUST STATE & EVENT MANAGEMENT

'use strict';

const net = require('net');
const { EventEmitter } = require('events');
const { ChochmahProtocol } = require('./Chochmah-Protocol.js');
const { MalkuthSFTP } = require('./Malkuth-SFTP.js');

class KeterClient extends EventEmitter {
  constructor() {
    super();
    this._socket = null;
    this._protocol = null;
    this._config = null; // Store config for later use
  }

  connect(config) {
    if (this._socket) {
      throw new Error('A connection is already in progress or established.');
    }
    this._config = config;
    this._socket = new net.Socket();

    const protocolConfig = {
      server: false,
      onWrite: (data) => {
        if (this._socket && !this._socket.destroyed) {
          // =========================================================================
          // THE ULTIMATE LOG: Show the raw hex data being sent on the wire.
          // =========================================================================
          console.log(`[!!! HEX DUMP !!!] Writing ${data.length} bytes: ${data.toString('hex')}`);
          this._socket.write(data);
        }
      },
      onError: (err) => this.emit('error', err),
      onHeader: (header) => this.emit('banner', header.identRaw),
      onHandshakeComplete: () => {},
      debug: config.debug,
    };

    this._protocol = new ChochmahProtocol(protocolConfig);
    
    // =========================================================================
    // INSTRUMENTED EVENT LISTENERS - These will pinpoint the failure.
    // =========================================================================

    // STATE 1: Handshake completes.
    this._protocol.on('handshake_complete', () => {
      // LOG 3: Confirm this listener fires.
      console.log('[!!! KETER LOG !!!] Received "handshake_complete" event. Requesting auth service.');
      this._protocol.requestService('ssh-userauth');
    });

    // STATE 2: Authentication service is accepted by the server.
    this._protocol.on('service_accept', (service) => {
      // LOG 4: This is the log we suspect is NOT being printed.
      console.log('[!!! KETER LOG !!!] Received "service_accept" event for service:', service);
      if (service === 'ssh-userauth') {
        if (this._config.password) {
          this._protocol.authPassword(this._config.username, this._config.password);
        } else if (this._config.privateKey) {
          this._protocol.authPublicKey(this._config.username, this._config.privateKey);
        } else {
          this.emit('error', new Error('No authentication method available (password or privateKey).'));
          this.end();
        }
      }
    });

    // STATE 3: Authentication is successful.
    this._protocol.on('userauth_success', () => {
      // LOG 5: Confirm authentication success.
      console.log('[!!! KETER LOG !!!] Received "userauth_success" event.');
      this.emit('authenticated');
    });
    
    // LOG 6: A catch-all to see if ANY events are coming from the protocol object.
    this._protocol.on('error', (err) => console.log('[!!! KETER LOG !!!] Protocol emitted an error:', err.message));


    // Wire up the socket events to the protocol and the client itself.
  
    this._socket.on('data', (data) => {
      // LOG 0: EARLIEST POSSIBLE POINT. Show the raw encrypted data.
      console.log(`[!!! RAW DATA LOG !!!] Received ${data.length} encrypted bytes from server.`);
      if (this._protocol) {
        this._protocol.parse(data);
      }
    });
    
    this._socket.on('connect', () => {
      this.emit('connect');
      this._protocol.start();
    });
    
    this._socket.on('error', (err) => this.emit('error', err));
    
    // Inside the KeterClient connect method...
    this._socket.on('close', (hadError) => {
      // LOG B: The moment the socket is confirmed to be closed.
      console.log(`[!!! CLOSE LOG !!!] The socket 'close' event has fired. HadError: ${hadError}`);
      
      // LOG C: What was the authentication status right before close?
      console.log(`[!!! CLOSE LOG !!!] Authentication status at time of close: ${this._protocol ? this._protocol._authenticated : 'N/A'}`);
      
      this._cleanUp();
      this.emit('close', hadError);
    });

    this._socket.on('timeout', () => {
    
      console.trace("About to timeout?")
      const err = new Error('Connection timed out.');
      this.emit('error', err);
      this._socket.destroy();
    });

    this._socket.setTimeout(10000);
    this._socket.connect(config.port, config.host);
  }
  
  end() {
    if (this._protocol) {
      this._protocol.disconnect();
    }
    if (this._socket) {
      this._socket.end();
    }
    this._cleanUp();
  }
  
  sftp(callback) {
    if (!this._protocol || !this._protocol._authenticated) {
      const err = new Error('Not authenticated yet. Cannot open SFTP session.');
      return process.nextTick(() => callback(err));
    }
    
    this._protocol._debug && this._protocol._debug('Client: Requesting SFTP subsystem.');
    const chan = this._protocol.channelManager.openSession();
    
    chan.on('ready', () => {
      this._protocol.subsystem(chan.recipient, 'sftp', true);
    });

    chan.on('success', () => {
      this._protocol._debug && this._protocol._debug('Client: SFTP subsystem ready.');
      const sftp = new MalkuthSFTP(chan);
      callback(null, sftp);
    });

    chan.on('failure', () => {
      callback(new Error('Failed to open SFTP subsystem.'));
    });
    
    chan.on('error', (err) => {
      this.emit('error', err);
    });
  }
  
  _cleanUp() {
    this._socket = null;
    if (this._protocol) {
      this._protocol.removeAllListeners();
      this._protocol = null;
    }
    this._config = null;
  }
}

module.exports = { KeterClient };