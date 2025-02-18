//B"H
var {
    magicJSON,
    magicArray,
    hashAmount

} = require("./constants");

var {
    readFileBytesAtOffset,
    hashKey
} = require("./awtsmoosBinaryHelpers.js")


class BinaryFileWrapper {
    constructor(filePath) {
        this.filePath = filePath;
    }

    async getKeys() {
        const magicSchema = { magic: 'string_4' };
        const magicInfo = await readFileBytesAtOffset({ filePath: this.filePath, offset: 0, schema: magicSchema });
        
        if (magicInfo.magic !== magicJSON && magicInfo.magic !== magicArray) {
            throw new Error("Invalid file format");
        }
        
        let offset = magicInfo.magic.length;
        if (magicInfo.magic === magicJSON) {
            const hashInfo = await readFileBytesAtOffset({ filePath: this.filePath, offset, schema: { amount: 'uint_4' } });
            offset = hashInfo.offset;
            
            let keys = [];
            for (let i = 0; i < hashInfo.amount; i++) {
                const keyOffsetInfo = await readFileBytesAtOffset({ filePath: this.filePath, offset, schema: { keyOffset: 'uint_4' } });
                offset += 4;
                
                if (keyOffsetInfo.keyOffset !== 0) {
                    const keyInfo = await readFileBytesAtOffset({ filePath: this.filePath, offset: keyOffsetInfo.keyOffset, schema: { amount: 'uint_4' } });
                    const keyData = await readFileBytesAtOffset({ filePath: this.filePath, offset: keyInfo.offset, schema: { key: `string_${keyInfo.amount}` } });
                    keys.push(keyData.key);
                }
            }
            return keys;
        } else if (magicInfo.magic === magicArray) {
            const arrayLengthInfo = await readFileBytesAtOffset({ filePath: this.filePath, offset, schema: { amount: 'uint_4' } });
            return Array.from({ length: arrayLengthInfo.amount }).map((_, i) => i);
        }
    }

    async getValueByKey(key) {
        const magicSchema = { magic: 'string_4' };
        const magicInfo = await readFileBytesAtOffset({ filePath: this.filePath, offset: 0, schema: magicSchema });
        
        if (magicInfo.magic !== magicJSON) {
            return { awtsmoosError: "Not a real file!" };
        }
        
        let offset = magicInfo.magic.length;
        const hashInfo = await readFileBytesAtOffset({ filePath: this.filePath, offset, schema: { amount: 'uint_4' } });
        offset = hashInfo.offset;
        
        let index = hashKey(key, hashInfo.amount);
        for (let i = 0; i < hashInfo.amount; i++) {
            const keyOffsetInfo = await readFileBytesAtOffset({ filePath: this.filePath, offset, schema: { keyOffset: 'uint_4' } });
            offset += 4;
            
            if (keyOffsetInfo.keyOffset === 0) continue;
            if (index === i) {
                const keyInfo = await readFileBytesAtOffset({ filePath: this.filePath, offset: keyOffsetInfo.keyOffset, schema: { amount: 'uint_4' } });
                const storedKeyData = await readFileBytesAtOffset({ filePath: this.filePath, offset: keyInfo.offset, schema: { key: `string_${keyInfo.amount}` } });
                
                if (storedKeyData.key === key) {
                    return await parseValueFromKey({
                        keyOffset: keyInfo.offset,
                        keyLength: keyInfo.amount,
                        buffer: this.filePath
                    });
                }
                return { error: { storedKey: storedKeyData.key, key } };
            }
        }
        return { error: { message: "Key not found" } };
    }

    async mapBinary(mapObj, buffer = null) {
        const result = {};
        const keys = await this.getKeys();  // Get all root-level keys from the binary data
    
        // Helper function to process a key with conditions
        const processKey = async (key, conditions, value) => {
            // Check conditions if they exist
            if (typeof conditions === 'boolean' && conditions === true) {
                return value;  // If just true, return the value
            }
    
            if (typeof conditions === 'object') {
                // Process equals and includes conditions
                for (let conditionKey in conditions) {
                    const conditionValue = conditions[conditionKey];
    
                    if (conditionKey === 'equals') {
                        if (value !== conditionValue) return null;
                    } else if (conditionKey === 'includes') {
                        if (!value.includes(conditionValue)) return null;
                    }
                }
                return value;  // Return value if conditions passed
            }
            return null;
        };
    
        // Iterate through mapObj to extract keys and apply conditions
        for (let key in mapObj) {
            const conditions = mapObj[key];
    
            // If the key is found in the binary data, process it
            if (keys.includes(key)) {
                const value = await this.getValueByKey(key, buffer);
    
                // If no value is found, skip to the next key
                if (value.awtsmoosError) {
                    continue;
                }
    
                // Apply conditions for the root-level key
                const processedValue = await processKey(key, conditions, value);
    
                // If processed value is valid, add to result
                if (processedValue !== null) {
                    result[key] = processedValue;
                }
            } else {
                // If the key is not found, check if it's a nested object in mapObj
                const nestedValue = mapObj[key];
    
                if (typeof nestedValue === 'object') {
                    // For nested objects, directly process the object by looping through its keys
                    const nestedResult = {};
    
                    // Recursively map the nested object
                    for (let nestedKey in nestedValue) {
                        const nestedConditions = nestedValue[nestedKey];
                        const nestedValueFromBuffer = await this.getValueByKey(nestedKey, buffer);
    
                        // If no value is found for the nested key, skip it
                        if (nestedValueFromBuffer.awtsmoosError) {
                            continue;
                        }
    
                        // Process the nested key with its conditions
                        const processedNestedValue = await processKey(nestedKey, nestedConditions, nestedValueFromBuffer);
    
                        // If processed nested value is valid, add to the result
                        if (processedNestedValue !== null) {
                            nestedResult[nestedKey] = processedNestedValue;
                        }
                    }
    
                    // If we got any valid nested results, add them to the final result
                    if (Object.keys(nestedResult).length > 0) {
                        result[key] = nestedResult;
                    }
                }
            }
        }
    
        // Return the final filtered map
        return result;
    }
    
}


module.exports = 
    BinaryFileWrapper
