// B"H

const fs = require('fs');
const { HEADER_SIZE, decodeHeader } = require('./pack-format.js');

class PackReader {
  constructor(file) {
    this.file = file;
    this.fd = fs.openSync(file, 'r');
    const header = Buffer.alloc(HEADER_SIZE);
    fs.readSync(this.fd, header, 0, HEADER_SIZE, 0);
    const jsonLength = decodeHeader(header);
    const json = Buffer.alloc(jsonLength);
    fs.readSync(this.fd, json, 0, jsonLength, HEADER_SIZE);
    this.manifest = JSON.parse(json.toString('utf8'));
    this.payloadStart = HEADER_SIZE + jsonLength;
  }

  tensor(name) {
    return this.manifest.tensors.find(tensor => tensor.name === name) || null;
  }

  tensorBytes(name) {
    const tensor = this.tensor(name);
    if (!tensor) throw new Error(`B'H missing pack tensor ${name}`);
    const bytes = Buffer.alloc(tensor.byteLength);
    fs.readSync(this.fd, bytes, 0, bytes.length, this.payloadStart + tensor.payloadOffset);
    return bytes;
  }

  close() { fs.closeSync(this.fd); }
}

module.exports = { PackReader };
