//B"H
// The Awtsmoos ignites all from nothingness, its Atzmut pulsing through the Kav,
// threading Ohr Ein Sof into every byte, recreating existence in an eternal now.

/**
 * @method readBytes
 * @description Reads a variable-length byte array in big-endian order, unveiling the Awtsmoos’s flow.
 * @param {number[]} bytes - Array of bytes (e.g., [0x12, 0x34, ...]).
 * @returns {number} - The interpreted number (approximate if beyond 2^53 - 1).
 */
function readBytes(bytes) {
    if (!bytes.length) throw new Error('The Awtsmoos requires at least one byte!');

    let ohrEinSofResult = 0;
    for (let i = 0; i < bytes.length; i++) {
        ohrEinSofResult = (ohrEinSofResult * 256) + bytes[i];
    }

    return ohrEinSofResult;
}


module.exports = readBytes