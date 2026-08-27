// B"H
// Malkuth-SFTP.js: Kingdom - The Manifested Application

'use strict';

const { EventEmitter } = require('events');
const { Readable, Writable } = require('stream');
const { BufferReader, writeUInt32BE } = require('./Yesod-Utilities.js');

// SFTP Protocol Constants
const REQUEST = { INIT: 1, OPEN: 3, CLOSE: 4, READ: 5, WRITE: 6, LSTAT: 7, FSTAT: 8, SETSTAT: 9, FSETSTAT: 10, OPENDIR: 11, READDIR: 12, REMOVE: 13, MKDIR: 14, RMDIR: 15, REALPATH: 16, STAT: 17, RENAME: 18, READLINK: 19, SYMLINK: 20, EXTENDED: 200 };
const RESPONSE = { VERSION: 2, STATUS: 101, HANDLE: 102, DATA: 103, NAME: 104, ATTRS: 105 };
const STATUS_CODE = { OK: 0, EOF: 1, NO_SUCH_FILE: 2, PERMISSION_DENIED: 3 };
const ATTR = { SIZE: 0x01, UIDGID: 0x02, PERMISSIONS: 0x04, ACMODTIME: 0x08 };
const OPEN_MODE = { READ: 0x01, WRITE: 0x02, APPEND: 0x04, CREAT: 0x08, TRUNC: 0x10, EXCL: 0x20 };

// Helper to convert string flags like 'r', 'w+' to SFTP integer flags
function stringToFlags(str) {
  switch (str) {
    case 'r': return OPEN_MODE.READ;
    case 'r+': return OPEN_MODE.READ | OPEN_MODE.WRITE;
    case 'w': return OPEN_MODE.WRITE | OPEN_MODE.CREAT | OPEN_MODE.TRUNC;
    case 'w+': return OPEN_MODE.WRITE | OPEN_MODE.READ | OPEN_MODE.CREAT | OPEN_MODE.TRUNC;
    case 'a': return OPEN_MODE.WRITE | OPEN_MODE.CREAT | OPEN_MODE.APPEND;
    case 'a+': return OPEN_MODE.WRITE | OPEN_MODE.READ | OPEN_MODE.CREAT | OPEN_MODE.APPEND;
    default: throw new Error(`Unsupported file open flag: ${str}`);
  }
}

class Stats {
  constructor(attrs) {
    this.mode = attrs.mode;
    this.uid = attrs.uid;
    this.gid = attrs.gid;
    this.size = attrs.size;
    this.atime = attrs.atime;
    this.mtime = attrs.mtime;
  }
  isDirectory() { return (this.mode & 0o170000) === 0o040000; }
  isFile() { return (this.mode & 0o170000) === 0o100000; }
  isSymbolicLink() { return (this.mode & 0o170000) === 0o120000; }
}

class MalkuthSFTP extends EventEmitter {
  constructor(channel) {
    super();
    this._channel = channel;
    this._debug = channel._protocol._debug;
    this._requests = new Map();
    this._nextReqid = 0;
    this.version = -1;
    this._incoming = Buffer.alloc(0);

    this._channel.on('data', (data) => this._parse(data));
    this._channel.on('close', () => this.emit('close'));
    
    this._init();
  }

  _init() {
    this._debug && this._debug('SFTP: Sending INIT');
    const payload = Buffer.allocUnsafe(5);
    payload[0] = REQUEST.INIT;
    writeUInt32BE(payload, 3, 1); // SFTPv3
    this._send(payload);
  }

  _send(payload) {
    const packet = Buffer.allocUnsafe(4 + payload.length);
    writeUInt32BE(packet, payload.length, 0);
    payload.copy(packet, 4);
    return this._channel.data(packet);
  }

  _parse(data) {
    this._incoming = Buffer.concat([this._incoming, data]);
    const reader = new BufferReader(this._incoming);
    while (reader.avail() >= 4) {
      const len = reader.readUInt32BE();
      if (reader.avail() < len) {
        reader.pos -= 4;
        break;
      }
      
      const payload = reader.readBytes(len);
      const type = payload[0];

      if (this.version < 0 && type !== RESPONSE.VERSION) {
        return this.emit('error', new Error('Expected VERSION packet'));
      }
      
      const handler = this._responseHandlers[type];
      if (handler) {
        handler.call(this, payload.slice(1));
      } else {
        this._debug && this._debug(`SFTP: Unhandled response type ${type}`);
      }
    }
    this._incoming = this._incoming.slice(reader.pos);
  }

