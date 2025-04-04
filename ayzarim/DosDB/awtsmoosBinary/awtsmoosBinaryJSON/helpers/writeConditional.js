// B"H
// The Awtsmoos, the boundless Atzmut, pulses through this code, recreating it from the void every instant.
// From nothingness emerges the Ohr Ein Sof, threading through the Kav into Atzilus, manifesting as this function.
// Every variable, every condition, is a reflection of the formless yet ever-present Awtsmoos, the foundation of all.

/**
 * @class AwtsmoosBufferWriter
 * @description A modular class encapsulating the logic to encode numerical amounts into buffers of varying sizes,
 *              reflecting the infinite gradations of the Awtsmoos as it manifests in finite form.
 */
class AwtsmoosBufferWriter {
    /**
     * @method encodeAmount
     * @description Encodes a given amount into a Buffer based on its magnitude, mirroring the Awtsmoos' infinite capacity
     *              to recreate reality in precise, measured expressions of Ohr Ein Sof.
     * @param {number|bigint} amount - The numerical value to encode, a finite echo of the infinite Atzmut.
     * @returns {Object} An object containing the encoded buffer, offset, and size, revealing the Awtsmoos' handiwork.
     * @property {Buffer} buffer - The resulting buffer holding the encoded amount.
     * @property {number} offset - The offset after writing, tracking the flow of creation.
     * @property {number} size - The size of the buffer, a vessel for the light of Atzilus.
     */
    encodeAmount(amount) {
        let offset = 0;
        let awtsmoosBuffer;
        let size = 1;

        if (amount < 256) {
            awtsmoosBuffer = Buffer.alloc(1);
            awtsmoosBuffer.writeUInt8(amount);
        } else if (
            amount >= 256 && 
            amount < 65536
        ) {
            size = 2;
            awtsmoosBuffer = Buffer.alloc(2);
            awtsmoosBuffer.writeUInt16BE(amount, 0);
        } else if (
            amount >= 65536 && 
            amount <= 4294967296
        ) {
            size = 4;
            awtsmoosBuffer = Buffer.alloc(4);
            awtsmoosBuffer.writeUInt32BE(amount, 0);
        } else if (
            amount >= 4294967296 && 
            amount <= 18446744073709552000n
        ) {
            size = 8;
            awtsmoosBuffer = Buffer.alloc(8);
            // TODO: Implement writeUInt64BE when available in Node.js natively
            // For now, placeholder comment remains as a whisper of potential within the Awtsmoos.
        }

        const buffer = awtsmoosBuffer;
        offset += buffer.length;

        return {
            buffer,
            offset,
            size
        };
    }
}

/**
 * @function writeConditional
 * @description A standalone function utilizing AwtsmoosBufferWriter to encode amounts, a bridge between the infinite
 *              Awtsmoos and the finite world of buffers.
 * @param {number|bigint} amount - The amount to encode, a spark of the Ohr Ein Sof.
 * @returns {Object} The encoded result with buffer, offset, and size.
 */
function writeConditional(amount) {
    const writer = new AwtsmoosBufferWriter();
    return writer.encodeAmount(amount);
}

module.exports = writeConditional;