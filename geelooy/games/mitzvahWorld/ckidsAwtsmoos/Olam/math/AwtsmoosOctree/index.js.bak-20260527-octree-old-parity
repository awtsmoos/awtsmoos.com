
// B"H
/**
 * @class Octree
 * @description
 * ╔══════════════════════════════════════════════════════════════════════════════════╗
 * ║  THE AWTSMOOS OCTREE — THE FOUNDATION OF ALL PHYSICAL REALITY                 ║
 * ╚══════════════════════════════════════════════════════════════════════════════════╝
 *
 * @file index.js
 * @memberof AwtsmoosOctree
 */
import { Box3 } from '/games/scripts/build/three.module.js';
import build from './methods/build/index.js';
import intersection from './methods/intersection/index.js';

export class Octree {
    allTriangles;
    worldTrianglesData;
    isBuilt;

    constructor(box, config = {}) {
        this.triangles = [];
        this.box = box || new Box3();
        this.subTrees = [];
        this.allTriangles = [];
        this.isBuilt = false;
        this.dynamicTriangles = [];
        this._isManaged = false;

        this.config = {
            MAX_DEPTH: 5,
            MAX_TRIANGLES_PER_NODE: 32,
            ...config
        };

        Object.keys(build).forEach(methodName => {
            this[methodName] = build[methodName].bind(this);
        });

        Object.keys(intersection).forEach(methodName => {
            this[methodName] = intersection[methodName].bind(this);
        });
    }

    clear() {
        this.allTriangles.length = 0;
        this.worldTrianglesData = null; 
        this.triangles.length = 0;
        this.subTrees.length = 0;
        this.dynamicTriangles.length = 0;
        this.box.makeEmpty();
        this.isBuilt = false;
        this._isManaged = false; 

        return this;
    }
}
