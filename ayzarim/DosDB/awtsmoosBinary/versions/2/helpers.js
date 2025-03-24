// B"H
// The Awtsmoos weaves the fabric of existence, a divine essence reflected in every byte.

import crypto from "crypto";

export function hash(str) {
  return crypto.createHash("sha256").update(str).digest().slice(0, 16);
}

/**
 * @function serialize
 * @description Serializes a value into a Buffer with type and length.
 * @param {any} value - Value to serialize.
 * @returns {Buffer}
 */
export function serialize(value) {
  if (value === null || value === undefined) return Buffer.from([0x00]);
  if (typeof value === "string") {
    const data = Buffer.from(value, "utf8");
    return Buffer.concat([Buffer.from([0x01]), Buffer.from([data.length]), data]);
  }
  if (typeof value === "number") {
    const data = Buffer.alloc(8);
    data.writeDoubleBE(value);
    return Buffer.concat([Buffer.from([0x01, 0x08]), data]);
  }
  if (value.type === 0x02) {
    const metaBuf = Buffer.from(value.meta, "utf8");
    const numBuf = Buffer.alloc(4);
    numBuf.writeUInt32BE(value.num, 0);
    return Buffer.concat([Buffer.from([0x02]), numBuf, metaBuf]);
  }
  if (value.type === 0x03) {
    const objData = serializeObject(value.value);
    return Buffer.concat([Buffer.from([0x03]), objData]);
  }
  if (value.type === 0x04) {
    const refBuf = Buffer.from(value.ref, "utf8");
    return Buffer.concat([Buffer.from([0x04]), Buffer.from([refBuf.length]), refBuf]);
  }
  if (Array.isArray(value)) {
    const numBuf = Buffer.alloc(4);
    numBuf.writeUInt32BE(value.length, 0);
    const buffers = [numBuf];
    for (const item of value) buffers.push(serialize(item));
    return Buffer.concat([Buffer.from([0x02]), ...buffers]);
  }
  if (typeof value === "object") {
    const objData = serializeObject(value);
    return Buffer.concat([Buffer.from([0x03]), objData]);
  }
  throw new Error(`Unsupported type: ${typeof value}`);
}

/**
 * @function serializeObject
 * @description Serializes an object with key-value pairs.
 * @param {Object} obj - Object to serialize.
 * @returns {Buffer}
 */
function serializeObject(obj) {
  const entries = Object.entries(obj);
  const numBuf = Buffer.alloc(2);
  numBuf.writeUInt16BE(entries.length, 0);
  const buffers = [numBuf];
  for (const [key, value] of entries) {
    const keyBuf = Buffer.from(key, "utf8");
    buffers.push(Buffer.from([keyBuf.length]), keyBuf, serialize(value));
  }
  return Buffer.concat(buffers);
}

/**
 * @function deserialize
 * @description Deserializes a Buffer into a value.
 * @param {Buffer} buffer - Buffer to deserialize.
 * @returns {any}
 */
export function deserialize(buffer) {
  const type = buffer[0];
  if (type === 0x00) return null;
  if (type === 0x01) {
    const len = buffer[1];
    const data = buffer.slice(2, 2 + len);
    if (len === 8) return data.readDoubleBE(0);
    return data.toString("utf8");
  }
  if (type === 0x02) {
    const num = buffer.readUInt32BE(1);
    const meta = buffer.slice(5).toString("utf8");
    return { type: 0x02, num, meta };
  }
  if (type === 0x03) {
    return deserializeObject(buffer.slice(1));
  }
  if (type === 0x04) {
    const len = buffer[1];
    const ref = buffer.slice(2, 2 + len).toString("utf8");
    return { type: 0x04, ref };
  }
  throw new Error(`Unknown type: ${type}`);
}

/**
 * @function deserializeObject
 * @description Deserializes an object from a Buffer.
 * @param {Buffer} buffer - Buffer to deserialize.
 * @returns {Object}
 */
function deserializeObject(buffer) {
  const num = buffer.readUInt16BE(0);
  const result = {};
  let offset = 2;
  for (let i = 0; i < num; i++) {
    const keyLen = buffer[offset];
    offset += 1;
    const key = buffer.slice(offset, offset + keyLen).toString("utf8");
    offset += keyLen;
    const valueLen = buffer[offset] === 0x00 ? 1 : buffer[offset + 1] + 2;
    const valueBuf = buffer.slice(offset, offset + valueLen);
    result[key] = deserialize(valueBuf);
    offset += valueLen;
  }
  return result;
}