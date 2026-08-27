
// B"H
/**
 * @file treeContext.js
 * @brief Holds the mutable state for a single tree generation process.
 */

class RNG {
    constructor(seed) {
        this.s = seed;
    }
    rand() {
        this.s = (this.s * 9301 + 49297) % 233280;
        return this.s / 233280;
    }
    range(min, max) {
        return min + this.rand() * (max - min);
    }
}

export class TreeContext {
    constructor(options) {
        this.options = options;
        this.rng = new RNG(options.seed || 123);
        
        // Geometry Buffers
        this.verts = [];
        this.norms = [];
        this.uvs = [];
        this.inds = [];
        
        this.leafVerts = [];
        this.leafNorms = [];
        this.leafUVs = [];
        this.leafInds = [];
        this.leafColors = []; // B"H - Added for tinting
        
        this.indexOffset = 0;
        this.leafOffset = 0;
    }

    getParam(name, level, def) {
        const p = this.options.branch[name];
        if (p === undefined) return def;
        if (Array.isArray(p) || typeof p === 'object') return p[level] !== undefined ? p[level] : def;
        return p;
    }
}
