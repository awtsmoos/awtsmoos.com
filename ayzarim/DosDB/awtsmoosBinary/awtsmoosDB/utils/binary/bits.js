
// B"H
module.exports = {
    pack7Bit(str) {
        const len = str.length, outLen = Math.ceil((len * 7) / 8), buf = Buffer.allocUnsafe(outLen).fill(0);
        let bitPos = 0;
        for (let i = 0; i < len; i++) {
            const char = str.charCodeAt(i) & 0x7F, bytePos = Math.floor(bitPos / 8), shift = bitPos % 8;
            buf[bytePos] |= (char << shift);
            if (shift > 1) buf[bytePos + 1] |= (char >> (8 - shift));
            bitPos += 7;
        }
        return buf;
    },
    unpack7Bit(buf, charCount) {
        let str = "", bitPos = 0;
        for (let i = 0; i < charCount; i++) {
            const bytePos = Math.floor(bitPos / 8), shift = bitPos % 8;
            let char = (buf[bytePos] >> shift) & 0x7F;
            if (shift > 1 && bytePos + 1 < buf.length) char |= (buf[bytePos + 1] << (8 - shift)) & 0x7F;
            str += String.fromCharCode(char);
            bitPos += 7;
        }
        return str;
    }
};
