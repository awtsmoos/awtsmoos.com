/**
 * B"H
 * @module SolidBlock
 * @description
 * 🧱 A SOLID FOUNDATION 🧱
 * 
 * Simple solid block for building and debugging.
 * "A stone which the builders rejected has become the chief cornerstone." (Tehillim 118:22)
 */
import Domem from "../../chayim/domem/index.js";
import * as THREE from '/games/scripts/build/three.module.js';

export default class SolidBlock extends Domem {
    type = "solidBlock";

    constructor(op, olam) {
        super(op, olam);
        this.width = op.width || 1;
        this.height = op.height || 1;
        this.depth = op.depth || 1;
        this.color = op.color || 0x808080;
    }

    async heescheel(olam) {
        this.olam = olam;
        const label = `[SolidBlock: ${this.name}]`;
        
        const geometry = new THREE.BoxGeometry(this.width, this.height, this.depth);
        
        // B"H: ONLY LAMBERT AS REQUESTED
        const material = new THREE.MeshLambertMaterial({ 
            color: this.color 
        });
        
        // B"H: silent


        this.mesh = new THREE.Mesh(geometry, material);
        this.mesh.name = this.name;
        this.mesh.nivraAwtsmoos = this;
        this.mesh.visible = true;
        this.mesh.frustumCulled = false;

        if (this.position) {
            this.mesh.position.set(
                this.position.x || 0,
                this.position.y || 0,
                this.position.z || 0
            );
        }

        // Ensure physical presence
        this.mesh.updateMatrixWorld(true);
        this.mesh.userData.isSolid = true;

        await olam.hoyseef(this);
        
        if (olam.worldOctree) {
            olam.worldOctree.addObject(this.mesh);
        }
        
        this.isReady = true;
        // B"H: silent

    }
}
