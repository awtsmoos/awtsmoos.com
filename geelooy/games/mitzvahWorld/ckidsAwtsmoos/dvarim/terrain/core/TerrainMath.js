
/**
 * B"H
 * @module TerrainMath
 * @description
 * 📐 THE LAWS OF ELEVATION 📐
 * 
 * A pure algorithmic representation of the earth's surface.
 * By placing this logic in a standalone module, we can mathematically project 
 * Roads and Fences onto the terrain with O(1) complexity, absolutely bypassing 
 * the need for expensive Octree raycasting during world generation!
 */

export default class TerrainMath {
    /**
     * @function calculateHeightAt
     * @description 
     * Determines the exact elevation of the terrain at a given X/Z coordinate 
     * based on the array of Hill instructions.
     * 
     * @param {number} x - The world X coordinate.
     * @param {number} z - The world Z coordinate.
     * @param {Array} hills - The JSON array of hill blueprints.
     * @returns {number} The calculated Y elevation.
     */
    static calculateHeightAt(x, z, hills) {
        if (!hills || hills.length === 0) return 0;
        
        let totalHeight = 0;
        for (const hill of hills) {
            const dx = x - (hill.x || 0);
            const dz = z - (hill.z || 0);
            const dist = Math.sqrt(dx * dx + dz * dz);
            
            if (dist < (hill.radius || 50)) {
                // B"H: The Smoothstep Cosine Curve of Creation
                const influence = (1 + Math.cos((Math.PI * dist) / hill.radius)) / 2;
                totalHeight += influence * (hill.height || 10);
            }
        }
        return totalHeight;
    }
}
