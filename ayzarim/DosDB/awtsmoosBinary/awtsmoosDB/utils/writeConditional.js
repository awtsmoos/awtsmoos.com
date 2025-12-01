// B"H
function writeConditional(amount) {
    let buffer;
    let size = 1;

    if (amount < 256) {
        buffer = Buffer.alloc(1);
        buffer.writeUInt8(amount);
    } else if (amount < 65536) {
        size = 2;
        buffer = Buffer.alloc(2);
        buffer.writeUInt16BE(amount);
    } else if (amount < 4294967296) {
        size = 4;
        buffer = Buffer.alloc(4);
        buffer.writeUInt32BE(amount);
    } else {
        size = 8;
        buffer = Buffer.alloc(8);
        buffer.writeBigUInt64BE(BigInt(amount));
    }

    return { buffer, size };
}
module.exports = writeConditional;