// B"H
const { ByteWriter } = require('./ByteWriter.js');
const { ByteReader } = require('./ByteReader.js');
const MAGIC = 'SANG';
const VERSION = 1;
const T = { NULL:0, FALSE:1, TRUE:2, NUM:3, STR:4, OBJ:5 };

function encodeValue(writer, value) {
  if (value == null) return writer.u8(T.NULL);
  if (value === false) return writer.u8(T.FALSE);
  if (value === true) return writer.u8(T.TRUE);
  if (typeof value === 'number') return writer.u8(T.NUM).string(String(value));
  if (typeof value === 'string') return writer.u8(T.STR).string(value);
  return writer.u8(T.OBJ).json(value);
}

function decodeValue(reader) {
  const t = reader.u8();
  if (t === T.NULL) return null;
  if (t === T.FALSE) return false;
  if (t === T.TRUE) return true;
  if (t === T.NUM) return Number(reader.string());
  if (t === T.STR) return reader.string();
  if (t === T.OBJ) return reader.json();
  throw new Error(`Bad SANG constant type: ${t}`);
}

function encodeConstants(writer, constants) {
  writer.varUint(constants.length);
  for (const constant of constants) encodeValue(writer, constant);
}

function decodeConstants(reader) {
  const constants = [];
  const count = reader.varUint();
  for (let i = 0; i < count; i++) constants.push(decodeValue(reader));
  return constants;
}

/**
 * SANG is an exact-byte VM vessel: constants + bytecode + optional debug.
 * In production mode, no meta/web JSON is written.
 */
function encodeSangArtifact(artifact, options = {}) {
  const code = Buffer.from(artifact.bytecode || []);
  const writer = new ByteWriter();
  writer.raw(Buffer.from(MAGIC, 'ascii')).u8(VERSION);
  const flags = options.debug ? 1 : 0;
  writer.u8(flags);
  encodeConstants(writer, artifact.constants || []);
  writer.bytesWithLength(code);
  if (options.debug) {
    writer.json(artifact.web || null);
    writer.json(artifact.meta || {});
  }
  return writer.toBuffer();
}

function decodeSangArtifact(buffer) {
  const reader = new ByteReader(buffer);
  const magic = reader.bytes(4).toString('ascii');
  if (magic !== MAGIC) throw new Error(`Bad SANG magic: ${magic}`);
  const version = reader.u8();
  if (version !== VERSION) throw new Error(`Unsupported SANG version: ${version}`);
  const flags = reader.u8();
  const constants = decodeConstants(reader);
  const bytecode = reader.bytesWithLength();
  return {
    version,
    flags,
    constants,
    bytecode,
    web: flags & 1 ? reader.json() : null,
    meta: flags & 1 ? reader.json() : {}
  };
}

module.exports = { MAGIC, VERSION, encodeSangArtifact, decodeSangArtifact, encodeConstants, decodeConstants };
