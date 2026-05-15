
// B"H
function makeHeader(length, opcode) {
  if (length < 126) return Buffer.from([0x80 | opcode, length]);

  if (length <= 0xffff) {
    const header = Buffer.alloc(4);
    header[0] = 0x80 | opcode;
    header[1] = 126;
    header.writeUInt16BE(length, 2);
    return header;
  }

  const header = Buffer.alloc(10);
  header[0] = 0x80 | opcode;
  header[1] = 127;
  header.writeBigUInt64BE(BigInt(length), 2);
  return header;
}

function sendFrame(socket, data, opcode = 0x1) {
  const payload = Buffer.isBuffer(data) ? data : Buffer.from(String(data), "utf8");
  const header = makeHeader(payload.length, opcode);

  try {
    if (socket.writable) socket.write(Buffer.concat([header, payload]));
  } catch (e) {
    console.error("WS Write Error", e.message);
  }
}

module.exports = { sendFrame, makeHeader };
