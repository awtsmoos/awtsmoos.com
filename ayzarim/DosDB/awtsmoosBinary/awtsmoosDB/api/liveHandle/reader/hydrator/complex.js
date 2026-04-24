
// B"H
/**
 * @file complex.js
 * @description The highest forms of organization (Beriah).
 */

const constants = require('../../../../constants.js');
const parser = require('../../../../deserialize/parser.js');
const serializer = require('../../../../utils/serializer.js');
const classRegistry = require('../../../../utils/smartPointer/registry.js');

const T = constants.VAL_TYPE;

module.exports = {
    [T.JSON]: (buf) => parser.parse(buf),
    [T.OBJECT]: (buf) => parser.parse(buf),
    [T.ARRAY]: (buf) => parser.parse(buf),
    
    // B"H: The Resurrection of the Shattered Vessels (Errors)
    [T.ERROR]: (buf) => {
        const parsed = parser.parse(buf);
        let ErrClass = globalThis[parsed.name] || Error;
        
        let err;
        try {
            // AggregateError requires an array of errors as its first argument
            if (parsed.name === 'AggregateError') {
                err = new ErrClass(parsed.errors || [], parsed.message);
            } else {
                err = new ErrClass(parsed.message);
            }
        } catch(e) {
            // Fallback if construction fails
            err = new Error(parsed.message);
        }
        
        err.name = parsed.name;
        if (parsed.stack) err.stack = parsed.stack;
        if (parsed.cause) err.cause = parsed.cause;
        if (parsed.errors) err.errors = parsed.errors;
        
        return err;
    },

    [T.REGEXP]: (buf) => {
        try {
            const sRes = serializer.readVarInt(buf, 0);
            const source = buf.subarray(sRes.bytesRead, sRes.bytesRead + sRes.value).toString('utf8');
            const flags = buf.subarray(sRes.bytesRead + sRes.value).toString('utf8');
            return new RegExp(source, flags);
        } catch(e) { return /ErrorResurrectingRegExp/; }
    },

    // B"H: Re-Hydrating nested native JS Maps from array sequences
    [T.JS_MAP]: (buf) => {
        const arr = parser.parseArray(buf, 0, parser.parseValue);
        return new Map(arr);
    },
    
    // B"H: Re-Hydrating nested native JS Sets from array sequences
    [T.JS_SET]: (buf) => {
        const arr = parser.parseArray(buf, 0, parser.parseValue);
        return new Set(arr);
    },

    [T.CUSTOM_INSTANCE]: (buf, allocator, context) => {
        let offset = 0;
        const nameInfo = serializer.readString(buf, offset); offset += nameInfo.bytesRead;
        const sourceInfo = serializer.readString(buf, offset); offset += sourceInfo.bytesRead;
        
        const dictSealLenInfo = serializer.readVarInt(buf, offset); offset += dictSealLenInfo.bytesRead;
        const dictPtrBuf = buf.subarray(offset, offset + dictSealLenInfo.value);
        
        let Cls = classRegistry.get(nameInfo.value);
        if (!Cls) { 
            try { 
                Cls = (new Function(`return (${sourceInfo.value});`))(); 
                if (Cls) classRegistry.set(nameInfo.value, Cls); 
            } catch(e) {} 
        }
        
        const instance = Cls ? Object.create(Cls.prototype) : { __className__: nameInfo.value, __source__: sourceInfo.value };
        const Dictionary = require('../../../../structure/dictionary/index.js');
        const dict = new Dictionary(allocator, dictPtrBuf);
        
        for (const [k, val] of dict.entries(context)) {
            instance[k] = val;
        }
        return instance;
    }
};
