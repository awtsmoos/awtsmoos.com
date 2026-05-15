
// B"H
/**
 * @file tree.js
 * @brief The root of spatial knowledge. A BSP Tree implementation.
 */
import { Node } from './node.js';

export class Tree {
    constructor(polygons) {
        this.rootnode = new Node();
        if (polygons) this.build(polygons);
    }

    build(polygons) {
        this.rootnode.build(polygons);
    }

    /**
     * B"H - Clips a list of polygons against this tree.
     * Modifies the input array in-place.
     * @param {Array} polygons - The polygons to clip.
     * @param {boolean} keepInside - If true, keep parts inside the tree. If false, keep parts outside.
     */
    clipPolygons(polygons, keepInside) {
        const result = [];
        for (let i = 0; i < polygons.length; i++) {
            this.rootnode.clipTo(polygons[i], keepInside, result);
        }
        // Replace contents
        polygons.length = 0;
        polygons.push(...result);
    }
}
