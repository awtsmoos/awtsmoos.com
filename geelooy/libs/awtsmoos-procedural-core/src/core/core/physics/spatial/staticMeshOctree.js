
// B"H
/**
 * @file staticMeshOctree.js
 * @brief Spatial partitioner for high-poly world geometry.
 * 
 * THE HYMN OF THE EIGHT-FOLD DIVISION:
 * One world into eight, the space is defined,
 * Through branches of logic, the targets we find.
 * No triangle is hidden, no corner is lost,
 * We calculate safety, whatever the cost.
 * From the root that is massive, to the leaf that is small,
 * The Octree of Life watches over them all.
 */
import { Vec3 } from '../../math/vec3.js';
import { PhysicsTriangle } from './triangle.js';
import { AABB } from './bounds.js';

class OctreeNode {
    constructor(bounds, depth) {
        this.bounds = bounds; // AABB
        this.depth = depth;
        this.children = null; 
        this.triangleIndices = []; 
    }
}

export class StaticMeshOctree {
    /**
     * @param {Float32Array} positions - World positions.
     * @param {Uint16Array|Uint32Array} indices - Triangle indices.
     */
    constructor(positions, indices, maxTrisPerNode = 16, maxDepth = 12) {
        this.positions = positions;
        this.indices = indices;
        this.maxTris = maxTrisPerNode;
        this.maxDepth = maxDepth;
        
        this.root = null;
        this.triangles = []; // Actual PhysicsTriangle objects
        
        this._buildMasterTriangles();
        this.build();
    }

    _buildMasterTriangles() {
        console.log(`B"H - Octree: Weaving ${this.indices.length / 3} triangles into the spirit...`);
        for (let i = 0; i < this.indices.length; i += 3) {
            const i0 = this.indices[i] * 3;
            const i1 = this.indices[i+1] * 3;
            const i2 = this.indices[i+2] * 3;
            
            const a = [this.positions[i0], this.positions[i0+1], this.positions[i0+2]];
            const b = [this.positions[i1], this.positions[i1+1], this.positions[i1+2]];
            const c = [this.positions[i2], this.positions[i2+1], this.positions[i2+2]];
            
            this.triangles.push(new PhysicsTriangle(a, b, c));
        }
    }

    build() {
        const bounds = new AABB();
        for (let i = 0; i < this.positions.length; i += 3) {
            bounds.expandByPoint([this.positions[i], this.positions[i+1], this.positions[i+2]]);
        }
        
        // Add a small safety buffer to the world box
        const pad = 0.5;
        bounds.min = Vec3.sub(bounds.min, [pad, pad, pad]);
        bounds.max = Vec3.add(bounds.max, [pad, pad, pad]);

        this.root = new OctreeNode(bounds, 0);
        const allIndices = Array.from({length: this.triangles.length}, (_, i) => i);
        
        this._split(this.root, allIndices);
        console.log(`B"H - Octree Build Complete. Depth: ${this._getActualDepth(this.root)}`);
    }

    _split(node, indices) {
        if (indices.length <= this.maxTris || node.depth >= this.maxDepth) {
            node.triangleIndices = indices;
            return;
        }

        const min = node.bounds.min;
        const max = node.bounds.max;
        const mid = Vec3.scale(Vec3.add(min, max), 0.5);

        // 8 Child Boxes
        const boxes = [];
        for (let i = 0; i < 8; i++) {
            const bMin = [(i & 1) ? mid[0] : min[0], (i & 2) ? mid[1] : min[1], (i & 4) ? mid[2] : min[2]];
            const bMax = [(i & 1) ? max[0] : mid[0], (i & 2) ? max[1] : mid[1], (i & 4) ? max[2] : mid[2]];
            boxes.push(new AABB(bMin, bMax));
        }

        node.children = boxes.map(b => new OctreeNode(b, node.depth + 1));
        const bins = Array.from({length: 8}, () => []);

        indices.forEach(idx => {
            const tri = this.triangles[idx];
            for (let i = 0; i < 8; i++) {
                if (node.children[i].bounds.intersectsTriangle(tri.a, tri.b, tri.c)) {
                    bins[i].push(idx);
                }
            }
        });

        for (let i = 0; i < 8; i++) {
            if (bins[i].length > 0) {
                this._split(node.children[i], bins[i]);
            } else {
                node.children[i] = null; // Prune empty branches
            }
        }
    }

    _getActualDepth(node) {
        if (!node || !node.children) return node ? node.depth : 0;
        return Math.max(...node.children.map(c => this._getActualDepth(c)));
    }

    getVertex(idx) {
        const i3 = idx * 3;
        return [this.positions[i3], this.positions[i3+1], this.positions[i3+2]];
    }

    querySphere(center, radius, result = []) {
        this._queryRecursive(this.root, center, radius, result);
        return result;
    }

    _queryRecursive(node, center, radius, result) {
        if (!node || !node.bounds.intersectsSphere(center, radius)) return;

        if (node.children) {
            for (const child of node.children) {
                if (child) this._queryRecursive(child, center, radius, result);
            }
        } else {
            node.triangleIndices.forEach(idx => {
                if (!result.includes(idx)) result.push(idx);
            });
        }
    }

    raycast(origin, dir) {
        let closestT = Infinity;
        let hit = null;
        
        const candidates = [];
        this._queryRay(this.root, origin, dir, candidates);

        for (const idx of candidates) {
            const tri = this.triangles[idx];
            const t = this._rayTriangleIntersect(origin, dir, tri);
            if (t !== null && t < closestT) {
                closestT = t;
                hit = {
                    distance: t,
                    point: Vec3.add(origin, Vec3.scale(dir, t)),
                    normal: tri.normal,
                    triangleIndex: idx
                };
            }
        }
        return hit;
    }

    _queryRay(node, origin, dir, result) {
        if (!node || !node.bounds.intersectsRay(origin, dir)) return;
        if (node.children) {
            for (const child of node.children) {
                if (child) this._queryRay(child, origin, dir, result);
            }
        } else {
            node.triangleIndices.forEach(idx => {
                if (!result.includes(idx)) result.push(idx);
            });
        }
    }

    _rayTriangleIntersect(origin, dir, tri) {
        const EPSILON = 0.0000001;
        const edge1 = Vec3.sub(tri.b, tri.a);
        const edge2 = Vec3.sub(tri.c, tri.a);
        const h = Vec3.cross(dir, edge2);
        const a = Vec3.dot(edge1, h);
        if (a > -EPSILON && a < EPSILON) return null;
        const f = 1.0 / a;
        const s = Vec3.sub(origin, tri.a);
        const u = f * Vec3.dot(s, h);
        if (u < 0.0 || u > 1.0) return null;
        const q = Vec3.cross(s, edge1);
        const v = f * Vec3.dot(dir, q);
        if (v < 0.0 || u + v > 1.0) return null;
        const t = f * Vec3.dot(edge2, q);
        return (t > EPSILON) ? t : null;
    }
}
