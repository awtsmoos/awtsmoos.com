// B"H
import Vehicle from "./vehicle.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1";
import * as THREE from '/games/scripts/build/three.module.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1';

export default class CloudMount extends Vehicle {
    type = "cloudMount";
    static itemName = "Cloud of Glory";
    static description = "Fly through the heavens.";
    
    constructor(op, olam) {
        super(op, olam);
        this.maxSpeed = 40;
        this.seatOffset.set(0, 1.0, 0);
    }

    async heescheel(olam) {
        this.olam = olam;
        
        // Puffball Geometry
        const group = new THREE.Group();
        const mat = new THREE.MeshStandardMaterial({ 
            color: 0xffffff, 
            transparent: true, 
            opacity: 0.8,
            emissive: 0x444444
        });
        
        const geo = new THREE.IcosahedronGeometry(1, 1);
        
        for(let i=0; i<5; i++) {
            const puff = new THREE.Mesh(geo, mat);
            puff.position.set(
                (Math.random()-0.5)*2,
                (Math.random()-0.5)*0.5,
                (Math.random()-0.5)*2
            );
            const s = 0.5 + Math.random();
            puff.scale.set(s,s,s);
            group.add(puff);
        }
        
        this.mesh = group;
        this.mesh.nivraAwtsmoos = this;
        
        if (this.position) this.mesh.position.copy(this.position.vector3());
        
        await olam.hoyseef(this);
        this.isReady = true;
        
        // Light
        const light = new THREE.PointLight(0x00ffff, 1, 10);
        this.mesh.add(light);
    }

    applyPhysics(dt) {
        const inputs = this.olam.inputs;
        this.velocity.multiplyScalar(0.95); // High drag in air

        const forward = new THREE.Vector3(0, 0, 1).applyQuaternion(this.mesh.quaternion);
        const up = new THREE.Vector3(0, 1, 0);

        if (inputs.FORWARD) this.velocity.add(forward.multiplyScalar(this.maxSpeed * dt));
        if (inputs.BACKWARD) this.velocity.add(forward.multiplyScalar(-this.maxSpeed * dt));
        
        // Fly Up/Down
        if (inputs.JUMP) this.velocity.y += 20 * dt;
        if (inputs.DOWN) this.velocity.y -= 20 * dt;

        // Turn
        if (inputs.LEFT_ROTATE) this.rotation.y += 2.0 * dt;
        if (inputs.RIGHT_ROTATE) this.rotation.y -= 2.0 * dt;
        
        // Bobbing
        this.mesh.position.y += Math.sin(Date.now() * 0.002) * 0.01;
    }
}