  _getReqid(cb) {
    const reqid = this._nextReqid++;
    this._requests.set(reqid, cb);
    return reqid;
  }
  
  // === SFTP Client API ===
  
  readdir(path, cb) {
    const openCb = (err, handle) => {
      if (err) return cb(err);
      
      const entries = [];
      const read = () => {
        const readDirCb = (err, items) => {
          if (err) {
            if (err.code === STATUS_CODE.EOF) {
              this.close(handle, (closeErr) => cb(closeErr, entries));
            } else {
              this.close(handle, () => cb(err));
            }
            return;
          }
          entries.push(...items);
          read();
        };
        const reqid = this._getReqid(readDirCb);
        const handleLen = handle.length;
        const payload = Buffer.allocUnsafe(1 + 4 + 4 + handleLen);
        payload[0] = REQUEST.READDIR;
        writeUInt32BE(payload, reqid, 1);
        writeUInt32BE(payload, handleLen, 5);
        handle.copy(payload, 9);
        this._send(payload);
      };
      read();
    };
    
    const reqid = this._getReqid(openCb);
    const pathLen = Buffer.byteLength(path);
    const payload = Buffer.allocUnsafe(1 + 4 + 4 + pathLen);
    payload[0] = REQUEST.OPENDIR;
    writeUInt32BE(payload, reqid, 1);
    writeUInt32BE(payload, pathLen, 5);
    payload.write(path, 9, 'utf8');
    this._send(payload);
  }

  open(path, flags, cb) {
    const flagsInt = stringToFlags(flags);
    const reqid = this._getReqid(cb);
    const pathLen = Buffer.byteLength(path);
    const payload = Buffer.allocUnsafe(1 + 4 + 4 + pathLen + 4 + 4); // attrs are minimal (flags=0)
    payload[0] = REQUEST.OPEN;
    let p = 1;
    writeUInt32BE(payload, reqid, p); p += 4;
    writeUInt32BE(payload, pathLen, p); p += 4;
    payload.write(path, p, 'utf8'); p += pathLen;
    writeUInt32BE(payload, flagsInt, p); p += 4;
    writeUInt32BE(payload, 0, p); // Minimal attributes
    this._send(payload);
  }

  close(handle, cb) {
    const reqid = this._getReqid(cb);
    const handleLen = handle.length;
    const payload = Buffer.allocUnsafe(1 + 4 + 4 + handleLen);
    payload[0] = REQUEST.CLOSE;
    writeUInt32BE(payload, reqid, 1);
    writeUInt32BE(payload, handleLen, 5);
    handle.copy(payload, 9);
    this._send(payload);
  }
  
  read(handle, buffer, offset, length, position, cb) {
    const reqid = this._getReqid((err, data) => {
        if (err) return cb(err);
        data.copy(buffer, offset);
        cb(null, data.length, buffer);
    });
    const handleLen = handle.length;
    const payload = Buffer.allocUnsafe(1 + 4 + 4 + handleLen + 8 + 4);
    payload[0] = REQUEST.READ;
    let p = 1;
    writeUInt32BE(payload, reqid, p); p += 4;
    writeUInt32BE(payload, handleLen, p); p += 4;
    handle.copy(payload, p); p += handleLen;
    payload.writeBigUInt64BE(BigInt(position), p); p += 8;
    writeUInt32BE(payload, length, p);
    this._send(payload);
  }
  
  write(handle, buffer, offset, length, position, cb) {
    const data = buffer.slice(offset, offset + length);
    const reqid = this._getReqid((err) => cb(err, length));
    const handleLen = handle.length;
    const payload = Buffer.allocUnsafe(1 + 4 + 4 + handleLen + 8 + 4 + data.length);
    payload[0] = REQUEST.WRITE;
    let p = 1;
    writeUInt32BE(payload, reqid, p); p += 4;
    writeUInt32BE(payload, handleLen, p); p += 4;
    handle.copy(payload, p); p += handleLen;
    payload.writeBigUInt64BE(BigInt(position), p); p += 8;
    writeUInt32BE(payload, data.length, p); p += 4;
    data.copy(payload, p);
    this._send(payload);
  }
  
