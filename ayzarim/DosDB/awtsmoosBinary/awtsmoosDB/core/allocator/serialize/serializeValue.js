
// B"H
/**
 * @file serializeValue.js
 * @description 
 *  The Sefirah of Da'at (Knowledge). 
 * 
 *  This is the great synthesizer, bringing together Chokhmah (the abstract 
 *  TypeRegistry) and Binah (the structured InstanceRegistry). It receives the 
 *  raw JavaScript entity, which is constantly being spoken into existence by 
 *  the Creator's Ten Statements (from which all reality is derived), and 
 *  determines its perfect physical vessel. 
 *  
 *  It binds the type, the length, and the essence into a unified, eternal 
 *  buffer block, ready to be committed to the immortal disk. It performs 
 *  this act with purely data-driven logic, without the chaotic sprawl of 
 *  monolithic switch statements.
 */

const { packTypeAndLengthSize, writeConditional } = require("../../../utils/binaryHelpers.js");
const constants = require("../../../constants.js");
const TypeRegistry = require("./type_registry.js");
const getInstanceRegistry = require("./instance_registry.js");

/**
 * @function serializeValue
 * @description 
 *  Manifests raw JS values into wrapped binary vessels. Strictly synchronous.
 * 
 * @param {*} value The spark of reality to preserve.
 * @param {boolean} fullBuffer If true, wraps the data in the full [Type][Length][Data] armor.
 * @returns {Buffer|Object} The physical incarnation or a descriptive object.
 */
function serializeValue(value, fullBuffer = true) {
    const objModule = require("./obj.js");
    const arrModule = require("./array.js");
    const InstanceRegistry = getInstanceRegistry(objModule, arrModule);

    let result = null;

    // 1. Seek the essence via 'typeof' (The Light of Atziluth)
    const typeOfVal = typeof value;
    if (typeOfVal !== 'object') {
        if (TypeRegistry[typeOfVal]) {
            result = TypeRegistry[typeOfVal](value);
        }
    } else {
        // 2. Seek the complex structure via 'instanceof' (The Vessels of Beriah)
        for (let i = 0; i < InstanceRegistry.length; i++) {
            if (InstanceRegistry[i].check(value)) {
                result = InstanceRegistry[i].process(value);
                break;
            }
        }
        
        // 3. Fallback for generic objects not caught by the specific angelic scribes
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

    // If only the parts are requested (often for inline optimization)
    if (!fullBuffer) {
        return { 
            type: result.type, 
            data, 
            valueLengthInfo: lenInfo, 
            typeLengthByte: typeByte 
        };
    }

    // Wrap the essence in its complete protective armor
    const wrapper = Buffer.allocUnsafe(1 + lenInfo.size + data.length);
    wrapper[0] = typeByte;
    lenInfo.buffer.copy(wrapper, 1);
    data.copy(wrapper, 1 + lenInfo.size);
    
    return wrapper;
}

module.exports = serializeValue;
