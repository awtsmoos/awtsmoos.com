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
      this._protocol.requestService('ssh-userauth');
    });

    // STATE 2: Authentication service is accepted by the server.
    this._protocol.on('service_accept', (service) => {
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
      this.emit('authenticated');
    });
    
    this._protocol.on('error', (err) => this.emit('error', err));


    // Wire up the socket events to the protocol and the client itself.
  
    this._socket.on('data', (data) => {
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
      this._cleanUp();
      this.emit('close', hadError);
    });

    this._socket.on('timeout', () => {
      const err = new Error('Connection timed out.');
      this.emit('error', err);
      if (this._socket) this._socket.destroy();
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
      this._protocol.subsystem(chan.sender, 'sftp', true);
    });

    chan.on('success', () => {
      this._protocol._debug && this._protocol._debug('Client: SFTP subsystem ready.');
      const sftp = new MalkuthSFTP(chan);
      sftp.once('ready', () => callback(null, sftp));
      sftp.once('error', callback);
    });

    chan.on('failure', () => {
      callback(new Error('Failed to open SFTP subsystem.'));
    });
    
    chan.on('error', (err) => {
      this.emit('error', err);
    });
  }

  exec(command, options, callback) {
    if (typeof options === 'function') {
      callback = options;
      options = {};
    }
    options = options || {};

    if (!this._protocol || !this._protocol._authenticated) {
      const err = new Error('Not authenticated yet. Cannot execute a command.');
      return process.nextTick(() => callback(err));
    }

    const chan = this._protocol.channelManager.openSession();
    const stdout = [];
    const stderr = [];
    const input = options.input;
    let exitCode = null;
    let exitSignal = null;
    let requestAccepted = false;
    let finished = false;

    const finish = (err) => {
      if (finished) return;
      finished = true;
      callback(err, {
        stdout: Buffer.concat(stdout).toString('utf8'),
        stderr: Buffer.concat(stderr).toString('utf8'),
        code: exitCode,
        signal: exitSignal,
      });
    };

    chan.on('ready', () => {
      for (const [name, value] of Object.entries(options.env || {})) {
        this._protocol.env(chan.sender, name, String(value), false);
      }
      if (options.pty) {
        this._protocol.pty(chan.sender, typeof options.pty === 'object' ? options.pty : {}, false);
      }
      this._protocol.exec(chan.sender, command, true);
    });
    chan.on('success', () => {
      requestAccepted = true;
      if (input !== undefined && input !== null) {
        chan.data(Buffer.isBuffer(input) ? input : Buffer.from(String(input)));
      }
      if (options.end !== false) chan.eof();
    });
    chan.on('failure', () => {
      finish(new Error(`Failed to execute remote command: ${command}`));
    });
    chan.on('data', (data) => stdout.push(data));
    chan.on('extended_data', (type, data) => {
      if (type === 1) stderr.push(data);
    });
    chan.on('exit_status', (code) => {
      exitCode = code;
    });
    chan.on('exit_signal', (signal) => {
      exitSignal = signal;
    });
    chan.on('close', () => {
      if (!requestAccepted && exitCode === null && exitSignal === null) {
        finish(new Error(`Remote command channel closed before exec was accepted: ${command}`));
        return;
      }
      finish(null);
    });
    chan.on('error', finish);
  }

  shell(options, callback) {
    if (typeof options === 'function') {
      callback = options;
      options = {};
    }
    options = options || {};

    if (!this._protocol || !this._protocol._authenticated) {
      const err = new Error('Not authenticated yet. Cannot open a shell.');
      return process.nextTick(() => callback(err));
    }

    const chan = this._protocol.channelManager.openSession();
    let ready = false;

    chan.write = (data) => chan.data(Buffer.isBuffer(data) ? data : Buffer.from(String(data)));
    chan.setWindow = (size) => this._protocol.windowChange(chan.sender, size);
    chan.signal = (name) => this._protocol.signal(chan.sender, name);

    chan.on('ready', () => {
      for (const [name, value] of Object.entries(options.env || {})) {
        this._protocol.env(chan.sender, name, String(value), false);
      }
      if (options.pty !== false) {
        this._protocol.pty(chan.sender, typeof options.pty === 'object' ? options.pty : {}, false);
      }
      this._protocol.shell(chan.sender, true);
    });

    chan.on('success', () => {
      if (ready) return;
      ready = true;
      callback(null, chan);
    });
    chan.on('failure', () => callback(new Error('Failed to open remote shell.')));
    chan.on('error', callback);
  }

  forwardOut(host, port, originHost, originPort, callback) {
    if (typeof originHost === 'function') {
      callback = originHost;
      originHost = '127.0.0.1';
      originPort = 0;
    }

    if (!this._protocol || !this._protocol._authenticated) {
      const err = new Error('Not authenticated yet. Cannot open a forwarded connection.');
      return process.nextTick(() => callback(err));
    }

    const chan = this._protocol.channelManager.openDirectTcpip(host, port, originHost, originPort || 0);
    chan.write = (data) => chan.data(Buffer.isBuffer(data) ? data : Buffer.from(String(data)));
    chan.on('ready', () => callback(null, chan));
    chan.on('error', callback);
  }

  forwardLocal(localPort, host, port, callback) {
    const server = net.createServer((socket) => {
      this.forwardOut(host, port, socket.remoteAddress || '127.0.0.1', socket.remotePort || 0, (err, chan) => {
        if (err) {
          socket.destroy(err);
          return;
        }

        socket.on('data', (data) => chan.data(data));
        socket.on('end', () => chan.eof());
        socket.on('close', () => chan.close());
        socket.on('error', () => chan.close());
        chan.on('data', (data) => socket.write(data));
        chan.on('eof', () => socket.end());
        chan.on('close', () => socket.destroy());
        chan.on('error', () => socket.destroy());
      });
    });

    server.listen(localPort, () => callback(null, server));
    server.on('error', callback);
    return server;
  }

  keepalive(callback) {
    if (!this._protocol || !this._protocol._authenticated) {
      const err = new Error('Not authenticated yet. Cannot send keepalive.');
      return process.nextTick(() => callback(err));
    }

    const cleanup = () => {
      this._protocol.off('request_success', onSuccess);
      this._protocol.off('request_failure', onFailure);
    };
    const onSuccess = () => {
      cleanup();
      callback(null, true);
    };
    const onFailure = () => {
      cleanup();
      callback(null, false);
    };

    this._protocol.once('request_success', onSuccess);
    this._protocol.once('request_failure', onFailure);
    this._protocol.globalRequest('keepalive@openssh.com', true);
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
