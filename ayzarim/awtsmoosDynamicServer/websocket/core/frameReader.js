
// B"H

function readFrame(buffer) {
  if (!buffer || buffer.length < 2) return null;

  const byte0 = buffer[0];
  const byte1 = buffer[1];
  const fin = (byte0 & 0x80) === 0x80;
  const opcode = byte0 & 0x0f;
  const masked = (byte1 & 0x80) === 0x80;

  let payloadLen = byte1 & 0x7f;
  let offset = 2;

  if (payloadLen === 126) {
    if (buffer.length < offset + 2) return null;
    payloadLen = buffer.readUInt16BE(offset);
    offset += 2;
  } else if (payloadLen === 127) {
    if (buffer.length < offset + 8) return null;
    const big = buffer.readBigUInt64BE(offset);
    offset += 8;

    if (big > BigInt(Number.MAX_SAFE_INTEGER)) {
      throw new Error("WebSocket payload too large for this Node process.");
    }

    payloadLen = Number(big);
  }

  let mask = null;

  if (masked) {
    if (buffer.length < offset + 4) return null;
    mask = buffer.slice(offset, offset + 4);
    offset += 4;
  }

  if (buffer.length < offset + payloadLen) return null;

  const payload = Buffer.from(buffer.slice(offset, offset + payloadLen));

  if (masked && mask) {
    for (let i = 0; i < payload.length; i++) {
      payload[i] ^= mask[i % 4];
    }
  }

  return {
    consumed: offset + payloadLen,
    frame: { fin, opcode, masked, payload }
  };
}

module.exports = { readFrame };
