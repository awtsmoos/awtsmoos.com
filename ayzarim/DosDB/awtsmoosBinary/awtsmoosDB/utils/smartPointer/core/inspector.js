
// B"H
/**
 * @file utils/smartPointer/core/inspector.js
 * @description
 * Chapter 0.3: The Watchman's Gaze.
 * 
 * This angel looks upon the raw bytes and identifies the boundaries of a pointer.
 * It uses the 'Decoder' to peer into the VarInts, but its focus is purely 
 * on the identification of the archetype (Type) and the magnitude of the seal (Size).
 * 
 * B"H: The comparison operator '<=' is now pure functional speech. 
 * The shells of HTML encoding have been burned away.
 */

const SmartPointerDecoder = require('./decode.js');

module.exports = {
    /**
     * @method readSize
     * @description Calculates how many bytes a seal consumes on disk.
     */
    readSize(buf, start = 0) {
        // Pure unadulterated speech: No more Syntax Errors.
        if (!buf || buf.length <= start) return 0;
        
        const dec = SmartPointerDecoder.execute(buf, start);
        return dec ? dec.byteSize : 0;
    },

    /**
     * @method getType
     * @description Reveals the archetype of the data hidden in the Bits.
     */
    getType(buf, start = 0) {
        if (!buf || buf.length <= start) return 0;
        
        const dec = SmartPointerDecoder.execute(buf, start);
        return dec ? dec.type : 0;
    }
};
