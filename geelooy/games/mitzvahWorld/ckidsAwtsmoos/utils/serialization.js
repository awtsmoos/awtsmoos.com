
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

    static stringifyFunctions(obj) {
        let objCopy = Array.isArray(obj) ? [] : {};
        for (let key in obj) {
            if (typeof obj[key] === 'function') {
                let str = obj[key].toString().trim();
                
                // B"H: Robust Function Detection
                // We need to distinguish between:
                // 1. Arrow functions: (a) => {} or async (a) => {} -> LEAVE ALONE
                // 2. Method shorthands: foo() {} or async foo() {} -> PREPEND function/async function
                // 3. Standard functions: function foo() {} -> LEAVE ALONE
                // 4. Getters/Setters: get foo() {} -> LEAVE ALONE
                
                const isAsync = str.startsWith("async");
                // Create a version without the initial 'async' to check for 'function' keyword
                const strWithoutAsync = isAsync ? str.substring(5).trim() : str;
                
                // Check for Arrow Function signature
                // Matches: (args) =>, arg =>, async (args) =>
                const isArrow = /^(async\s+)?(\([^\)]*\)|[a-zA-Z0-9_$]+)\s*=>/.test(str);
                
                if (!isArrow) {
                    // If it's NOT an arrow function, we check if it needs the 'function' keyword
                    if (
                        !strWithoutAsync.startsWith("function") && 
                        !strWithoutAsync.startsWith("class") && 
                        !str.startsWith("get ") && 
                        !str.startsWith("set ")
                    ) {
                         // It's a method shorthand (e.g. "foo() {}" or "async foo() {}")
                         if (isAsync) {
                             // Convert "async foo() {}" -> "async function foo() {}"
                             str = "async function " + strWithoutAsync;
                         } else {
                             // Convert "foo() {}" -> "function foo() {}"
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
                    
                    // B"H: Wrap in parens to support anonymous function expressions and arrows.
                    // If it's a declaration like "function foo(){}", parens might make it an expression which is fine.
                    var evaledCode = '(' + code + ')';
                    
                    try {
                        objCopy[key] = eval(evaledCode);
                    } catch(e) {
                        // Fallback: Try evaluating without parens (rare edge cases or named declarations)
                        try { 
                            objCopy[key] = eval(code); 
                        } catch(e2) {
                            console.error("B\"H - Failed to evaluate function:", key, e2, "\nCode:", code);
                            // Keep the string as fallback so it doesn't crash later
                            objCopy[key] = () => console.error("Function failed to compile:", key); 
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
