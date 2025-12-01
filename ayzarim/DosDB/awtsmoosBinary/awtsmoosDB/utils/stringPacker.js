// B"H
// utils/stringPacker.js
// Custom compression for Hebrew and Repeating Patterns

const HEBREW_START = 0x0590; // Unicode start of Hebrew Block
const HEBREW_END = 0x05FF;   // Unicode end of Hebrew Block
const OFFSET = 0x80;         // We map them to 128+

module.exports = {
    /**
     * Tries to pack a string into 1 byte per char.
     * Returns NULL if string contains characters outside ASCII or Hebrew.
     */
    packHebrew(str) {
        const len = str.length;
        const buf = Buffer.allocUnsafe(len);
        
        for (let i = 0; i < len; i++) {
            const code = str.charCodeAt(i);
            
            if (code < 128) {
                // Standard ASCII
                buf[i] = code;
            } else if (code >= HEBREW_START && code <= HEBREW_END) {
                // Compress Hebrew: Map 0x0590 -> 0x80
                // We fit the range into the upper 128 bytes
                buf[i] = (code - HEBREW_START) + OFFSET;
            } else {
                // Contains other Unicode (Emoji, Cyrillic, etc). Cannot compress.
                return null;
            }
        }
        return buf;
    },

    unpackHebrew(buf) {
        let res = "";
        // Optimization: Use a large array and String.fromCharCode(...arr) for speed? 
        // Or simple loop (V8 optimizes this well).
        for (let i = 0; i < buf.length; i++) {
            const byte = buf[i];
            if (byte < 128) {
                res += String.fromCharCode(byte);
            } else {
                // Restore Hebrew Unicode
                res += String.fromCharCode((byte - OFFSET) + HEBREW_START);
            }
        }
        return res;
    },

    /**
     * Tries simple Run Length Encoding.
     * Format: [Marker 0x00] [Count] [Char]
     * Returns NULL if it doesn't save space.
     */
    packRLE(str) {
        if (str.length < 10) return null; // Not worth overhead
        
        const parts = [];
        let i = 0;
        let originalSize = str.length; // Approximate (UTF8 might be larger)
        
        while (i < str.length) {
            let char = str[i];
            let run = 1;
            while (i + run < str.length && str[i + run] === char && run < 255) {
                run++;
            }
            
            if (run > 3) {
                // Encode Run: 0x00 (Escape) + Count + CharByte
                // Note: This simple RLE works best for ASCII. 
                // Handling Multibyte chars in RLE inline is complex. 
                // Let's stick to ASCII RLE for speed.
                const code = char.charCodeAt(0);
                if (code > 255) return null; // Abort if non-ascii found

                parts.push(0x00);
                parts.push(run);
                parts.push(code);
                i += run;
            } else {
                const code = char.charCodeAt(0);
                if (code === 0) {
                     // Escape literal nulls: 0x00 0x01 0x00
                     parts.push(0x00, 0x01, 0x00);
                } else if (code > 255) {
                    return null; 
                } else {
                    parts.push(code);
                }
                i++;
            }
        }
        
        const buf = Buffer.from(parts);
        // Only return if we saved > 10% space
        if (buf.length < originalSize * 0.9) return buf;
        return null;
    },

    unpackRLE(buf) {
        let res = "";
        let i = 0;
        while (i < buf.length) {
            const byte = buf[i];
            if (byte === 0x00) {
                // Is Run or Escape?
                const next = buf[i+1];
                if (next === 0x01) {
                    // Literal 0x00
                    res += String.fromCharCode(0);
                    i += 3;
                } else {
                    // Run: [00] [Count] [Char]
                    const count = next;
                    const charCode = buf[i+2];
                    res += String.fromCharCode(charCode).repeat(count);
                    i += 3;
                }
            } else {
                res += String.fromCharCode(byte);
                i++;
            }
        }
        return res;
    }
};