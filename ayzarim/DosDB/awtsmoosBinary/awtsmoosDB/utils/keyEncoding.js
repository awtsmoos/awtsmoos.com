// B"H
const SYMB_GL_PREFIX = "@@SYMB_GL:";
const SYMB_UN_PREFIX = "@@SYMB_UN:";

module.exports = {
    encode(key) {
        if (typeof key === 'symbol') {
            const globalKey = Symbol.keyFor(key);
            if (globalKey) return SYMB_GL_PREFIX + globalKey;
            return SYMB_UN_PREFIX + String(key);
        }
        return String(key);
    },

    decode(keyStr) {
        if (typeof keyStr !== 'string') return keyStr;
        if (keyStr.startsWith(SYMB_GL_PREFIX)) {
            return Symbol.for(keyStr.substring(SYMB_GL_PREFIX.length));
        }
        if (keyStr.startsWith(SYMB_UN_PREFIX)) {
            const raw = keyStr.substring(SYMB_UN_PREFIX.length);
            const descMatch = raw.match(/^Symbol\((.*)\)$/);
            const desc = descMatch ? descMatch[1] : raw;
            return Symbol(desc);
        }
        return keyStr;
    }
};