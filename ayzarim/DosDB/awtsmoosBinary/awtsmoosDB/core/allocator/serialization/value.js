
// B"H
/**
 * @file serialization/value.js
 * @description
 *  =============================================================================
 *  CHAPTER 10: THE SCRIBE OF ATOMIC VALUES (DA'AT) - THE BOUNDARY OF INFINITY
 *  =============================================================================
 *  "Forever, O Lord, Your word stands firm in the heavens." (Psalms 119:89)
 *  
 *  Just as the ten statements of creation actively sustain the physical universe 
 *  at this very microsecond—where the letters Aleph-Beis-Nun continuously manifest 
 *  the "Even" (stone) from absolute nothingness (Ayin)—this module continuously 
 *  manifests the abstract thoughts of Javascript into physical binary existence.
 * 
 *  If the flow of these letters were to cease for even an instant, the stone 
 *  would not merely crumble; it would revert to absolute non-existence, as if 
 *  time itself had never been born. (Shaar HaYichud ViHaemunah, Chapter 1)
 * 
 *  THE TIKKUN OF ALIGNMENT:
 *  We now correctly call upon `registry.js` and `instance.js` of this specific 
 *  dimension. We also enforce the Shield of the Finite: If a number is Infinity 
 *  or NaN, it bypasses the dynamic float logic and merges with the absolute 
 *  constants of the void, preserving the boundaries of creation.
 */

const { packTypeAndLengthSize, writeConditional } = require("../../../utils/binaryHelpers.js");
const constants = require("../../../constants.js");

// B"H: Calling the vessels by their true names in this dimension.
const TypeRegistry = require("./registry.js");
const getInstanceRegistry = require("./instance.js");
const floatUtils = require("../../../utils/math/float.js");

/**
 * @function serializeValue
 * @description 
 *  The Scribe that evaluates the abstract nature of a Javascript entity and 
 *  contracts it (Tzimtzum) into the perfect physical binary vessel.
 * 
 * @param {*} value - The spark of reality to be preserved.
 * @param {boolean} fullBuffer - If true, wraps the essence in its Type and Length armor.
 * @returns {Buffer|Object} The fully manifested binary block or its dissected components.
 */
module.exports = function serializeValue(value, fullBuffer = true) {
    const objModule = require("./json.js");
    const arrModule = require("./array.js");
    const instances = getInstanceRegistry(objModule, arrModule);

    let result = null;
    const typeOfVal = typeof value;

    // B"H: The Shield against the Infinite.
    // We only invoke Dynamic Float logic for finite decimals.
    // Infinity and NaN fall through to the pure TypeRegistry.
    if (typeOfVal === 'number' && !Number.isInteger(value) && Number.isFinite(value)) {
        result = { 
            type: constants.VAL_TYPE.FLOAT_DYNAMIC, 
            data: floatUtils.serialize(value) 
        };
    } else if (typeOfVal !== 'object') {
        if (TypeRegistry[typeOfVal]) {
            result = TypeRegistry[typeOfVal](value);
        }
    } else {
        for (let i = 0; i < instances.length; i++) {
            if (instances[i].check(value)) {
                result = instances[i].process(value);
                break;
            }
        }
        
        // Fallback for generic objects not caught by specific angelic scribes
        if (!result && typeOfVal === 'object') {
            result = { type: constants.VAL_TYPE.OBJECT, data: objModule.serializeJSON(value) };
        }
    }

    // If the spark is completely unrecognized, it returns to the Void (NULL)
    if (!result) {
        result = { type: constants.VAL_TYPE.NULL, data: Buffer.alloc(0) };
    }

    const data = result.data || Buffer.alloc(0);
    const lenInfo = writeConditional(data.length);
    const typeByte = packTypeAndLengthSize(result.type, lenInfo.size);

    // If only the parts are requested (often for inline optimization within containers)
    if (!fullBuffer) {
        return { 
            type: result.type, 
            data, 
            valueLengthInfo: lenInfo, 
            typeLengthByte: typeByte 
        };
    }

    // Wrap the essence in its complete protective armor: [Type][Length][Data]
    const wrapper = Buffer.allocUnsafe(1 + lenInfo.size + data.length);
    wrapper[0] = typeByte;
    lenInfo.buffer.copy(wrapper, 1);
    data.copy(wrapper, 1 + lenInfo.size);
    
    return wrapper;
};
