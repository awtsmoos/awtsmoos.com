// B"H

/**
 * @file structure/manifest/primitive/encoders/compactJson.js
 * @chapter The Compact Scroll Token
 * @description
 * Encodes compact AwtsmoosBinaryJSON tokens as binary varint fields.
 * This intentionally never serializes the token as a JSON string.
 */

const Packet = require('../packet.js');
const TYPE = require('../typeNames.js');
const CompactJsonManager = require('../../../../api/compactJson/index.js');

function encodeCompactJson(value, context) {
  if (!value || value.__awtsmoosCompactJson !== true) return null;

  const db = context && context.allocator ? context.allocator.db : null;
  const raw = db && db.compactJson
    ? db.compactJson.encodeToken(value)
    : CompactJsonManager.encodeTokenBytes(value);

  return new Packet(TYPE.COMPACT_JSON, raw, {
    sourceBytes: Number(value.length || 0),
    storedBytes: raw.length,
    compactToken: true
  });
}

module.exports = encodeCompactJson;
