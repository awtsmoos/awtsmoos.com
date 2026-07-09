
// B"H
import Vehicle from "./vehicle.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1";
import * as THREE from "/games/mitzvahWorld/systems/three/AwtsmoosThreeGateway.js";

export default class Hoverboard extends Vehicle {
    type = "hoverboard";
    static itemName = "Hoverboard";
    static description = "Levitate over obstacles.";
    
    constructor(op, olam) {
        super(op, olam);
        this.maxSpeed = 35;
        this.hoverHeight = 1.0;
        this.seatOffset.set(0, 0.5, 0);
    }

    async heescheel(olam) {
        this.olam = olam;
        
        const boardGeo = new THREE.BoxGeometry(0.8, 0.1, 2.0);
        const boardMat = new THREE.MeshStandardMaterial({ 
            color: 0x00ffff, 
            emissive: 0x0044ff, 
            roughness: 0.2,
            metalness: 0.8 
        });
        
        const mesh = new THREE.Mesh(boardGeo, boardMat);
        
        // Add Glow Pads
        const padGeo = new THREE.CylinderGeometry(0.2, 0.2, 0.05, 16);
        const padMat = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
        
        const p1 = new THREE.Mesh(padGeo, padMat);
        p1.position.set(0, -0.05, 0.8);
        mesh.add(p1);
        
        const p2 = new THREE.Mesh(padGeo, padMat);
        p2.position.set(0, -0.05, -0.8);
        mesh.add(p2);
        
        this.mesh = mesh;
        this.mesh.nivraAwtsmoos = this;
        this.mesh.userData.isSolid = true;

        if (this.position) this.mesh.position.copy(this.position.vector3());
        
        await olam.hoyseef(this);
        this.olam.worldOctree.addObject(this.mesh);
        this.isReady = true;
    }

    applyPhysics(dt) {
        // Hover Logic
        const rayOrigin = this.mesh.position.clone();
        const rayDir = new THREE.Vector3(0, -1, 0);
        const ray = new THREE.Ray(rayOrigin, rayDir);
        
        const hit = this.olam.worldOctree.rayIntersect(ray);
        
        if (hit && hit.distance < this.hoverHeight * 2) {
            const dist = hit.distance;
            const delta = this.hoverHeight - dist;
            
            // Spring Force
            if (delta > 0) {
                this.velocity.y += delta * 10 * dt; // Push up
                this.velocity.y *= 0.9; // Dampen
                this.onFloor = true;
            } else {
                this.onFloor = false;
            }
        } else {
            this.velocity.y -= 10 * dt; // Gravity
            this.onFloor = false;
        }

        // Strafing & Forward
        const inputs = this.olam.inputs;
        const forward = new THREE.Vector3(0, 0, 1).applyQuaternion(this.mesh.quaternion);
        const right = new THREE.Vector3(1, 0, 0).applyQuaternion(this.mesh.quaternion);
        
        let moveVec = new THREE.Vector3();
        
        if (inputs.FORWARD) moveVec.add(forward);
        if (inputs.BACKWARD) moveVec.sub(forward);
        
        // Turning
        if (inputs.LEFT_ROTATE) this.rotation.y += 3.0 * dt;
        if (inputs.RIGHT_ROTATE) this.rotation.y -= 3.0 * dt;

        // Visual Tilt
        this.mesh.rotation.z = (inputs.LEFT_ROTATE ? 0.2 : 0) + (inputs.RIGHT_ROTATE ? -0.2 : 0);
        
        moveVec.normalize().multiplyScalar(this.maxSpeed);
        this.velocity.x += (moveVec.x - this.velocity.x) * 2 * dt;
        this.velocity.z += (moveVec.z - this.velocity.z) * 2 * dt;
        
        // Jump
        if (inputs.JUMP && this.onFloor) {
            this.velocity.y = 8;
            this.onFloor = false;
        }
    }
}