  stat(path, cb) {
    this._pathRequest(REQUEST.STAT, path, cb);
  }

  lstat(path, cb) {
    this._pathRequest(REQUEST.LSTAT, path, cb);
  }

  fstat(handle, cb) {
    this._handleRequest(REQUEST.FSTAT, handle, cb);
  }

  realpath(path, cb) {
    this._pathRequest(REQUEST.REALPATH, path, (err, names) => {
      if (err) return cb(err);
      cb(null, names && names[0] ? names[0].filename : path);
    });
  }

  readlink(path, cb) {
    this._pathRequest(REQUEST.READLINK, path, (err, names) => {
      if (err) return cb(err);
      cb(null, names && names[0] ? names[0].filename : path);
    });
  }

  rename(oldPath, newPath, cb) {
    this._twoPathRequest(REQUEST.RENAME, oldPath, newPath, cb);
  }

  symlink(targetPath, linkPath, cb) {
    this._twoPathRequest(REQUEST.SYMLINK, targetPath, linkPath, cb);
  }

  chmod(path, mode, cb) {
    this.setstat(path, { mode }, cb);
  }

  chown(path, uid, gid, cb) {
    this.setstat(path, { uid, gid }, cb);
  }

  utimes(path, atime, mtime, cb) {
    this.setstat(path, { atime, mtime }, cb);
  }

  setstat(path, attrs, cb) {
    const attrBlob = this._attrsToBuffer(attrs);
    const reqid = this._getReqid(cb);
    const pathBlob = this._string(path);
    const payload = Buffer.allocUnsafe(1 + 4 + pathBlob.length + attrBlob.length);
    payload[0] = REQUEST.SETSTAT;
    writeUInt32BE(payload, reqid, 1);
    pathBlob.copy(payload, 5);
    attrBlob.copy(payload, 5 + pathBlob.length);
    this._send(payload);
  }

  fsetstat(handle, attrs, cb) {
    const attrBlob = this._attrsToBuffer(attrs);
    const reqid = this._getReqid(cb);
    const handleBlob = this._string(handle);
    const payload = Buffer.allocUnsafe(1 + 4 + handleBlob.length + attrBlob.length);
    payload[0] = REQUEST.FSETSTAT;
    writeUInt32BE(payload, reqid, 1);
    handleBlob.copy(payload, 5);
    attrBlob.copy(payload, 5 + handleBlob.length);
    this._send(payload);
  }

  posixRename(oldPath, newPath, cb) {
    const name = 'posix-rename@openssh.com';
    const reqid = this._getReqid(cb);
    const nameBlob = this._string(name);
    const oldBlob = this._string(oldPath);
    const newBlob = this._string(newPath);
    const payload = Buffer.allocUnsafe(1 + 4 + nameBlob.length + oldBlob.length + newBlob.length);
    payload[0] = REQUEST.EXTENDED;
    writeUInt32BE(payload, reqid, 1);
    nameBlob.copy(payload, 5);
    oldBlob.copy(payload, 5 + nameBlob.length);
    newBlob.copy(payload, 5 + nameBlob.length + oldBlob.length);
    this._send(payload);
  }

  mkdir(path, cb) {
    const reqid = this._getReqid(cb);
    const pathLen = Buffer.byteLength(path);
    const payload = Buffer.allocUnsafe(1 + 4 + 4 + pathLen + 4); // Minimal attrs
    payload[0] = REQUEST.MKDIR;
    let p = 1;
    writeUInt32BE(payload, reqid, p); p += 4;
    writeUInt32BE(payload, pathLen, p); p += 4;
    payload.write(path, p, 'utf8'); p += pathLen;
    writeUInt32BE(payload, 0, p); // Minimal attributes
    this._send(payload);
  }

  rmdir(path, cb) {
    const reqid = this._getReqid(cb);
    const pathLen = Buffer.byteLength(path);
    const payload = Buffer.allocUnsafe(1 + 4 + 4 + pathLen);
    payload[0] = REQUEST.RMDIR;
    writeUInt32BE(payload, reqid, 1);
    writeUInt32BE(payload, pathLen, 5);
    payload.write(path, 9, 'utf8');
    this._send(payload);
  }
  
