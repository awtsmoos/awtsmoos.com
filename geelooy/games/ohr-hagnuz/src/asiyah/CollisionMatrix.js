
import { WorldMapAssembler } from '../data/WorldMapAssembler.js';

/**
 * B"H
 * @class CollisionMatrix
 * @chapter The Wall of Judgment (Gevurah)
 * @description
 * In the realm of Action (Asiyah), boundaries exist to define form. 
 * This class validates whether the soul's kinetic intention aligns with 
 * the physical constraints of the grid.
 */
export class CollisionMatrix {
    /**
     * @description Checks if a grid coordinate is traversable.
     */
    static canStep(tx, ty) {
        const MAX_W = 25; const MAX_H = 14;

        // If stepping off the map, we only permit it IF there is no physical grid tile,
        // suggesting it's an abyss road. But typically we use Edge Portals.
        if (tx < 0 || tx >= MAX_W || ty < 0 || ty >= MAX_H) return false;

        const tile = WorldMapAssembler.WorldRegistry.find(t => t.x === tx && t.y === ty);
        
        if (!tile) return true; // Open space in the void
        
        // Solid objects block the path
        if (tile.solid) return false;

        return true;
    }
}
