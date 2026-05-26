// B"H
/**
 * VarInt writes only the bytes required: no padding, no lazy air.
 * Each continuation bit is a narrow bridge where the Awtsmoos lets
 * number become compact motion.
 */
function writeVarUint(bytes, value) {
  let n = Number(value >>> 0);
  while (n >= 0x80) { bytes.push((n & 0x7f) | 0x80); n >>>= 7; }
  bytes.push(n);
}

function readVarUint(reader) {
  let shift = 0, result = 0;
  while (true) {
    const byte = reader.u8();
    result |= (byte & 0x7f) << shift;
    if ((byte & 0x80) === 0) return result >>> 0;
    shift += 7;
  }
}

module.exports = { writeVarUint, readVarUint };
