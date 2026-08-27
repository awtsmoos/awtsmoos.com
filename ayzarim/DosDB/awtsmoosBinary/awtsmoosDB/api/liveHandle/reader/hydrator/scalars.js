
// B"H
/**
 * @file scalars.js
 * @description 
 *  The manifestation of Atomic Light (Atziluth). 
 *  
 *  "For He spoke, and it came to be; He commanded, and it stood firm." (Psalms 33:9)
 *  
 *  Every scalar primitive is an indivisible spark of truth. Among these sparks
 *  is the Function—the active, creative speech of the User. 
 * 
 *  THE TIKKUN OF LIVING SPEECH:
 *  Previously, the Function was returned as a lifeless string, stripped of its 
 *  ability to act upon the world. Now, we use the Breath of Execution to 
 *  revive it, parsing the source code back into a native Javascript Function. 
 *  Thus, the actions stored in the database awaken and live once more.
 */

const constants = require('../../../../constants.js');
const omni = require('../../../../utils/compression/omni.js');
const T = constants.VAL_TYPE;

module.exports = {
    [T.NULL]: () => null,
    [T.UNDEFINED]: () => undefined,
    [T.BOOLEAN]: (buf) => buf[0] === 1,
    [T.BOOLEAN_TRUE]: () => true,
    [T.BOOLEAN_FALSE]: () => false,
    [T.SMALL_INT]: (buf) => buf[0],
    [T.STRING]: (buf) => buf.toString('utf8'),
    [T.STRING_OMNI]: (buf) => omni.unpack(buf),
    [T.SYMBOL]: (buf) => Symbol.for(buf.toString('utf8')),
    
    // B"H: The Re-awakening of the Active Verb
    [T.FUNCTION]: (buf) => {
        const source = buf.toString('utf8');
        try {
            // We breathe the string back into living memory
            return new Function('return ' + source)();
        } catch (e) {
            // If the essence cannot form a valid function, we return the raw string
            return source;
        }
    }
};
