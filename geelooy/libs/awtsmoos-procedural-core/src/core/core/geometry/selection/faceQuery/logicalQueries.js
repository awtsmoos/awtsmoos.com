
// B"H
/**
 * @file logicalQueries.js
 * @chapter THE PILLARS OF GEVURAH
 * 
 * THE SHIELD OF SEPARATION:
 * To intersect, to union, to violently negate,
 * These are the actions of the restrictive gate!
 * We map the arrays, we reduce them to dust,
 * Forming boolean logic in which we trust!
 * 
 * @module LogicalQueries
 */

export const LOGICAL_QUERIES = Object.freeze({
    'inverse': (mesh, params, allIndices, ctx) => {
        const toInvert = ctx.executeQuery(mesh, params, allIndices, ctx);
        return new Set(Array.from(allIndices).filter(i => !toInvert.has(i)));
    },

    'and': (mesh, params, allIndices, ctx) => new Set(
        params.reduce((acc, subQ) => {
            const subRes = ctx.executeQuery(mesh, subQ, allIndices, ctx);
            return acc.filter(i => subRes.has(i));
        }, Array.from(allIndices))
    ),

    'or': (mesh, params, allIndices, ctx) => new Set(
        params.reduce((acc, subQ) => {
            return acc.concat(Array.from(ctx.executeQuery(mesh, subQ, allIndices, ctx)));
        }, [])
    )
});
