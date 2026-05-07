
import { WorldMapAssembler } from '../data/WorldMapAssembler.js';

/**
 * B"H
 * @class Pathfinder
 * @chapter The Hashgacha Pratis (Divine Providence)
 * @description
 * "The steps of man are established by G-d" (Psalms 37:23).
 * When the soul expresses a desire to reach a destination (by clicking),
 * the Pathfinder sends out spiritual beams of light (Breadth-First Search) 
 * to discover the perfect, unobstructed path through the grid of Asiyah.
 * 
 * It avoids the Klipot (solid objects) and returns a sequence of 
 * coordinates for the physical body to follow.
 */
export class Pathfinder {
    /**
     * @description Calculates the shortest path between two points.
     * @param {number} startX - Origin column
     * @param {number} startY - Origin row
     * @param {number} targetX - Destination column
     * @param {number} targetY - Destination row
     * @returns {Array<{x: number, y: number}>|null} The path array, or null if blocked.
     */
    static findPath(startX, startY, targetX, targetY) {
        const registry = WorldMapAssembler.WorldRegistry;
        
        // Construct a rapid-access grid from the physical registry
        const grid = {};
        registry.forEach(n => {
            if (!grid[n.y]) grid[n.y] = {};
            grid[n.y][n.x] = n;
        });

        const targetNode = grid[targetY]?.[targetX];
        // If the target is in the void or is a solid barrier, the path is instantly denied.
        if (!targetNode || targetNode.solid) {
            return null; 
        }

        const queue = [{ x: startX, y: startY, path: [] }];
        const visited = new Set([`${startX},${startY}`]);

        // The four directions of expansion
        const dirs = [
            { dx: 0, dy: -1 }, // Up
            { dx: 0, dy: 1 },  // Down
            { dx: -1, dy: 0 }, // Left
            { dx: 1, dy: 0 }   // Right
        ];

        while (queue.length > 0) {
            const current = queue.shift();

            // Destination reached
            if (current.x === targetX && current.y === targetY) {
                return current.path;
            }

            // Emanate outwards
            for (let d of dirs) {
                const nx = current.x + d.dx;
                const ny = current.y + d.dy;
                const key = `${nx},${ny}`;

                if (!visited.has(key)) {
                    visited.add(key);
                    const node = grid[ny]?.[nx];
                    
                    // Proceed only if the node exists and is not solid
                    if (node && !node.solid) {
                        queue.push({
                            x: nx, 
                            y: ny, 
                            path: [...current.path, { x: nx, y: ny }]
                        });
                    }
                }
            }
            
            // Tzimtzum (Contraction Limit) - prevent infinite loops in massive voids
            if (visited.size > 800) break;
        }

        return null; // The path is completely obscured
    }
}