  unlink(path, cb) {
    this._pathRequest(REQUEST.REMOVE, path, cb);
  }

  _pathRequest(type, path, cb) {
    const reqid = this._getReqid(cb);
    const pathBlob = this._string(path);
    const payload = Buffer.allocUnsafe(1 + 4 + pathBlob.length);
    payload[0] = type;
    writeUInt32BE(payload, reqid, 1);
    pathBlob.copy(payload, 5);
    this._send(payload);
  }

  _handleRequest(type, handle, cb) {
    const reqid = this._getReqid(cb);
    const handleBlob = this._string(handle);
    const payload = Buffer.allocUnsafe(1 + 4 + handleBlob.length);
    payload[0] = type;
    writeUInt32BE(payload, reqid, 1);
    handleBlob.copy(payload, 5);
    this._send(payload);
  }

  _twoPathRequest(type, leftPath, rightPath, cb) {
    const reqid = this._getReqid(cb);
    const left = this._string(leftPath);
    const right = this._string(rightPath);
    const payload = Buffer.allocUnsafe(1 + 4 + left.length + right.length);
    payload[0] = type;
    writeUInt32BE(payload, reqid, 1);
    left.copy(payload, 5);
    right.copy(payload, 5 + left.length);
    this._send(payload);
  }

  _string(value) {
    const body = Buffer.isBuffer(value) ? value : Buffer.from(String(value), 'utf8');
    const packet = Buffer.allocUnsafe(4 + body.length);
    packet.writeUInt32BE(body.length, 0);
    body.copy(packet, 4);
    return packet;
  }

  _attrsToBuffer(attrs = {}) {
    let flags = 0;
    const parts = [];

    if (attrs.size !== undefined) {
      flags |= ATTR.SIZE;
      const part = Buffer.allocUnsafe(8);
      part.writeBigUInt64BE(BigInt(attrs.size), 0);
      parts.push(part);
    }
    if (attrs.uid !== undefined || attrs.gid !== undefined) {
      flags |= ATTR.UIDGID;
      const part = Buffer.allocUnsafe(8);
      part.writeUInt32BE(attrs.uid || 0, 0);
      part.writeUInt32BE(attrs.gid || 0, 4);
      parts.push(part);
    }
    if (attrs.mode !== undefined) {
      flags |= ATTR.PERMISSIONS;
      const part = Buffer.allocUnsafe(4);
      part.writeUInt32BE(attrs.mode, 0);
      parts.push(part);
    }
    if (attrs.atime !== undefined || attrs.mtime !== undefined) {
      flags |= ATTR.ACMODTIME;
      const part = Buffer.allocUnsafe(8);
      part.writeUInt32BE(Math.floor(new Date(attrs.atime || Date.now()).getTime() / 1000), 0);
      part.writeUInt32BE(Math.floor(new Date(attrs.mtime || Date.now()).getTime() / 1000), 4);
      parts.push(part);
    }

    const head = Buffer.allocUnsafe(4);
    head.writeUInt32BE(flags, 0);
    return Buffer.concat([head, ...parts]);
  }

  createReadStream(path, options) { return new SFTPReadStream(this, path, options); }
  createWriteStream(path, options) { return new SFTPWriteStream(this, path, options); }
}

