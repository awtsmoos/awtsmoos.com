
// B"H
/**
 * @file node.js
 * @brief A node in the spatial tree of existence.
 */
export class Node {
    constructor(polygons) {
        this.plane = null;
        this.front = null;
        this.back = null;
        this.polygons = [];
        if (polygons) this.build(polygons);
    }

    clone() {
        const node = new Node();
        node.plane = this.plane && this.plane.clone();
        node.front = this.front && this.front.clone();
        node.back = this.back && this.back.clone();
        node.polygons = this.polygons.map(p => p.clone());
        return node;
    }

    build(polygons) {
        if (!polygons.length) return;
        
        if (!this.plane) this.plane = polygons[0].plane.clone();
        
        const front = [], back = [];
        
        for (let i = 0; i < polygons.length; i++) {
            this.plane.splitPolygon(polygons[i], this.polygons, this.polygons, front, back);
        }
        
        if (front.length) {
            if (!this.front) this.front = new Node();
            this.front.build(front);
        }
        
        if (back.length) {
            if (!this.back) this.back = new Node();
            this.back.build(back);
        }
    }

    /**
     * Clips a single polygon against this node's tree.
     * @param {Polygon} polygon - The polygon to clip.
     * @param {boolean} keepInside - True to keep parts inside the volume (Back).
     * @param {Array} outList - Accumulator for resulting polygons.
     */
    clipTo(polygon, keepInside, outList) {
        const front = [], back = [];
        // Split: coplanarFront->front, coplanarBack->back, front->front, back->back
        this.plane.splitPolygon(polygon, front, back, front, back);
        
        if (this.front) {
            front.forEach(p => this.front.clipTo(p, keepInside, outList));
        } else {
            // Front Leaf: "Outside"
            if (!keepInside) outList.push(...front); 
        }
        
        if (this.back) {
            back.forEach(p => this.back.clipTo(p, keepInside, outList));
        } else {
            // Back Leaf: "Inside"
            if (keepInside) outList.push(...back);
        }
    }
}
