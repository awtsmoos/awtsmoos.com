
// B"H
const FilterEvaluator = require('./evaluator.js');
const Projector = require('./projector.js');
const constants = require('../../constants.js');

class AwtsmoosQuery {
    static async execute(handle, queryObj) {
        if (!queryObj) return handle;
        if (queryObj === true) return await handle.reader.resolveSelf();

        // B"H: Ensure handle is resolved so we know its Type
        if (handle.ensureResolved) await handle.ensureResolved();

        if (handle.type === constants.TYPE_SEQUENCE && queryObj.$slice && Object.keys(queryObj).length === 1) {
            return await handle.reader.slice(queryObj.$slice[0], queryObj.$slice[1]);
        }

        const db = handle.db;
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
        // WRAPPER FIX: Yield { handle: h } to prevent 'for await' from resolving the Thenable LiveHandle
        let iterator;
        if (handle.type === constants.TYPE_SEQUENCE) {
             const len = await handle.length;
             iterator = (async function*() {
                 for(let i=0; i<len; i++) {
                     yield { handle: handle.get(i) }; 
                 }
             })();
        } else if (handle.type === constants.TYPE_MAP || handle.type === constants.TYPE_DICTIONARY) {
             iterator = (async function*() {
                 const keys = await handle.keys(); 
                 for await (const k of keys) {
                     yield { handle: handle.get(k) }; 
                 }
             })();
        } else {
             // Reader iterator usually returns values or {key, value}. 
             // If we need graph ops on these, we might need a different approach,
             // but for now we follow standard reader behavior.
             iterator = handle.reader.iterator(); 
        }

        for await (let itemWrapper of iterator) {
            // Unwrap if it's our protected handle, otherwise use as is
            let valueToCheck = (itemWrapper && itemWrapper.handle) ? itemWrapper.handle : itemWrapper;
            
            // Legacy check for raw iterator
            if (Array.isArray(valueToCheck) && valueToCheck.length === 2 && (handle.type === constants.TYPE_MAP || handle.type === constants.TYPE_DICTIONARY)) {
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
                if (output && output.reader) output = await output.reader.resolveSelf();
            }

            results.push(output);
            counted++;
            if (counted >= limit) break;
        }
        return results;
    }
}
module.exports = AwtsmoosQuery;