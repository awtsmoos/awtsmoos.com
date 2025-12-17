
// B"H
const FilterEvaluator = require('./evaluator.js');
const Projector = require('./projector.js');
const constants = require('../../constants.js');

class AwtsmoosQuery {
    static async execute(handle, queryObj) {
        if (!queryObj) return handle;
        
        // B"H: Use Symbol to get internal handle
        const h = handle && handle[constants.SYMBOLS.INTERNALS] ? handle[constants.SYMBOLS.INTERNALS] : handle;
        
        if (queryObj === true) return await h.reader.resolveSelf();

        // B"H: Ensure handle is resolved so we know its Type
        if (h.ensureResolved) await h.ensureResolved();

        if (h.type === constants.TYPE_SEQUENCE && queryObj.$slice && Object.keys(queryObj).length === 1) {
            return await h.reader.slice(queryObj.$slice[0], queryObj.$slice[1]);
        }

        const db = h.db;
        const evaluator = new FilterEvaluator(db);
        const projector = new Projector(evaluator);

        const filter = queryObj.$filter || null;
        const map = queryObj.$map || null;
        const skip = queryObj.$skip || 0;
        const limit = queryObj.$limit || Infinity;

        const results = [];
        let skipped = 0;
        let counted = 0;

        // B"H: Use custom iteration to yield LiveHandles for Graph/Relational queries
        let iterator;
        if (h.type === constants.TYPE_SEQUENCE) {
             // B"H: Fix - Use reader.length() as 'h' is the internal target, not the Proxy
             const len = await h.reader.length();
             iterator = (async function*() {
                 for(let i=0; i<len; i++) {
                     yield { handle: h.nav.navigate(i) }; 
                 }
             })();
        } else if (h.type === constants.TYPE_MAP || h.type === constants.TYPE_DICTIONARY) {
             iterator = (async function*() {
                 // B"H: Use reader keys
                 for await (const k of h.reader.keys()) {
                     yield { handle: h.nav.navigate(k) }; 
                 }
             })();
        } else {
             iterator = h.reader.iterator(); 
        }

        for await (let itemWrapper of iterator) {
            // Unwrap if it's our protected handle, otherwise use as is
            let valueToCheck = (itemWrapper && itemWrapper.handle) ? itemWrapper.handle : itemWrapper;
            
            // Legacy check for raw iterator
            if (Array.isArray(valueToCheck) && valueToCheck.length === 2 && (h.type === constants.TYPE_MAP || h.type === constants.TYPE_DICTIONARY)) {
                valueToCheck = valueToCheck[1];
            }

            if (filter) {
                const match = await evaluator.evaluate(valueToCheck, filter);
                if (!match) continue;
            }

            if (skipped < skip) {
                skipped++;
                continue;
            }

            let output = valueToCheck;
            if (map) {
                output = await projector.project(valueToCheck, map);
            } else {
                // Check internal again on output if it is a handle
                const outH = output && output[constants.SYMBOLS.INTERNALS] ? output[constants.SYMBOLS.INTERNALS] : output;
                if (outH && outH.reader) output = await outH.reader.resolveSelf();
            }

            results.push(output);
            counted++;
            if (counted >= limit) break;
        }
        return results;
    }
}
module.exports = AwtsmoosQuery;
