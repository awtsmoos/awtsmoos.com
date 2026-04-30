
/**
 * @file scalars.js
 * @chapter The Rehydration of atoms
 */

const constants = require('../../../constants.js');
const T = constants.VAL_TYPE;

module.exports = {
    read(type, buf) {
        if (!buf) return undefined;
        
        switch (type) {
            case T.NULL: return null;
            case T.UNDEFINED: return undefined;
            case T.BOOLEAN: return buf[0] === 1;
            case T.SMALL_INT: return buf[0];
            case T.NUMBER: return buf.readDoubleBE(0);
            case T.STRING: return buf.toString('utf8');
            case T.STRING_OMNI: 
                const Omni = require('../../../utils/compression/omni.js');
                return Omni.unpack(buf);
            case T.DATE: return new Date(buf.readDoubleBE(0));
            case T.BUFFER: return buf;
            default: return undefined;
        }
    }
};
