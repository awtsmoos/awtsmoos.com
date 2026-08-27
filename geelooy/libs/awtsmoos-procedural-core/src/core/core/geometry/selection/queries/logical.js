
// B"H
/**
 * @file logical.js
 * @brief Set theory aggregators: AND, OR, NOT.
 * 
 * Pure manifestations of the mind's ability to discern and divide (Gevurah).
 */

export const LOGICAL_QUERIES = {
    'and': (mesh, params, allVertices, context) => {
        let andResult = new Set(allVertices);
        params.forEach(subQuery => {
            const subResult = context.handleQuery(mesh, subQuery, allVertices);
            andResult = new Set([...andResult].filter(v => subResult.has(v)));
        });
        return andResult;
    },
    
    'or': (mesh, params, allVertices, context) => {
        const orResult = new Set();
        params.forEach(subQuery => {
            const subResult = context.handleQuery(mesh, subQuery, allVertices);
            subResult.forEach(v => orResult.add(v));
        });
        return orResult;
    },

    'not': (mesh, params, allVertices, context) => {
        const notResult = context.handleQuery(mesh, params, allVertices);
        return new Set([...allVertices].filter(v => !notResult.has(v)));
    }
};
