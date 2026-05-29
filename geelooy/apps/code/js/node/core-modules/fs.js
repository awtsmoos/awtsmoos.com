
// B"H
/**
 * @file fs.js
 * @brief The Node.js 'fs' module emulator allowing full synchronous disk I/O via SAB blocking, and stream polyfills.
 *
 * CHAPTER X: THE RIVER OF BYTES
 * A stream is a flow, a river of light,
 * From the depth of the disk to the height of the sight!
 * Though the worker is blocked in its synchronous chore,
 * The script demands streams, crying out "Give me more!"
 * We wrap the sync calls in an Event Emitter shell,
 * To keep the complex packages working quite well.
 */
export const fsModule = `
const { Buffer } = require('buffer');
const EventEmitter = require('events');

function decodeSyncRead(value) {
    if (typeof value === 'string' && value.startsWith('__B64__')) {
        return Buffer.from(value.slice(7), 'base64');
    }
    return Buffer.from(value);
}

class ReadStreamMock extends EventEmitter {
    constructor(path, options) {
        super();
        this.path = path;
        setTimeout(() => this._startRead(), 0);
    }
    _startRead() {
        try {
            const data = module.exports.readFileSync(this.path);
            this.emit('data', data);
            this.emit('end');
            this.emit('close');
        } catch(e) {
            this.emit('error', e);
        }
    }
}

class WriteStreamMock extends EventEmitter {
    constructor(path, options) {
        super();
        this.path = path;
        this.buffer = [];
    }
    write(chunk) {
        this.buffer.push(Buffer.from(chunk));
        return true;
    }
    end(chunk) {
        if (chunk) this.buffer.push(Buffer.from(chunk));
        try {
            const finalData = Buffer.concat(this.buffer);
            module.exports.writeFileSync(this.path, finalData);
            this.emit('finish');
            this.emit('close');
        } catch(e) {
            this.emit('error', e);
        }
    }
}

module.exports = {
    readFileSync(path, enc) {
        const res = self._syncRead(path);
        if (res === null) throw new Error("ENOENT: no such file or directory, open '" + path + "'");
        const buf = decodeSyncRead(res);
        return enc ? buf.toString(enc) : buf;
    },
    
    writeFileSync(path, data, options) {
        const content = typeof data === 'string' ? data : Buffer.from(data).toString('base64');
        // Handle base64 stringification for binary write safety
        const isBin = typeof data !== 'string';
        const err = self._syncWrite(path, isBin ? ('__B64__'+content) : content);
        if (err) throw new Error("EACCES: permission denied or write failed, write '" + path + "'");
    },
    
    existsSync(path) {
        return self._syncStat(path) === 'true';
    },
    
    readdirSync(path) {
        const res = self._syncList(path);
        if (res === null) throw new Error("ENOENT: no such file or directory, scandir '" + path + "'");
        try { return JSON.parse(res); } catch(e) { return []; }
    },
    
    createReadStream(path, options) { return new ReadStreamMock(path, options); },
    createWriteStream(path, options) { return new WriteStreamMock(path, options); },
    
    promises: {
        readFile: async (path, enc) => module.exports.readFileSync(path, enc),
        writeFile: async (path, data, opts) => module.exports.writeFileSync(path, data, opts),
        readdir: async (path) => module.exports.readdirSync(path),
        access: async (path) => {
            if (!module.exports.existsSync(path)) throw new Error("ENOENT: no such file or directory, access '" + path + "'");
        }
    }
};
`;
