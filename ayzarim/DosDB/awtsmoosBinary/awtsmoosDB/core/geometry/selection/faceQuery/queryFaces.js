
// B"H
/**
 * @file queryFaces.js
 * @brief The Master Loop of Face Selection, armed with extreme diagnostic logging.
 */

import { Vec3 } from '../../../math/vec3.js';
import { FaceAdjacency } from '../faceAdjacency.js';
import { getFaceCentroid, getFaceNormal } from './utils.js';
import { executeQuery } from './executor.js';
import { FACE_QUERY_REGISTRY } from './registry.js';

let _adjacencyCache = null;
let _meshCache = null;

function getFaceAdjacency(mesh) {
    if (_meshCache === mesh && _adjacencyCache) return _adjacencyCache;
    _adjacencyCache = new FaceAdjacency(mesh);
    _meshCache = mesh;
    return _adjacencyCache;
}

export function queryFaces(mesh, queryOpts) {
    if (!mesh || !mesh.faces) return [];
    
    // Suppress warnings for deliberately empty logic meshes (like Ocean or Grass)
    if (mesh.faces.length === 0) return []; 

    if (!queryOpts) return [];
    if (Array.isArray(queryOpts)) return queryOpts; 

    const allIndices = new Set(Array.from({ length: mesh.faces.length }, (_, i) => i));
    const ctx = { getAdjacency: getFaceAdjacency, executeQuery: executeQuery, objectData: mesh.__objectData };

    const keys = Object.keys(queryOpts);
    
    // 1. Pure Registry Query (Direct Hit)
    if (keys.length === 1 && FACE_QUERY_REGISTRY[keys[0]]) {
        const result = Array.from(executeQuery(mesh, queryOpts, allIndices, ctx));
        if (result.length === 0) {
            console.warn(`B"H - 🚨 QUERY YIELDED VOID: The spell ${JSON.stringify(queryOpts)} found 0 faces out of ${mesh.faces.length} in [${mesh.__objectData?.id || 'Unknown'}].`);
        }
        return result;
    }

    // 2. THE TIKKUN OF TRANSLATION: Legacy multi-key (implicit AND) 
    const subQueries = [];
    if (queryOpts.tag) subQueries.push({ tag: queryOpts.tag });
    if (queryOpts.box) subQueries.push({ box: queryOpts.box });
    if (queryOpts.normalDot) subQueries.push({ normalDot: { dir: queryOpts.normalDot, threshold: queryOpts.normalThreshold || 0.9 } });
    
    let resultSet = allIndices;
    
    for (const sq of subQueries) {
        const preSize = resultSet.size;
        resultSet = executeQuery(mesh, sq, resultSet, ctx);
        
        if (resultSet.size === 0) {
            console.error(`B"H - 🚨 THE HEAVENS WEPT in [${mesh.__objectData?.id || 'Unknown'}]! Query filtration failed completely!`);
            console.error(`      -> Failed at step: ${JSON.stringify(sq)}`);
            console.error(`      -> Previous face count: ${preSize}`);
            
            if (sq.normalDot) {
                console.error(`      -> 👁️ DIAGNOSTIC: You sought normal matching [${sq.normalDot.dir}].`);
                let samples = [];
                let i = 0;
                for (const idx of allIndices) {
                    if (i++ > 5) break;
                    samples.push(getFaceNormal(mesh.faces[idx]).map(n=>n.toFixed(2)).join(','));
                }
                console.error(`      -> Sample mesh normals: [${samples.join(' | ')}]`);
            }
            return []; 
        }
    }

    if (queryOpts.closestTo || queryOpts.count) {
        const count = queryOpts.count !== undefined ? queryOpts.count : resultSet.size;
        const to = queryOpts.closestTo || [0,0,0];
        
        const arr = Array.from(resultSet).map(idx => ({
            idx, dist: Vec3.distSq(getFaceCentroid(mesh.faces[idx]), to)
        }));
        
        if (queryOpts.closestTo) {
            arr.sort((a,b) => a.dist - b.dist);
        }
        
        const finalArr = arr.slice(0, count).map(x => x.idx);
        
        if (finalArr.length === 0) {
            console.warn(`B"H - 🚨 QUERY YIELDED VOID after sorting closestTo [${to}].`);
        }
        
        return finalArr;
    }

    return Array.from(resultSet);
}
