
// B"H
const floatUtils = require('../../../../utils/math/float.js');
const bigintUtils = require('../../../../utils/bigIntUtils.js');

module.exports = {
    packFloats: (val) => {
        const packets = [];
        for (let i = 0; i < val.length; i++) {
            const p = floatUtils.serialize(val[i]);
            packets.push(Buffer.from([p.length]), p);
        }
        return Buffer.concat(packets);
    },
    packBigInts: (val) => {
        const packets = [];
        for (let i = 0; i < val.length; i++) {
            const { buffer, isNegative } = bigintUtils.toBuffer(val[i]);
            packets.push(Buffer.from([isNegative ? 1 : 0, buffer.length]), buffer);
        }
        return Buffer.concat(packets);
    }
};
