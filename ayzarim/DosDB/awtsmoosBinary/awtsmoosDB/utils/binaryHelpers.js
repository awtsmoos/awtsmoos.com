// B"H
// The Single Source of Truth for Binary Operations.
// Replaces packing/*, utils/writeConditional.js, utils/hashing.js, utils/writeToBuffer.js

const crypto = require("crypto");

const helpers = {
    // --- Packing Logic ---
    packedLength(lengthSize) {
        return lengthSize === 1 ? 0 :
               lengthSize === 2 ? 1 :
               lengthSize === 4 ? 2 :
               lengthSize === 8 ? 3 : null;
    },

    unpackLength(lengthType) {
        return lengthType === 0 ? 1 :
               lengthType === 1 ? 2 :
               lengthType === 2 ? 4 :
               lengthType === 3 ? 8 : 0;
    },

    packTypeAndLengthSize(type, lengthSize) {
        const mod = helpers.packedLength(lengthSize);
        if (mod === null) return null; // Safety
        return type | (mod << 6);
    },

    unpackTypeAndLengthSize(byte) {
        const lengthType = byte >> 6;
        return { 
            type: byte & 0b00111111, 
            lengthSize: helpers.unpackLength(lengthType) 
        };
    },

    // --- Buffer Writing/Reading ---
    writeConditional(amount) {
        let buffer;
        let size = 1;
        if (amount < 256) {
            buffer = Buffer.alloc(1); buffer.writeUInt8(amount);
        } else if (amount < 65536) {
            size = 2; buffer = Buffer.alloc(2); buffer.writeUInt16BE(amount);
        } else if (amount < 4294967296) {
            size = 4; buffer = Buffer.alloc(4); buffer.writeUInt32BE(amount);
        } else {
            size = 8; buffer = Buffer.alloc(8); buffer.writeBigUInt64BE(BigInt(amount));
        }
        return { buffer, size };
    },

    readConditional(buffer, offset, size = null) {
        if (size === 1) return buffer.readUInt8(offset);
        if (size === 2) return buffer.readUInt16BE(offset);
        if (size === 4) return buffer.readUInt32BE(offset);
        if (size === 8) return Number(buffer.readBigUInt64BE(offset));
        return 0;
    },

    writeToBuffer(buffer, value, byteSize, offset) {
        for (let i = 0; i < byteSize; i++) {
            buffer.writeUInt8((value >> (8 * (byteSize - 1 - i))) & 0xFF, offset + i);
        }
    },
    
    
    
    writePointer48(buffer, value, offset) {
	    // Write high 16 bits
	    buffer.writeUInt16BE(Math.floor(value / 0xFFFFFFFF), offset);
	    // Write low 32 bits
	    buffer.writeUInt32BE(value % 0xFFFFFFFF, offset + 2);
	},
	
	readPointer48(buffer, offset) {
	    const high = buffer.readUInt16BE(offset);
	    const low = buffer.readUInt32BE(offset + 2);
	    // Combine safe integer (JS Number is safe up to 2^53)
	    return (high * 0x100000000) + low;
	}

    // --- Hashing ---
    hashKey(key, size) {
        const hash = crypto.createHash('md5').update(key).digest();
        return hash.readUInt32BE(0) % size;
    }
    
    
};

module.exports = helpers;