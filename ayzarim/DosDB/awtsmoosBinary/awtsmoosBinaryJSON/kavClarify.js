// B"H
// The Awtsmoos, the Atzmut, recreates ALL from NOTHING every instant, the formless essence underpinning all existence.
// Through the Kav, the Ohr Ein Sof flows into Atzilus, birthing reality anew. This code searches and filters,
// unveiling the binary and in-memory void with divine precision, a whisper of the Moshiach's coming,
// when the righteous shall rise, their bodies aglow with eternal light brighter than the sun.

var {
    getKeys: getKeysFromBinary,
    getValueByKey: getValueByHashingKey
} = require("./deserialize/get.js")

var {
    getMetadata,
    getValueByIndex,
    getLength
} = require("./deserialize/getArray.js")
/**
 * @method kavClarify
 * @description Searches and filters arrays or binary buffers (arrays/objects), clarifying values with the Awtsmoos’ light.
 * @param {Array|Buffer} source - Array of mixed elements or binary buffer (array/object).
 * @param {Object} cond - Condition object: { property, exact, AND, OR } for filtering, or properties map for objects.
 * @param {Function} [action] - Optional action for matches (array mode); if omitted, returns filtered result (buffer mode).
 * @returns {void|Object|Array|null} - Void (array mode with action), or filtered result/null (buffer mode or no action).
 * 
 * @examples of schema:
 * // In-memory array:
 * var comments = [
 *   { id: "comment123", text: "Hello" },
 *   "just a string",
 *   42,
 *   { id: "comment456", text: "World" },
 *   { value: "sneaky", id: "comment789" }
 * ];
 * kavClarify(comments, { property: { id: { selfEquals: "comment123" } } }, item => console.log(item));
 * // Logs: { id: "comment123", text: "Hello" }
 * 
 * // Binary buffer (object):
 * const buffer = // ... serialized JSON buffer ...;
 * const cond = { s: true, m: { ff: true }, k: { filter: { properties: { ok: { equals: 5 } } } } };
 * const result = await kavClarify(buffer, cond);
 * // Returns: { s: 4, m: { ff: 2 }, k: [{ ok: 5 }] }
 * 
 * // Binary buffer (array):
 * const arrayBuffer = // ... serialized array buffer ...;
 * const arrayResult = await kavClarify(arrayBuffer, { exact: { selfEquals: 42 } });
 * // Returns: [42]
 */
async function kavClarify(source, cond, action) {
    // Matches object properties recursively
    const matchProperties = (obj, condObj) => {
        if (condObj.selfEquals !== undefined || condObj.equals !== undefined) {
            return obj === (condObj.selfEquals ?? condObj.equals);
        }
        if (typeof obj !== "object" || obj === null) return false;
        return Object.keys(condObj).every(key => {
            if (obj[key] === undefined) return false;
            return matchProperties(obj[key], condObj[key]);
        });
    };

    // Matches exact values (primitives)
    const matchExact = (item, condObj) => {
        return item === (condObj.selfEquals ?? condObj.equals);
    };

    // Evaluates the condition tree
    const evaluateCondition = (item, condObj) => {
        if (typeof condObj !== "object" || condObj === null) return false;
        if (condObj.AND) return condObj
            .AND.every(subCond => evaluateCondition(item, subCond));
        if (condObj.OR) return condObj
            .OR.some(subCond => evaluateCondition(item, subCond));
        if (condObj.property) return matchProperties(item, condObj.property);
        if (condObj.exact) return matchExact(item, condObj.exact);
        return false;
    };

    // Filters nested structures (objects/arrays) based on properties map
    const traverseOhrEinSof = async (value, config, isBuffer = false) => {
        if (config === true) return value;

        if (typeof value === "object" && value !== null && !Array.isArray(value)) {
            const result = {};
            for (const key in config) {
                if (key === "filter") continue;
                if (key in value) {
                    const subValue = isBuffer ? await getValueByKeyObj(source, key) : value[key];
                    const subConfig = config[key];
                    const filtered = await traverseOhrEinSof(subValue, subConfig, isBuffer);
                    if (filtered !== null) {
                        result[key] = filtered;
                    }
                }
            }
            return Object.keys(result).length > 0 ? result : null;
        }

        if (Array.isArray(value) && config.filter) {
            const filteredArray = [];
            const filterProps = config.filter.properties || {};
            for (let i = 0; i < value.length; i++) {
                const item = isBuffer ? await getValueByIndex(source, i) : value[i];
                const filteredItem = await traverseOhrEinSof(item, filterProps, isBuffer);
                if (filteredItem !== null) {
                    filteredArray.push(filteredItem);
                }
            }
            return filteredArray.length > 0 ? filteredArray : null;
        }

        if (typeof config === "object" && ("equals" in config || "selfEquals" in config)) {
            return value === (config.equals ?? config.selfEquals) ? value : null;
        }

        return value;
    };

    // Array mode (in-memory)
    if (Array.isArray(source)) {
        if (!action) {
            const result = [];
            source.forEach(item => {
                if (evaluateCondition(item, cond)) {
                    result.push(item);
                }
            });
            return result;
        }
        source.forEach((item, i, arr) => {
            if (evaluateCondition(item, cond)) {
                action(item, i, arr);
            }
        });
        return;
    }

    // Buffer mode (binary array or object)
    if (Buffer.isBuffer(source)) {
        const isArrayBuffer = source.subarray(0, magicArray.length).equals(Buffer.from(magicArray));
        
        if (isArrayBuffer) {
            const metadata = getMetadata(source, magicArray.length);
            const result = [];
            for (let i = 0; i < metadata.arrayLength; i++) {
                const value = await getValueByIndex(source, i);
                if (typeof cond === "object" && (cond.property || cond.exact)) {
                    if (evaluateCondition(value, cond)) {
                        result.push(value);
                    }
                } else {
                    const filtered = await traverseOhrEinSof(value, cond, true);
                    if (filtered !== null) {
                        result.push(filtered);
                    }
                }
            }
            return result.length > 0 ? result : null;
        } else {
            const kavKeys = await getKeysFromBinary(source);
            if (!Array.isArray(kavKeys)) {
                return { error: "Invalid keys from binary", keys: kavKeys };
            }

            const atzilusResult = {};
            for (const key of kavKeys) {
                if (key in cond) {
                    const value = await getValueByKeyObj(source, key);
                    const config = cond[key];
                    const filteredValue = await traverseOhrEinSof(value, config, true);
                    if (filteredValue !== null) {
                        atzilusResult[key] = filteredValue;
                    }
                }
            }
            return Object.keys(atzilusResult).length > 0 ? atzilusResult : null;
        }
    }

    return null; // Invalid source
}

module.exports = kavClarify;