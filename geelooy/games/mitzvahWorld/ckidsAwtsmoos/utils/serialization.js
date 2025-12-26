/**
 * B"H
 * Serialization Utilities
 * Handles robust conversion of functions to strings and back.
 */
export default class SerializationUtils {
    static copyObj(obj) {
        if(!obj || typeof(obj) != "object") return obj;
        let objCopy = Array.isArray(obj) ? [] : {};
        for (let key in obj) {
            if (typeof obj[key] === 'object' && obj[key] !== null) {
                objCopy[key] = this.copyObj(obj[key]);
            } else {
                objCopy[key] = obj[key];
            }
        }
        return objCopy;
    }
    
    static copySerializableValues(sourceObj, targetObj) {
        for (const key in sourceObj) {
            const value = sourceObj[key];
            if (this.isSerializable(value)) { 
                targetObj[key] = value;
            } else if (Array.isArray(value)) { 
                targetObj[key] = []; 
                for (const item of value) {
                    if (this.isSerializable(item)) {
                        targetObj[key].push(item);
                    }
                }
            } else if (value instanceof Date) { 
                targetObj[key] = new Date(value); 
            } 
        }
    }
  
    static isSerializable(value) {
        return (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean' || typeof value === 'bigint' || value === null || value === undefined);
    }

    /**
     * B"H: Corrected stringify logic to avoid SyntaxError with nested backticks.
     */
    static stringifyFunctions(obj) {
        let objCopy = Array.isArray(obj) ? [] : {};
        for (let key in obj) {
            if (typeof obj[key] === 'function') {
                let str = obj[key].toString().trim();
                
                const isAsync = str.startsWith("async");
                const strWithoutAsync = isAsync ? str.substring(5).trim() : str;
                const isArrow = /^(async\s+)?(\([^\)]*\)|[a-zA-Z0-9_$]+)\s*=>/.test(str);
                
                if (!isArrow) {
                    if (
                        !strWithoutAsync.startsWith("function") && 
                        !strWithoutAsync.startsWith("class") && 
                        !str.startsWith("get ") && 
                        !str.startsWith("set ")
                    ) {
                         if (isAsync) {
                             str = "async function " + strWithoutAsync;
                         } else {
                             str = "function " + str;
                         }
                    }
                }

                // B"H: Using single quotes to prevent backtick collisions
                objCopy[key] = '/*B"H\nThis has been stringified with Awtsmoos!\n*/\n' + str;
            } else if (typeof obj[key] === 'object' && obj[key] !== null) {
                objCopy[key] = this.stringifyFunctions(obj[key]);
            } else {
                objCopy[key] = obj[key];
            }
        }
        return objCopy;
    }

    static evalStringifiedFunctions(obj, context=null) {
        var objCopy = Array.isArray(obj) ? [] : {};
        var comment = '/*B"H\nThis has been stringified with Awtsmoos!\n*/\n';
        
        for (let key in obj) {
            try {
                if (typeof obj[key] === 'string' && obj[key].startsWith(comment)) {
                    var code = obj[key].substring(comment.length);
                    var evaledCode = '(' + code + ')';
                    
                    try {
                        objCopy[key] = eval(evaledCode);
                    } catch(e) {
                        try { 
                            objCopy[key] = eval(code); 
                        } catch(e2) {
                            console.error("B\"H - Failed to evaluate function:", key, e2, "\nCode:", code);
                            objCopy[key] = () => {}; 
                        }
                    }
                } else if (typeof obj[key] === 'object' && obj[key] !== null) {
                    objCopy[key] = this.evalStringifiedFunctions(obj[key], context);
                } else {
                    objCopy[key] = obj[key];
                }
            } catch(e) {
                console.error("B\"H - Error processing key:", key, e);
            }
        }
        return objCopy;
    }
}
