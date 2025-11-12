// B"H
// Keter-Client.js: The Crown - The Highest Interface (UPDATED FOR DEBUGGING)

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
  }

  connect(config) {
    if (this._socket) {
      throw new Error('A connection is already in progress or established.');
    }

    this._socket = new net.Socket();

    // *** NEW: Set a connection timeout of 10 seconds ***
    this._socket.setTimeout(10000);

    const protocolConfig = {
      server: false,
      onWrite: (data) => this._socket.write(data),
      onError: (err) => {
        this.emit('error', err);
        this.end();
      },
      onHeader: (header) => this.emit('banner', header.identRaw),
      onHandshakeComplete: () => {
        this.emit('ready');
        // After handshake, we MUST request the user authentication service and then WAIT.
        this._protocol.requestService('ssh-userauth');
      },
      debug: config.debug,
    };

    this._protocol = new ChochmahProtocol(protocolConfig);
    
     this._protocol.on('service_accept', (service) => {
        if (service === 'ssh-userauth') {
            if (config.password) {
                this._protocol.authPassword(config.username, config.password);
            } else {
                this.emit('error', new Error('Passwordless auth not yet implemented.'));
                this.end();
            }
        }
    });
    
    this._protocol.on('userauth_success', () => this.emit('authenticated'));

    this._socket.on('data', (data) => this._protocol.parse(data));
    
    this._socket.on('connect', () => {
      // *** NEW: Clear the timeout on successful connection ***
      this._socket.setTimeout(0); 
      this.emit('connect');
      this._protocol.start();
    });
    
    this._socket.on('error', (err) => this.emit('error', err));
    
    this._socket.on('close', (hadError) => {
      this._socket = null;
      this._protocol = null;
      this.emit('close', hadError);
    });

    // *** NEW: Handle the timeout event ***
    this._socket.on('timeout', () => {
      const err = new Error('Connection timed out. Check firewall or server address.');
      this.emit('error', err);
      this._socket.destroy(); // Forcefully close the socket
    });

    this._socket.connect(config.port, config.host);
  }

  sftp(callback) {
    if (!this._protocol || !this._protocol._authenticated) {
      return callback(new Error('Not authenticated yet.'));
    }
    
    this._protocol._debug && this._protocol._debug('Client: Requesting SFTP subsystem.');
    const chan = this._protocol.channelManager.openSession();
    
    chan.on('ready', () => {
      this._protocol.subsystem(chan.recipient, 'sftp', true);
    });

    chan.on('subsystem_success', () => {
      this._protocol._debug && this._protocol._debug('Client: SFTP subsystem ready.');
      const sftp = new MalkuthSFTP(chan);
      sftp.on('ready', () => {
          callback(null, sftp);
      });
      sftp.on('error', (err) => {
          this.emit('error', err);
      });
    });

    chan.on('failure', () => {
      callback(new Error('Failed to open SFTP subsystem.'));
    });
  }

  end() {
    if (this._protocol) this._protocol.disconnect();
    if (this._socket) this._socket.end();
  }
}

module.exports = { KeterClient };