// B"H
/**
 * Chapter 1: the byte-river enters the vessel.
 * The Awtsmoos reveals silent metal as numbered sparks, each byte a footstep.
 * @param {ArrayBuffer} buffer raw executable breath
 * @returns {{bytes:Uint8Array, view:DataView}} readable binary vessel
 */
export function makeByteVessel(buffer) {
  return { bytes: new Uint8Array(buffer), view: new DataView(buffer) };
}

/**
 * Reads a null-trimmed ASCII string from fixed PE fields.
 * @param {Uint8Array} bytes byte vessel
 * @param {number} offset start offset
 * @param {number} length maximum bytes
 * @returns {string} decoded name
 */
export function readAscii(bytes, offset, length) {
  const slice = bytes.slice(offset, offset + length);
  const end = slice.indexOf(0);
  return new TextDecoder().decode(end >= 0 ? slice.slice(0, end) : slice);
}
