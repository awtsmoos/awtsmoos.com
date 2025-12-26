// B"H
/**
 * @file omniCompressor.js
 * @description 
 *  The Sefirah of Binah - The Unified Essence Stream.
 *  Contracts the infinite light of data into dense physical vessels.
 *  The Doubling Shield (0x07) ensures absolute literal transparency via a 
 *  deterministic state machine.
 */

const serializer = require('./serializer.js');
const HEBREW_START = 0x0590;
const HEBREW_END = 0x05FF;

// Control Codes (The Gates of the Shield: 0x07)
const CMD_TOKEN = 0x01;
const CMD_RLE = 0x02;
const CMD_NUM = 0x03;
const CMD_ESCAPE = 0x07; 

module.exports = {
    /**
     * @description Contracts a string into a dense binary vessel.
     * Uses a surrogate-aware iterator to ensure UTF-8 integrity.
     */
    pack(str) {
        if (typeof str !== 'string' || str.length < 4) return Buffer.from(str, 'utf8');

        const tokens = this._findOptimalTokens(str);
        const parts = [];
        const originalLen = Buffer.byteLength(str, 'utf8');
        
        // 1. Manifest the Dictionary Segment
        parts.push(serializer.writeVarInt(tokens.length));
        for (const t of tokens) {
            const tBuf = Buffer.from(t, 'utf8');
            parts.push(serializer.writeVarInt(tBuf.length));
            parts.push(tBuf);
        }

        // 2. The Great Scan (Stream Construction)
        const chars = Array.from(str); // Surrogate-aware iteration
        let i = 0;
        const len = chars.length;
        
        while (i < len) {
            const char = chars[i];
            const code = char.codePointAt(0);

            // A. Tiferet: Run Length Encoding (RLE)
            let run = 1;
            while (i + run < len && chars[i + run] === char && run < 0xFFFFFF) run++;
            if (run >= 6) {
                parts.push(Buffer.from([CMD_ESCAPE, CMD_RLE]));
                parts.push(serializer.writeVarInt(run));
                this._writeCharWithShield(parts, char);
                i += run;
                continue;
            }

            // B. Chokhmah: Token Matching
            let bestTIdx = -1;
            let bestTLen = 0;
            const remainingStr = str.substring(str.indexOf(char, i)); // B"H: Simple slice-based match
            
            for (let tIdx = 0; tIdx < tokens.length; tIdx++) {
                const t = tokens[tIdx];
                if (t.length > bestTLen && str.startsWith(t, str.length - remainingStr.length)) {
                    bestTIdx = tIdx;
                    bestTLen = t.length;
                }
            }
            if (bestTIdx !== -1) {
                parts.push(Buffer.from([CMD_ESCAPE, CMD_TOKEN]));
                parts.push(serializer.writeVarInt(bestTIdx));
                // Advance 'i' based on character count of the token
                i += Array.from(tokens[bestTIdx]).length;
                continue;
            }

            // C. Gevurah: Numeric Fusion (Only for multi-digit ASCII sequences)
            if (code >= 48 && code <= 57) {
                let numStr = "";
                let j = i;
                while (j < len && chars[j].length === 1 && chars[j].charCodeAt(0) >= 48 && chars[j].charCodeAt(0) <= 57) {
                    numStr += chars[j++];
                }
                if (numStr.length >= 6 && numStr[0] !== '0') {
                    const num = parseInt(numStr, 10);
                    if (Number.isSafeInteger(num)) {
                        parts.push(Buffer.from([CMD_ESCAPE, CMD_NUM]));
                        parts.push(serializer.writeVarInt(num));
                        i = j;
                        continue;
                    }
                }
            }

            // D. Malchut: Literal with the Doubling Shield
            this._writeCharWithShield(parts, char);
            i++;
        }

        const res = Buffer.concat(parts);
        // Only return the contracted version if it actually saves space.
        return res.length < originalLen ? res : Buffer.from(str, 'utf8');
    },

    _findOptimalTokens(str) {
        const patterns = str.match(/[\u0590-\u05FF\w\s]{4,}/g);
        if (!patterns) return [];
        const freq = {};
        patterns.forEach(p => freq[p] = (freq[p] || 0) + 1);
        return Object.entries(freq)
            .map(([word, count]) => ({ word, savings: (count - 1) * (Buffer.byteLength(word, 'utf8') - 2) }))
            .filter(c => c.savings > 16)
            .sort((a, b) => b.savings - a.savings)
            .slice(0, 64)
            .map(c => c.word);
    },

    _writeCharWithShield(parts, char) {
        const code = char.codePointAt(0);
        // Map Hebrew to the microscopic 1-byte range (0x80-0xEF)
        if (code >= HEBREW_START && code <= HEBREW_END) {
            parts.push(Buffer.from([(code - HEBREW_START) + 0x80]));
        } else if (code < 128) {
            if (code === CMD_ESCAPE) parts.push(Buffer.from([CMD_ESCAPE, CMD_ESCAPE]));
            else parts.push(Buffer.from([code]));
        } else {
            // Multi-byte UTF-8 characters are passed through as raw binary sparks
            parts.push(Buffer.from(char, 'utf8'));
        }
    },

    /**
     * @description Resurrects a string via a robust single-pass state machine.
     * Guaranteed deterministic handling of the Doubling Shield.
     */
    unpack(buf) {
        if (!buf || buf.length === 0) return "";
        let offset = 0;

        // 1. Read Dictionary
        const dictCountInfo = serializer.readVarInt(buf, offset);
        if (dictCountInfo.bytesRead === 0) return buf.toString('utf8');
        offset += dictCountInfo.bytesRead;
        
        const dict = [];
        for (let i = 0; i < dictCountInfo.value; i++) {
            const lenInfo = serializer.readVarInt(buf, offset);
            offset += lenInfo.bytesRead;
            dict.push(buf.toString('utf8', offset, offset + lenInfo.value));
            offset += lenInfo.value;
        }

        // 2. Stream Processing (Single-Pass State Machine)
        let res = "";
        while (offset < buf.length) {
            const b = buf[offset++];
            
            if (b === CMD_ESCAPE) {
                if (offset >= buf.length) { res += String.fromCharCode(CMD_ESCAPE); break; }
                const cmd = buf[offset++];
                
                if (cmd === CMD_ESCAPE) {
                    // The Shield is intact: Restore a literal 0x07
                    res += String.fromCharCode(CMD_ESCAPE);
                } else if (cmd === CMD_TOKEN) {
                    const idxInfo = serializer.readVarInt(buf, offset);
                    res += (dict[idxInfo.value] || "");
                    offset += idxInfo.bytesRead;
                } else if (cmd === CMD_RLE) {
                    const countInfo = serializer.readVarInt(buf, offset);
                    offset += countInfo.bytesRead;
                    const char = this._readAtomicChar(buf, offset);
                    res += char.value.repeat(countInfo.value);
                    offset += char.bytesRead;
                } else if (cmd === CMD_NUM) {
                    const numInfo = serializer.readVarInt(buf, offset);
                    res += String(numInfo.value);
                    offset += numInfo.bytesRead;
                } else {
                    // Unknown Gate: Restore 0x07 and treat next byte as literal
                    res += String.fromCharCode(CMD_ESCAPE);
                    offset--; 
                }
            } else {
                const char = this._readAtomicChar(buf, offset - 1);
                res += char.value;
                offset += (char.bytesRead - 1);
            }
        }
        return res;
    },

    /**
     * @private
     * @description Atomic reader for characters from the binary stream.
     */
    _readAtomicChar(buf, offset) {
        const b = buf[offset];
        // 1. Mapped Hebrew
        if (b >= 0x80 && b <= 0xEF) {
            return { value: String.fromCharCode((b - 0x80) + HEBREW_START), bytesRead: 1 };
        }
        // 2. Simple ASCII
        if (b < 128) {
            return { value: String.fromCharCode(b), bytesRead: 1 };
        }
        // 3. Ethereal UTF-8 (Multi-byte)
        let len = 1;
        if ((b & 0xE0) === 0xC0) len = 2;
        else if ((b & 0xF0) === 0xE0) len = 3;
        else if ((b & 0xF8) === 0xF0) len = 4;

        const slice = buf.subarray(offset, offset + len);
        return { value: slice.toString('utf8'), bytesRead: len };
    }
};
