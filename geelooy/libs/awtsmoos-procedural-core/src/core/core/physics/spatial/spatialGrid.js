// B"H
/**
 * @file spatialGrid.js
 * @brief A divine map of existence, allowing particles to find their neighbors
 *        with hyper-efficiency, avoiding the folly of universal query.
 */

export class SpatialGrid {
    constructor(cellSize = 1.0) {
        this.cellSize = cellSize;
        this.inverseCellSize = 1.0 / cellSize;
        this.grid = new Map();
    }

    _hash(x, y, z) {
        // Simple string hash. Fast enough for this purpose.
        return `${x}|${y}|${z}`;
    }

    _getCoords(pos) {
        return [
            Math.floor(pos[0] * this.inverseCellSize),
            Math.floor(pos[1] * this.inverseCellSize),
            Math.floor(pos[2] * this.inverseCellSize)
        ];
    }

    clear() {
        this.grid.clear();
    }

    add(particle) {
        const coords = this._getCoords(particle.pos);
        const hash = this._hash(coords[0], coords[1], coords[2]);
        if (!this.grid.has(hash)) {
            this.grid.set(hash, []);
        }
        this.grid.get(hash).push(particle);
    }

    build(particles) {
        this.clear();
        for (const p of particles) {
            this.add(p);
        }
    }

    getNeighbors(particle) {
        const neighbors = [];
        const [cx, cy, cz] = this._getCoords(particle.pos);

        // Check the 3x3x3 cube of cells around the particle's cell
        for (let z = -1; z <= 1; z++) {
            for (let y = -1; y <= 1; y++) {
                for (let x = -1; x <= 1; x++) {
                    const hash = this._hash(cx + x, cy + y, cz + z);
                    if (this.grid.has(hash)) {
                        neighbors.push(...this.grid.get(hash));
                    }
                }
            }
        }
        return neighbors;
    }
}