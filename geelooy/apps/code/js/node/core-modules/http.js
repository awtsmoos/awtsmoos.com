
// B"H
export const httpModule = `
const { Server: NetServer, Socket } = require('net');
const EventEmitter = require('events');
const { Buffer } = require('buffer');

class IncomingMessage extends EventEmitter {
    constructor(method, url, headers) {
        super();
        this.method = method;
        this.url = url;
        this.headers = headers;
        this.socket = new Socket(headers['sec-websocket-key']); 
    }
}

class ServerResponse extends EventEmitter {
    constructor(reqId) {
        super();
        this._reqId = reqId;
        this.statusCode = 200;
        this.headers = {};
    }
    setHeader(k, v) { this.headers[k] = v; }
    writeHead(status, hdrs) { this.statusCode = status; Object.assign(this.headers, hdrs||{}); }
    end(data) {
        self.postMessage({ type: 'http-outbound', reqId: this._reqId, status: this.statusCode, headers: this.headers, data });
    }
}

class Server extends NetServer {
    constructor(cb) {
        super();
        if (cb) this.on('request', cb);
    }
}

// B"H - HTTP Client Implementation
class IncomingClientMessage extends EventEmitter {
    constructor(status, headers, data) {
        super();
        this.statusCode = status;
        this.headers = headers;
        // Simulate streaming arrival
        setTimeout(() => {
            if (data) this.emit('data', typeof data === 'string' ? Buffer.from(data) : data);
            this.emit('end');
        }, 10);
    }
}

class ClientRequest extends EventEmitter {
    constructor(url, options, cb) {
        super();
        const reqId = Math.random().toString(36).substr(2);
        self._registerHttpReq(reqId, this);
        self.postMessage({ type: 'http-client-request', reqId, url, options });
        if (cb) this.on('response', cb);
    }
    end() {}
    write() {}
}

module.exports = {
    IncomingMessage,
    ServerResponse,
    IncomingClientMessage,
    createServer(cb) { return new Server(cb); },
    request(url, options, cb) { return new ClientRequest(url, options, cb); },
    get(url, options, cb) { const r = new ClientRequest(url, options, cb); r.end(); return r; }
};
`;
