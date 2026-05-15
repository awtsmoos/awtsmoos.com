
// B"H
/**
 * @file vertexQuery.js
 * @brief A powerful engine for selecting vertices based on spatial and logical properties.
 *        Now utilizing a pure, switch-free data registry, reflecting the divine Seder Hishtalshelus.
 * 
 * THE TOME OF THE UNIFIED SELECTION:
 * All matter everywhere is constantly being refreshed and recreated every instant 
 * from the Speech of the Creator. Thus, our vertex selection system now honors this divine order. 
 * No longer entangled in chaotic switch statements, it draws from a pure map of existence (the Registry),
 * allowing the Awtsmoos to expand the logic infinitely without breaking the vessel.
 */
import { VertexWelder } from '../utils/vertexWelder.js';
import { MeshAdjacency } from './adjacency.js';
import { QUERY_REGISTRY } from './queries/index.js';

let adjacencyCache = null;
let meshCache = null;

function getAdjacency(mesh) {
    if (meshCache === mesh && adjacencyCache) {
        return adjacencyCache;
    }
    adjacencyCache = new MeshAdjacency(mesh);
    meshCache = mesh;
    return adjacencyCache;
}

/**
 * B"H - Dispatches a single query object to the appropriate handler in the registry.
 * @param {object} mesh The mesh to query.
 * @param {object} query The query object.
 * @param {Set<object>} allVertices A set of all unique vertices in the mesh.
 * @returns {Set<object>} A set of matching vertices.
 */
export function handleSingleQuery(mesh, query, allVertices) {
    const key = Object.keys(query)[0];
    const params = query[key];
    
    const handler = QUERY_REGISTRY[key];
    
    if (handler) {
        // We pass a context object allowing recursive and topological queries,
        // and embed the objectData to allow Semantic queries to access exported points.
        const context = { handleQuery: handleSingleQuery, getAdjacency, objectData: mesh.__objectData };
        return handler(mesh, params, allVertices, context);
    } else {
        console.warn(`B"H - VertexQuery: Unknown query type '${key}'. The letters have departed.`);
        return new Set();
    }
}

/**
 * B"H - The Grand Sieve of Vertices.
 * Filters the unique vertices of a mesh based on a query or an array of queries (OR).
 * @param {object} mesh - The structured mesh to query.
 * @param {object|Array<object>} queryOptions - A single query object or an array of them.
 * @returns {Set<object>} A Set containing the unique vertex objects that match the query.
 */
export function queryVertices(mesh, queryOptions) {
    if (!mesh || !mesh.faces) return new Set();

    const weldedMap = VertexWelder.getWeldedMap(mesh);
    const allVertices = new Set();
    weldedMap.forEach(group => allVertices.add(Array.from(group)[0]));

    if (!queryOptions) return allVertices;
    const queries = Array.isArray(queryOptions) ? queryOptions : [queryOptions];
    if (queries.length === 0) return allVertices;

    const finalResult = new Set();
    queries.forEach(query => {
        const resultSet = handleSingleQuery(mesh, query, allVertices);
        resultSet.forEach(v => finalResult.add(v));
    });

    return finalResult;
}
