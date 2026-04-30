
/**
 * @file scribe.js
 * @chapter The Tzimtzum of Magnitude
 * @description
 * Magnitude is an illusion. A small spark and a vast sun are both emanations
 * of the same Source. Why should they consume the same amount of binary parchment?
 * 
 * The LEB128 Scribe performs the Tzimtzum (Contraction), ensuring that small 
 * numbers take only a single byte, while larger coordinates expand only as far 
 * as their truth requires.
 */

class LEB128Scribe {
    /**
     * @description Contracts a number into a variable-length binary sequence.
     * @param {Buffer} buf - The target parchment.
     * @param {number} offset - The starting coordinate.
     * @param {number} val - The magnitude to condense.
     * @returns {number} Bytes utilized.
     */
    static write(buf, offset, val) {
        let v = Math.floor(Math.abs(val));
        let count = 0;
        while (v > 127) {
            buf[offset + count] = (v & 127) | 128;
            v = Math.floor(v / 128);
            count++;
        }
        buf[offset + count] = v & 127;
        return count + 1;
    }

    /**
     * @description Unveils the hidden number from its contracted garment.
     * @param {Buffer} buf - The binary scroll.
     * @param {number} offset - Where to begin reading.
     * @returns {Object} { value, bytesRead }
     */
    static read(buf, offset) {
        let val = 0;
        let shift = 0;
        let count = 0;
        while (true) {
            const byte = buf[offset + count];
            const part = byte & 127;
            if (shift < 28) val += part << shift;
            else val += part * Math.pow(2, shift);
            count++;
            if (!(byte & 128)) break;
            shift += 7;
            if (shift > 53) throw new Error("B\"H Magnitude exceeds human bit-depth.");
        }
        return { value: val, bytesRead: count };
    }

    /**
     * @description Predicts the size of the required binary garment.
     */
    static sizeOf(val) {
        let s = 0; let v = Math.floor(Math.abs(val));
        do { s++; v = Math.floor(v / 128); } while (v > 0);
        return s;
    }
}

module.exports = LEB128Scribe;
