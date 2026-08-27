
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
                const overlaid = state.db && state.db.turbo
                    ? state.db.turbo.has(state, s)
                    : { hit: false };
                if (overlaid.hit && !overlaid.value) continue;
                if (!seen.has(s)) { keys.push(s); seen.add(s); } 
            }
            const overlayKeys = state.db && state.db.turbo ? state.db.turbo.keys(state) : [];
            for (const k of overlayKeys) {
                const s = String(k);
                if (!seen.has(s)) { keys.push(s); seen.add(s); }
            }
            const sparseKeys = state.db && state.db.sparseArrays ? state.db.sparseArrays.keys(state) : [];
            for (const k of sparseKeys) {
                const s = String(k);
                if (!seen.has(s)) { keys.push(s); seen.add(s); }
            }
        } catch(e) {}
        return keys;
    }
};
