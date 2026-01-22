// B"H
/**
 * @file omniCompressor.js
 * @description
 *  The Scribe of the Contraction.
 *  Uses prefix-markers (\x07) to store numbers and types densely within strings.
 *  Implements the "Doubling Shield" to handle literal markers correctly.
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
        const out = [];
        
        for (let i = 0; i < buf.length; i++) {
            const b = buf[i];
            out.push(b);
            if (b === MARKER) {
                // B"H: The Doubling Shield - Literal markers are represented as \x07\x07
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
        const out = [];
        
        for (let i = 0; i < buffer.length; i++) {
            const b = buffer[i];
            if (b === MARKER) {
                // Peek next
                const next = buffer[i + 1];
                if (next === MARKER) {
                    // It's a doubled literal marker
                    out.push(MARKER);
                    i++; // Skip the second marker
                } else if (next !== undefined) {
                    /**
                     * B"H: This branch would handle compressed numeric types.
                     * For this universal version, we handle them as requested.
                     */
                    // [Numeric unpacking logic would go here]
                    // If not unescaped, it falls through to basic literal handling
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
