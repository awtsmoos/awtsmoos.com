
// B"H
/**
 * @file TripleSeal.js
 * @brief THE UNBREAKABLE IDENTIFIER.
 */

import { Dimensions } from './DimensionRegistry.js';

export const TripleSeal = {
    /**
     * @function cast
     * @description Generates a multidimensional fingerprint for any vessel.
     */
    cast(item) {
        if (!item) return `void::${Date.now()}`;
        
        const dim = (item.originalType ?? item.type ?? Dimensions.VIRTUAL).toLowerCase();
        const world = String(item.workspaceId ?? item.id ?? 'prime');
        let path = (item.path ?? '/').replace(/\\/g, '/');

        if (path !== '/' && path.endsWith('/')) path = path.slice(0, -1);

        // B"H - The Triple Seal: [Dimension]::[World]::[Path]
        return `${dim}::${world}::${path}`;
    }
};
