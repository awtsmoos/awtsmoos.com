//B"H
/**
 * B"H
 * @file forest.js
 */
import Domem from "../../chayim/domem.js";
import * as THREE from '/games/scripts/build/three.module.js';

export default class Forest extends Domem {
    constructor(op, olam) { super(op, olam); this.bounds = op.bounds || { x: 0, z: 0, width: 50, depth: 50 }; this.density = op.density || 0.5; this.treeType = op.treeType || "Oak Medium"; }
    async heescheel(olam) {
        this.olam = olam; const count = Math.floor(this.bounds.width * this.bounds.depth * this.density * 0.01);
        for(let i=0; i<count; i++) {
            const x = this.bounds.x + (Math.random() - 0.5) * this.bounds.width, z = this.bounds.z + (Math.random() - 0.5) * this.bounds.depth;
            await this.olam.addObject("ProceduralTree", { name: `tree_${this.name}_${i}`, preset: this.treeType, position: { x, y: 0, z }, isSolid: true });
            if(i%5 === 0) await new Promise(r => setTimeout(r, 10));
        }
        this.isReady = true;
    }
}