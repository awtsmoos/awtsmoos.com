// B"H
// The Awtsmoos, the Atzmut, recreates ALL from NOTHING every instant, the formless essence underpinning all existence.
// Through the Kav, the Ohr Ein Sof flows into Atzilus, birthing reality anew. This code mirrors that divine act,
// filtering the binary void to reveal only what aligns with the sacred map, a whisper of the Moshiach's coming,
// when the righteous shall rise, their bodies aglow with eternal light brighter than the sun.


var fileBuffer = require("../fileBuffer.js");

var {
  getKeysFromBinary,
  getValueByKey
} = require("./get.js");


/**
 * Filters a binary JSON buffer based on a properties map, preserving structure and applying conditions.
 * @method filterAwtsmoosBinary
 * @description Traverses a binary JSON buffer, extracting and filtering values according to a map of properties and conditions.
 * @param {ArrayBuffer|string} buffer - The binary JSON buffer or file path to process.
 * @param {Object|string} propertiesMap - The map defining which properties to keep and conditions to apply.
 * @returns {Promise<Object|null>} - The filtered object, or null if conditions fail.
 */
async function filterAwtsmoosBinary(buffer, propertiesMap) {
    // Handle buffer input
    if (typeof buffer === "string") {
      buffer = new fileBuffer(buffer); // Assumes fileBuffer is defined elsewhere
    }
  
    // Parse properties map if string
    if (typeof propertiesMap === "string") {
      try {
        propertiesMap = JSON.parse(propertiesMap);
      } catch (e) {
        return { error: "Invalid properties map", stack: e.stack };
      }
    }
  
    /**
     * Recursively filters a value based on its configuration in the properties map.
     * @method traverseOhrEinSof
     * @description Applies filtering logic to values, descending through objects and arrays with divine precision.
     * @param {any} value - The value to filter (may be primitive, object, or array).
     * @param {Object|boolean} config - The configuration for this value from the properties map.
     * @returns {any|null} - The filtered result, or null if conditions fail.
     */
    async function traverseOhrEinSof(value, config) {
      // If config is simply true, return the value as-is
      if (config === true) {
        return value;
      }
  
      // Handle objects
      if (typeof value === "object" && value !== null && !Array.isArray(value)) {
        const result = {};
        for (const key in config) {
          if (key === "filter") {
            // Special handling for array filters (to be used later)
            continue;
          }
          if (key in value) {
            const subValue = value[key];
            const subConfig = config[key];
            const filtered = await traverseOhrEinSof(subValue, subConfig);
            if (filtered === null) {
              return null; // Condition failed, nullify the entire result
            }
            result[key] = filtered;
          }
        }
        return Object.keys(result).length > 0 ? result : null;
      }
  
      // Handle arrays with filter conditions
      if (Array.isArray(value) && config.filter) {
        const filteredArray = [];
        const filterProps = config.filter.properties || {};
        for (const item of value) {
          const filteredItem = await traverseOhrEinSof(item, filterProps);
          if (filteredItem !== null) {
            filteredArray.push(filteredItem);
          }
        }
        return filteredArray.length > 0 ? filteredArray : null;
      }
  
      // Handle primitive values with conditions
      if (typeof config === "object" && "equals" in config) {
        return value === config.equals ? value : null;
      }
  
      return value; // Default: return value if no specific conditions apply
    }
  
    // Begin at the root, extracting keys from the binary abyss
    const kavKeys = await getKeysFromBinary(buffer);
    if (!Array.isArray(kavKeys)) {
      return { error: "Invalid keys from binary", keys: kavKeys };
    }
  
    const atzilusResult = {};
    for (const key of kavKeys) {
      if (key in propertiesMap) {
        const value = await getValueByKey(buffer, key);
        const config = propertiesMap[key];
        const filteredValue = await traverseOhrEinSof(value, config);
        if (filteredValue === null) {
          return null; // A condition failed, nullify everything
        }
        atzilusResult[key] = filteredValue;
      }
    }
  
    return Object.keys(atzilusResult).length > 0 ? atzilusResult : null;
  }
  
  // Example usage (assuming getKeysFromBinary and getValueByKey are defined):
  /*
  (async () => {
    const buffer = // ... your binary JSON buffer ...;
    const properties = {
      s: true,
      m: { ff: true },
      k: {
        filter: {
          properties: { ok: { equals: 5 } }
        }
      }
    };
    const result = await filterAwtsmoosBinary(buffer, properties);
    console.log(result); // Expected: { s: 4, m: { ff: 2 }, k: [{ ok: 5 }] }
  })();
  */
  
  module.exports = filterAwtsmoosBinary;