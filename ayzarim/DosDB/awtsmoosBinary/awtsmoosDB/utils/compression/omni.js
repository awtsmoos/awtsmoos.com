
// B"H
/**
 * @file omni.js
 * @description
 *  The Scribe of the Contraction.
 *  Uses prefix-markers (\x07) to store numbers and types densely within strings.
 *  Implements the "Doubling Shield" to handle literal markers correctly.
 * 
 *  THE TIKKUN OF VELOCITY (NATIVE C++ SCANNING):
 *  By utilizing the native `.includes()` bound to the V8 engine, we scan the 
 *  entire Buffer for chaos in a fraction of a millisecond. Pure strings bypass 
 *  the JS loop entirely, achieving absolute speed.
 */

const MARKER = 0x07;

module.exports = {
    /**
     * @function pack
     * @description Escapes literal markers by doubling them.
     */
    pack(str) {
        if (typeof str !== 'string') return Buffer.alloc(0);
        const buf = Buffer.from(str, 'utf8');
        
        // B"H: The Lightning Path - Native C++ scan for the Chaos Marker
        if (!buf.includes(MARKER)) return buf;

        const out = [];
        for (let i = 0; i < buf.length; i++) {
            const b = buf[i];
            out.push(b);
            if (b === MARKER) {
                // B"H: The Doubling Shield
                out.push(MARKER);
            }
        }
        return Buffer.from(out);
    },

    /**
     * @function unpack
     * @description Unescapes doubled markers and manifests the original string.
     */
    unpack(buffer) {
        if (!Buffer.isBuffer(buffer)) return "";
        
        // B"H: The Lightning Path of Revelation
        if (!buffer.includes(MARKER)) return buffer.toString('utf8');

        const out = [];
        for (let i = 0; i < buffer.length; i++) {
            const b = buffer[i];
            if (b === MARKER) {
                // Peek next
                const next = buffer[i + 1];
                if (next === MARKER) {
                    out.push(MARKER);
                    i++; // Skip the doubled marker
                } else if (next !== undefined) {
                    out.push(b);
                } else {
                    out.push(b);
                }
            } else {
                out.push(b);
            }
        }
        return Buffer.from(out).toString('utf8');
    }
};
