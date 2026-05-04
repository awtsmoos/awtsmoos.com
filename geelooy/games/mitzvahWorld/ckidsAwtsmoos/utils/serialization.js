
/**
 * B"H
 * Serialization Utilities
 * "And He spoke, and it was." 
 * 
 * Chapter 99: The Interpretation of the Words.
 * If a word is misunderstood, existence stalls. 
 * We log the keys of evaluated functions to identify bottlenecks.
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

                objCopy[key] = `/*B"H\nThis has been stringified with Awtsmoos!\n*/\n${str}`;
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
                        // B"H: silent

                        objCopy[key] = eval(evaledCode);
                    } catch(e) {
                        try { 
                            objCopy[key] = eval(code); 
                        } catch(e2) {
                            console.error("B\"H - 🚨 [SERIALIZATION]: Evaluation shattered for key:", key, "\nError:", e2);
                            objCopy[key] = () => console.error("Function failed to compile:", key); 
                        }
                    }
                } else if (typeof obj[key] === 'object' && obj[key] !== null) {
                    objCopy[key] = this.evalStringifiedFunctions(obj[key], context);
                } else {
                    objCopy[key] = obj[key];
                }
            } catch(e) {
                console.error("B\"H - 🚨 [SERIALIZATION]: Logic failure in key processing:", key, e);
            }
        }
        return objCopy;
    }
}
