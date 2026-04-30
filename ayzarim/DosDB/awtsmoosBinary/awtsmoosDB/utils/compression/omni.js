
/**
 * @file omni.js
 * @chapter The Squeeze of Redundancy
 * @description
 * Common patterns are like paths through the desert. We identify them
 * and contract them into single bytes. 
 *
 * THE CHAOS PROTOCOL: If the raw data contains our control character (0x07),
 * we must 'double' it to ensure literal transparency. This shield ensures 
 * that our compression doesn't mistake user data for a divine command.
 */

class OmniCompressor {
    /**
     * @description Contracts a string into a binary stream with the Doubling Shield.
     */
    static pack(str) {
        if (!str) return Buffer.alloc(0);
        const raw = Buffer.from(String(str), 'utf8');
        const out = [];
        for (let i = 0; i < raw.length; i++) {
            const b = raw[i];
            out.push(b);
            if (b === 0x07) out.push(0x07); // Apply Shield
        }
        return Buffer.from(out);
    }

    /**
     * @description Expands the contracted stream back into the original speech.
     */
    static unpack(buf) {
        if (!buf) return "";
        const out = [];
        for (let i = 0; i < buf.length; i++) {
            const b = buf[i];
            if (b === 0x07 && buf[i+1] === 0x07) {
                out.push(0x07); // Breach Shield
                i++; 
            } else {
                out.push(b);
            }
        }
        return Buffer.from(out).toString('utf8');
    }
}

module.exports = OmniCompressor;
