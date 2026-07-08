//B"H
import CollectableItem from "./collectableItem.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1";
import * as THREE from '/games/scripts/build/three.module.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1';

export default class Fruit extends CollectableItem {
    constructor(op) {
        if(!op.golem) op.golem = { guf: { IcosahedronGeometry: [0.15, 1] }, toyr: { MeshStandardMaterial: { color: op.color || 0xff0000, roughness: 0.4 } } };
        super(op); this.velocity = new THREE.Vector3(); this.falling = false;
    }
    drop() { this.falling = true; this.velocity.set((Math.random()-0.5)*2, 0, (Math.random()-0.5)*2); this.heesHawveh = true; }
    heesHawvoos(dt) {
        super.heesHawvoos(dt);
        if(this.falling && this.mesh) {
            this.velocity.y -= 20 * dt; this.mesh.position.addScaledVector(this.velocity, dt);
            if(this.mesh.position.y <= 0.2) { this.mesh.position.y = 0.2; this.velocity.set(0,0,0); this.falling = false; }
        }
    }
}