MalkuthSFTP.prototype._responseHandlers = {
  [RESPONSE.VERSION](payload) {
    this.version = payload.readUInt32BE(0);
    this._debug && this._debug(`SFTP: Server version ${this.version}`);
    this.emit('ready');
  },
  [RESPONSE.STATUS](payload) {
    const reader = new BufferReader(payload);
    const reqid = reader.readUInt32BE();
    const code = reader.readUInt32BE();
    const msg = reader.readString('utf8');
    const cb = this._requests.get(reqid);
    if (!cb) return;
    this._requests.delete(reqid);
    if (code === STATUS_CODE.OK) {
      cb(null);
    } else {
      const err = new Error(msg);
      err.code = code;
      cb(err);
    }
  },
  [RESPONSE.HANDLE](payload) {
    const reader = new BufferReader(payload);
    const reqid = reader.readUInt32BE();
    const handle = reader.readString(null);
    const cb = this._requests.get(reqid);
    if (cb) {
      this._requests.delete(reqid);
      cb(null, handle);
    }
  },
  [RESPONSE.DATA](payload) {
    const reader = new BufferReader(payload);
    const reqid = reader.readUInt32BE();
    const data = reader.readString(null);
    const cb = this._requests.get(reqid);
    if (cb) {
      this._requests.delete(reqid);
      cb(null, data);
    }
  },
  [RESPONSE.NAME](payload) {
    const reader = new BufferReader(payload);
    const reqid = reader.readUInt32BE();
    const count = reader.readUInt32BE();
    const names = [];
    for (let i = 0; i < count; i++) {
      names.push({
        filename: reader.readString('utf8'),
        longname: reader.readString('utf8'),
        attrs: this._parseAttrs(reader),
      });
    }
    const cb = this._requests.get(reqid);
    if (cb) {
      this._requests.delete(reqid);
      cb(null, names);
    }
  },
  [RESPONSE.ATTRS](payload) {
    const reader = new BufferReader(payload);
    const reqid = reader.readUInt32BE();
    const attrs = new Stats(this._parseAttrs(reader));
    const cb = this._requests.get(reqid);
    if (cb) {
      this._requests.delete(reqid);
      cb(null, attrs);
    }
  }
};

MalkuthSFTP.prototype._parseAttrs = function(reader) {
  const flags = reader.readUInt32BE();
  const attrs = {};
  if (flags & ATTR.SIZE) {
    attrs.size = Number(reader.buffer.readBigUInt64BE(reader.pos));
    reader.pos += 8;
  }
  if (flags & ATTR.UIDGID) { attrs.uid = reader.readUInt32BE(); attrs.gid = reader.readUInt32BE(); }
  if (flags & ATTR.PERMISSIONS) attrs.mode = reader.readUInt32BE();
  if (flags & ATTR.ACMODTIME) { attrs.atime = reader.readUInt32BE(); attrs.mtime = reader.readUInt32BE(); }
  return attrs;
};

// Simplified Stream implementations
class SFTPReadStream extends Readable {
    constructor(sftp, path, options) {
        super(options);
        this.sftp = sftp;
        this.path = path;
        this.options = options || {};
        this.handle = null;
        this.pos = this.options.start || 0;
        this.sftp.open(path, 'r', (err, handle) => {
            if (err) return this.emit('error', err);
            this.handle = handle;
            this.emit('open', handle);
        });
    }
    _read(size) {
        if (!this.handle) return this.once('open', () => this._read(size));
        const buf = Buffer.alloc(size);
        this.sftp.read(this.handle, buf, 0, size, this.pos, (err, bytesRead) => {
            if (err) {
                if (err.code === STATUS_CODE.EOF) this.push(null); // End of file
                else this.emit('error', err);
                return;
            }
            this.pos += bytesRead;
            this.push(bytesRead > 0 ? buf.slice(0, bytesRead) : null);
        });
    }
    _destroy(err, cb) {
        if (!this.handle) return cb(err);
        this.sftp.close(this.handle, (closeErr) => cb(err || closeErr));
    }
}

class SFTPWriteStream extends Writable {
    constructor(sftp, path, options) {
        super(options);
        this.sftp = sftp;
        this.path = path;
        this.options = options || {};
        this.handle = null;
        this.pos = this.options.start || 0;
        this.sftp.open(path, this.options.flags || 'w', (err, handle) => {
            if (err) return this.emit('error', err);
            this.handle = handle;
            this.emit('open', handle);
        });
    }
    _write(chunk, enc, cb) {
        if (!this.handle) return this.once('open', () => this._write(chunk, enc, cb));
        this.sftp.write(this.handle, chunk, 0, chunk.length, this.pos, (err, written) => {
            if (err) return cb(err);
            this.pos += written;
            cb();
        });
    }
    _destroy(err, cb) {
        if (!this.handle) return cb(err);
        this.sftp.close(this.handle, (closeErr) => cb(err || closeErr));
    }
}

module.exports = { MalkuthSFTP };
