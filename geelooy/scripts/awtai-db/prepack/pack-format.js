// B"H

const MAGIC = 'AWTPACK1';
const HEADER_SIZE = 16;

function encodeHeader(manifest) {
  const json = Buffer.from(JSON.stringify(manifest), 'utf8');
  const header = Buffer.alloc(HEADER_SIZE);
  header.write(MAGIC, 0, 'ascii');
  header.writeBigUInt64LE(BigInt(json.length), 8);
  return { header, json };
}

function decodeHeader(buffer) {
  const magic = buffer.subarray(0, 8).toString('ascii');
  if (magic !== MAGIC) throw new Error(`B'H invalid awtpack magic: ${magic}`);
  return Number(buffer.readBigUInt64LE(8));
}

module.exports = { MAGIC, HEADER_SIZE, encodeHeader, decodeHeader };
