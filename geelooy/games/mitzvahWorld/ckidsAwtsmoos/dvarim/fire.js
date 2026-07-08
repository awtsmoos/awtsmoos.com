//B"H
/**
 * B"H
 * @file fire.js
 * A procedural fire entity - SAFE MODE
 */
import Domem from "../chayim/domem.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1";
import * as THREE from '/games/scripts/build/three.module.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1';

export default class Fire extends Domem {
    type = "fire";
    constructor(op, olam) { super(op, olam); this.heesHawveh = true; this.baseIntensity = op.intensity || 1.5; }
    async heescheel(olam) {
        this.olam = olam;
        // B"H SAFE MODE: Standard Material
        const mat = new THREE.MeshBasicMaterial({ 
            color: 0xff6600, 
            transparent: true, 
            opacity: 0.6,
            side: THREE.DoubleSide, 
            depthWrite: false 
        });
        
        const p1 = new THREE.Mesh(new THREE.PlaneGeometry(1, 2), mat);
        const p2 = p1.clone(); p2.rotation.y = Math.PI / 2;
        this.mesh = new THREE.Group(); this.mesh.add(p1, p2);
        this.light = new THREE.PointLight(0xff6600, this.baseIntensity, 10); this.light.position.y = 0.5; this.mesh.add(this.light);
        if(this.position) this.mesh.position.copy(this.position.vector3());
        await olam.hoyseef(this); this.isReady = true;
    }
    heesHawvoos(dt) {
        const t = Date.now() / 1000;
        this.light.intensity = this.baseIntensity + Math.sin(t * 10) * 0.2 + (Math.random() - 0.5) * 0.1;
        // Simple scale flicker
        const s = 1.0 + Math.random() * 0.2;
        this.mesh.scale.set(s,s,s);
    }
}