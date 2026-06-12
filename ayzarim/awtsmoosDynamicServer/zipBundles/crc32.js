// B"H
const TABLE = makeTable();

/**
 * B"H
 * Chapter 399: Every byte received a witness number.
 * ZIP central directories need CRC32, so the server learns the old checksum
 * alphabet without inviting any outside package into the installer path.
 */
function crc32(buffer) {
  let crc = -1;
  for (const byte of Buffer.from(buffer || [])) crc = (crc >>> 8) ^ TABLE[(crc ^ byte) & 0xff];
  return (crc ^ -1) >>> 0;
}

function makeTable() {
  const table = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    table[n] = c >>> 0;
  }
  return table;
}

module.exports = { crc32 };
