
// B"H
/**
 * @file index.js (Path)
 * @chapter The Tracing of the Lineage
 * @description
 * Determines the string path of a Handle from the Root.
 */

const HandleRegistry = require('../../../../core/registry/handle.js');

class PathResolver {
    /**
     * @method getPath
     * @description Traces the lineage of the soul back to the Root.
     */
    static getPath(state) {
        const parts =[];
        let curr = state.context;
        
        while (curr) {
            parts.unshift(String(curr.key));
            const pSoul = HandleRegistry.getSoul(curr.parent);
            curr = pSoul ? pSoul.context : null;
        }
        
        return parts.length > 0 ? parts.join('.') : 'root';
    }
}

module.exports = PathResolver;
