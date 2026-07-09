//B"H
/**
 * Wheat - Grows stages, harvested for flour.
 */
import Tzomayach from "../../chayim/tzomayach.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1";
import * as THREE from "/games/mitzvahWorld/systems/three/AwtsmoosThreeGateway.js";

export default class Wheat extends Tzomayach {
    constructor(op, olam) {
        super(op, olam);
        this.growth = 0; // 0 to 1
        this.heesHawveh = true;
    }

    async heescheel(olam) {
        await super.heescheel(olam);
        this.mesh.scale.set(0.1, 0.1, 0.1);
    }

    heesHawvoos(dt) {
        if (this.growth < 1.0) {
            this.growth += dt * 0.05;
            const s = 0.1 + this.growth * 1.5;
            this.mesh.scale.set(s, s, s);
            
            // Color shift from green to gold
            if (this.mesh.children[0].material) {
                const color = new THREE.Color(0x228B22).lerp(new THREE.Color(0xFFD700), this.growth);
                this.mesh.children[0].material.color.copy(color);
            }
        } else {
            this.interactable = true;
            this.proximity = 1.0;
        }
    }
}