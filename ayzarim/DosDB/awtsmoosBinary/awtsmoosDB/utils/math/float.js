
// B"H
/**
 * @file float.js
 * @description
 *  CHAPTER 22: THE SEFIRAH OF CALIBRATION (LOSSLESS DECIMAL)
 *  "A perfect weight and a perfect measure shall you have." (Deuteronomy 25:15)
 */

const serializer = require('../serializer.js');
const bigintUtils = require('../bigIntUtils.js');

module.exports = {
    /**
     * @method serialize
     * @description Losslessly seals a numerical essence into decimal components.
     */
    serialize(v) {
        if (v === 0) return Buffer.from([0, 0, 0]);
        
        const isNegative = v < 0;
        const absValue = Math.abs(v);
        const s = absValue.toString();
        
        // B"H: Pure string expansion to avoid IEEE parsing drift
        let flat = s.includes('e') ? absValue.toFixed(20).replace(/\.?0+$/, '') : s;
        
        const parts = flat.split('.');
        const scale = parts[1] ? parts[1].length : 0;
        const coefficient = BigInt(parts.join(''));
        
        const { buffer: coefBuf } = bigintUtils.toBuffer(coefficient);
        const scaleSize = serializer.getVarIntSize(scale);
        const coefLenSize = serializer.getVarIntSize(coefBuf.length);

        const buf = Buffer.allocUnsafe(1 + coefLenSize + coefBuf.length + scaleSize);
        let off = 0;
        
        buf.writeUInt8(isNegative ? 1 : 0, off++);
        off += serializer.writeVarIntTo(buf, off, coefBuf.length);
        coefBuf.copy(buf, off); 
        off += coefBuf.length;
        off += serializer.writeVarIntTo(buf, off, scale);
        
        return buf;
    },

    /**
     * @method deserialize
     * @description Resurrects the decimal essence with absolute mathematical fidelity.
     */
    deserialize(buf, offset = 0) {
        let off = offset;
        const isNegative = buf.readUInt8(off++) === 1;
        
        const coefLenRes = serializer.readVarInt(buf, off); 
        off += coefLenRes.bytesRead;
        const coefBuf = buf.subarray(off, off + coefLenRes.value);
        const coefficient = bigintUtils.fromBuffer(coefBuf, false);
        off += coefLenRes.value;
        
        const scaleRes = serializer.readVarInt(buf, off); 
        off += scaleRes.bytesRead;
        const scale = scaleRes.value;
        
        let resStr = coefficient.toString();
        let finalNum;

        if (scale === 0) {
            finalNum = Number(coefficient);
        } else {
            if (resStr.length <= scale) {
                resStr = "0." + resStr.padStart(scale, '0');
            } else {
                const dotPos = resStr.length - scale;
                resStr = resStr.slice(0, dotPos) + "." + resStr.slice(dotPos);
            }
            finalNum = parseFloat(resStr);
        }
        
        return { value: isNegative ? -finalNum : finalNum, bytesRead: off - offset };
    }
};
