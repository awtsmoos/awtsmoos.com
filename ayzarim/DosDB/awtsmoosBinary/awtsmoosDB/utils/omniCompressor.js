// B"H
/**
 * @file omniCompressor.js
 * @description
 *  The Sefirah of Da'at - The Hidden Knowledge.
 *  COMPRESSION ANNIHILATED.
 *  Strict pass-through layer with stderr logging for visibility.
 */

module.exports = {
    /**
     * @function pack
     * @description Returns the raw buffer. No compression. Logs to stderr.
     */
    pack(str) {
        // B"H: Use console.error to bypass test runner stdout capture
        console.error(`B"H [OMNI-PACK] Start. Input Type: ${typeof str}`);
        
        if (typeof str !== 'string') {
            console.error(`B"H [OMNI-PACK] Input is not string. Returning empty buffer.`);
            return Buffer.alloc(0);
        }
        
        const preview = str.length > 50 ? str.slice(0, 50) + "..." : str;
        console.error(`B"H [OMNI-PACK] Input: "${preview}" (Len: ${str.length})`);
        
        const buf = Buffer.from(str, 'utf8');
        
        console.error(`B"H [OMNI-PACK] Output Buffer Length: ${buf.length}`);
        return buf;
    },

    /**
     * @function unpack
     * @description Returns the raw string. No decompression. Logs to stderr.
     */
    unpack(buffer) {
        console.error(`B"H [OMNI-UNPACK] Start. Input Buffer Length: ${buffer ? buffer.length : 'null'}`);
        
        if (!buffer || buffer.length === 0) {
            console.error(`B"H [OMNI-UNPACK] Buffer empty. Returning empty string.`);
            return "";
        }
        
        const str = buffer.toString('utf8');
        const preview = str.length > 50 ? str.slice(0, 50) + "..." : str;
        
        console.error(`B"H [OMNI-UNPACK] Output String: "${preview}"`);
        return str;
    }
};