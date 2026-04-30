
// B"H
/**
 * @file traps/ownKeys.js
 */
module.exports = {
    handle(state, tgt) {
        const keys = Reflect.ownKeys(tgt);
        const seen = new Set(keys.map(k => String(k)));
        try { 
            state.ensureResolved();
            for (const k of state.reader.keys()) { 
                const s = String(k); 
                if (!seen.has(s)) { keys.push(s); seen.add(s); } 
            } 
        } catch(e) {}
        return keys;
    }
};
