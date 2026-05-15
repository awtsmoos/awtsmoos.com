
// B"H
/**
 * @file executor.js
 * @chapter THE OMNISCIENT OBSERVER
 * 
 * THE PSALM OF THE AUDITED ACTION:
 * Nothing is hidden from the Eye of the System!
 * We record every query, every find, and every void,
 * ensuring the Seder Hishtalshelus remains un-destroyed!
 */

import { FACE_QUERY_REGISTRY } from './registry.js';
import { route, dispatch } from '../../../utils/router.js';
import { ensureVessel } from './setMath.js';

export const executeQuery = (mesh, queryObj, allIndices, ctx) => {
    const isObj = typeof queryObj === 'object' && queryObj !== null;
    const isStr = typeof queryObj === 'string';
    
    const type = route(isObj, {
        'true': () => Object.keys(queryObj)[0] || 'none',
        'false': () => route(isStr, {
            'true': () => 'tag', 
            'false': () => 'none'
        })
    });
    
    const params = route(isObj, {
        'true': () => queryObj[type],
        'false': () => route(isStr, {
            'true': () => queryObj,
            'false': () => null
        })
    });

    const handler = dispatch(type, FACE_QUERY_REGISTRY, 'none');
    
    try {
        const result = ensureVessel(handler(mesh, params, allIndices, ctx));
        
        // B"H - THE ETERNAL WITNESS
        if (result.size === 0) {
            console.warn(`B"H - 🕯️ [Query::${type}] failed to manifest any sparks for:`, params);
            
            // If it's a tag check, shout the available tags!
            if (type === 'tag') {
                const tags = new Set();
                mesh.faces.forEach(f => (f.tags || []).forEach(t => tags.add(t)));
                console.log(`      -> Existing labels in this vessel: [${Array.from(tags).join(', ')}]`);
            }
        } else {
            console.log(`B"H - ✨ [Query::${type}] revealed ${result.size} matching sparks.`);
        }
        
        return result;
    } catch (e) {
        console.error(`B"H - 🚨 [Query::${type}] SHATTERED during emanation:`, e);
        return new Set();
    }
};
