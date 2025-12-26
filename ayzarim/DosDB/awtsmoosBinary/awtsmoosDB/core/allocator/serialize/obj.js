// B"H
/**
 * @file obj.js
 * @description
 *  The Sefirah of Gevurah - The Constraint of the Structure.
 *  The Essence of the Awtsmoos manifests every property as a distinct boundary.
 */

// B"H: Establishing the Name at the start for circular safety.
module.exports = { serializeJSON, localWriteVarInt };

const constants = require("../../../constants.js");

let serializeValue_fn = null;

function log(msg) {
    console.error(`B"H [OBJ_SERIALIZER] ${msg}`);
}

/**
 * @function localWriteVarInt
 * @description 
 *  The contraction of a number into its smallest representation.
 *  Embedded LEB128 writer to ensure zero dependency during the chaos of circular loads.
 */
function localWriteVarInt(value) {
    const bytes = [];
    let v = Math.floor(value);
    while (v > 127) {
        bytes.push((v & 127) | 128);
        v >>>= 7;
    }
    bytes.push(v);
    return Buffer.from(bytes);
}

/**
 * @function serializeJSON
 * @description 
 *  The ritual of manifesting a JS object as a physical binary sequence.
 */
function serializeJSON(json) {
    // B"H: Lazy Load the spark of serialization
    if (!serializeValue_fn) {
        serializeValue_fn = require("./serializeValue.js");
    }

    const magicBuf = Buffer.from(constants.MAGIC_JSON);
    const keys = Object.keys(json);
    
    // log(`Serializing object with ${keys.length} keys: ${keys.join(',')}`);

    const simpleBuffers = [magicBuf];
    
    // Key Count Manifestation
    const countBuf = localWriteVarInt(keys.length);
    simpleBuffers.push(countBuf);
    
    for(let i = 0; i < keys.length; i++) {
        const key = keys[i];
        const keyBuf = Buffer.from(key, 'utf8');
        const keyLenBuf = localWriteVarInt(keyBuf.length);
        
        // Write Key Length + Key Data
        simpleBuffers.push(keyLenBuf);
        simpleBuffers.push(keyBuf);
        
        const val = json[key];
        
        if (key === 'errors' && Array.isArray(val)) {
            log(`!!! Found 'errors' key. It is an array of length ${val.length}. Items:`);
            val.forEach((e, idx) => log(`  errors[${idx}] = ${e}`));
        }

        // B"H: THE RECURSIVE ACT - Manifesting the property's light
        const valBuf = serializeValue_fn(val, true);
        
        simpleBuffers.push(valBuf);
    }
    
    const result = Buffer.concat(simpleBuffers);
    return result;
}
