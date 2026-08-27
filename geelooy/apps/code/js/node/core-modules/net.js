
// B"H
export const netModule = `
const EventEmitter = require('events');

class Socket extends EventEmitter {
    constructor(internalId) {
        super();
        this._internalId = internalId;
        this.remoteAddress = '127.0.0.1';
    }
    write(data) {
        // Send WS data out
        self.postMessage({ type: 'ws-server-send', id: this._internalId, data: data });
    }
    end() {
        self.postMessage({ type: 'ws-server-close', id: this._internalId });
        this.emit('end');
    }
    destroy() { this.end(); }
}

class Server extends EventEmitter {
    constructor(cb) {
        super();
        if (cb) this.on('connection', cb);
    }
    listen(port, cb) {
        this._port = port;
        this._serverId = Math.random().toString(36).substr(2);
        self._registerNetServer(this._serverId, this);
        self.postMessage({ type: 'net-listen', port, serverId: this._serverId });
        if (cb) cb();
    }
}

module.exports = { Server, Socket, createServer: (cb) => new Server(cb) };
`;
