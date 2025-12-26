// B"H
/**
 * @file omniCompressor.js
 * @description 
 *  The Sefirah of Binah - The Unified Essence Stream.
 *  Handles absolute literal transparency, dynamic weighted tokenization, and massive RLE.
 */

const serializer = require('./serializer.js');
const HEBREW_START = 0x0590;
const HEBREW_END = 0x05FF;

// Control Codes (Manifested after the 0x07 Gate)
const CMD_TOKEN = 0x01;
const CMD_RLE = 0x02;
const CMD_NUM = 0x03;
const CMD_ESCAPE = 0x07; // Literal 0x07 is encoded as 0x07 0x07

module.exports = {
    /**
     * @description Contracts any string (text or binary-embedded) into a dense vessel.
     * @param {string} str The string to contract.
     * @returns {Buffer} The dense vessel.
     */
    pack(str) {
        if (typeof str !== 'string' || str.length < 8) return Buffer.from(str, 'utf8');

        // 1. DYNAMIC TOKENIZATION: Identify optimal repeating patterns (Hebrew & English)
        const tokens = this._findOptimalTokens(str);
        
        const parts = [];
        // Dictionary Segment: [Count][ [Len][Token] ... ]
        parts.push(serializer.writeVarInt(tokens.length));
        for (const t of tokens) {
            const tBuf = Buffer.from(t, 'utf8');
            parts.push(serializer.writeVarInt(tBuf.length));
            parts.push(tBuf);
        }

        // 2. UNIFIED STREAM SCAN (Single Pass)
        let i = 0;
        const len = str.length;
        while (i < len) {
            const char = str[i];
            const code = str.charCodeAt(i);

            // A. RECURSIVE RLE: Handles massive repetitions (e.g., 10,000 spaces)
            let run = 1;
            while (i + run < len && str[i + run] === char) run++;
            if (run >= 5) {
                parts.push(Buffer.from([CMD_ESCAPE, CMD_RLE]));
                parts.push(serializer.writeVarInt(run));
                // Literal character for the run must also respect the shield
                this._writeCharWithShield(parts, char);
                i += run;
                continue;
            }

            // B. DYNAMIC TOKEN MATCH
            let bestTIdx = -1;
            let bestTLen = 0;
            for (let tIdx = 0; tIdx < tokens.length; tIdx++) {
                const t = tokens[tIdx];
                if (t.length > bestTLen && str.startsWith(t, i)) {
                    bestTIdx = tIdx;
                    bestTLen = t.length;
                }
            }
            if (bestTIdx !== -1) {
                parts.push(Buffer.from([CMD_ESCAPE, CMD_TOKEN]));
                parts.push(serializer.writeVarInt(bestTIdx));
                i += bestTLen;
                continue;
            }

            // C. GEMATRIA GATE: Numeric Fusion for sequences of 4+ digits
            if (code >= 48 && code <= 57) {
                let numStr = "";
                let j = i;
                while (j < len && str.charCodeAt(j) >= 48 && str.charCodeAt(j) <= 57) numStr += str[j++];
                if (numStr.length >= 4) {
                    const num = parseInt(numStr, 10);
                    if (Number.isSafeInteger(num)) {
                        parts.push(Buffer.from([CMD_ESCAPE, CMD_NUM]));
                        parts.push(serializer.writeVarInt(num));
                        i = j;
                        continue;
                    }
                }
            }

            // D. BILINGUAL MAPPING & LITERAL TRANSPARENCY
            this._writeCharWithShield(parts, char);
            i++;
        }

        const res = Buffer.concat(parts);
        const originalLen = Buffer.byteLength(str, 'utf8');
        return res.length < originalLen ? res : Buffer.from(str, 'utf8');
    },

    /**
     * @description Dynamically selects top 0-64 tokens based on entropy-weighted savings.
     * @param {string} str The string to analyze.
     * @returns {string[]} The optimal tokens.
     */
    _findOptimalTokens(str) {
        const patterns = str.match(/[\u0590-\u05FF\w\s]{4,}/g);
        if (!patterns) return [];
        
        const freq = {};
        patterns.forEach(p => freq[p] = (freq[p] || 0) + 1);
        
        const candidates = Object.entries(freq)
            .map(([word, count]) => {
                const byteLen = Buffer.byteLength(word, 'utf8');
                // Saving = (Occurrences - 1) * (WordBytes - MarkerBytes)
                const savings = (count - 1) * (byteLen - 2); 
                return { word, savings };
            })
            .filter(c => c.savings > 12) // Only pick high-impact tokens
            .sort((a, b) => b.savings - a.savings)
            .slice(0, 64); // The 64 Sparks of Wisdom
            
        return candidates.map(c => c.word);
    },

    /**
     * @description Writes a character to the stream parts while respecting the Doubling Shield.
     * @param {Buffer[]} parts The stream parts.
     * @param {string} char The character to write.
     */
    _writeCharWithShield(parts, char) {
        const code = char.charCodeAt(0);
        if (code >= HEBREW_START && code <= HEBREW_END) {
            parts.push(Buffer.from([(code - HEBREW_START) + 0x80]));
        } else if (code < 128) {
            if (code === CMD_ESCAPE) {
                // The Shield: Double the escape code for literals
                parts.push(Buffer.from([CMD_ESCAPE, CMD_ESCAPE]));
            } else {
                parts.push(Buffer.from([code]));
            }
        } else {
            // Fallback for Complex Unicode (UTF-8)
            parts.push(Buffer.from(char, 'utf8'));
        }
    },

    /**
     * @description Resurrects the original essence from the dense vessel with absolute transparency.
     * @param {Buffer} buf The dense vessel.
     * @returns {string} The original string.
     */
    unpack(buf) {
        if (!buf || buf.length === 0) return "";
        let offset = 0;

        // 1. Recover Dictionary
        const dictCountInfo = serializer.readVarInt(buf, offset);
        offset += dictCountInfo.bytesRead;
        const dict = [];
        for (let i = 0; i < dictCountInfo.value; i++) {
            const lenInfo = serializer.readVarInt(buf, offset);
            offset += lenInfo.bytesRead;
            dict.push(buf.toString('utf8', offset, offset + lenInfo.value));
            offset += lenInfo.value;
        }

        // 2. Resurrect Stream
        let res = "";
        while (offset < buf.length) {
            const b = buf[offset++];
            if (b === CMD_ESCAPE) {
                if (offset >= buf.length) {
                    res += String.fromCharCode(CMD_ESCAPE);
                    break;
                }
                const cmd = buf[offset++];
                // Handle Literal Transparency (The Shield)
                if (cmd === CMD_ESCAPE) {
                    res += String.fromCharCode(CMD_ESCAPE);
                } else if (cmd === CMD_TOKEN) {
                    const idxInfo = serializer.readVarInt(buf, offset);
                    res += dict[idxInfo.value];
                    offset += idxInfo.bytesRead;
                } else if (cmd === CMD_RLE) {
                    const countInfo = serializer.readVarInt(buf, offset);
                    offset += countInfo.bytesRead;
                    
                    // The character byte of RLE might be a doubled escape
                    let charByte = buf[offset++];
                    if (charByte === CMD_ESCAPE && buf[offset] === CMD_ESCAPE) {
                        offset++; // Consume the double
                    }
                    
                    const char = charByte >= 0x80 ? String.fromCharCode((charByte - 0x80) + HEBREW_START) : String.fromCharCode(charByte);
                    res += char.repeat(countInfo.value);
                } else if (cmd === CMD_NUM) {
                    const numInfo = serializer.readVarInt(buf, offset);
                    res += String(numInfo.value);
                    offset += numInfo.bytesRead;
                } else {
                    // Fallback for unknown escape sequences
                    res += String.fromCharCode(cmd);
                }
            } else if (b >= 0x80 && b <= 0xEF) {
                res += String.fromCharCode((b - 0x80) + HEBREW_START);
            } else if (b > 0xEF) {
                // Complex Unicode Handling
                offset--;
                const utf8Str = buf.toString('utf8', offset, offset + 4);
                const char = Array.from(utf8Str)[0];
                res += char;
                offset += Buffer.byteLength(char, 'utf8');
            } else {
                res += String.fromCharCode(b);
            }
        }
        return res;
    }
};
