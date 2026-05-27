
// B"H
import Vehicle from "./vehicle.js";
import * as THREE from '/games/scripts/build/three.module.js';
import GeometryManager from "../../Olam/math/GeometryManager.js";

export default class ProceduralCar extends Vehicle {
    type = "proceduralCar";
    static itemName = "Merkavah (Car)";
    static description = "A fast ground vehicle.";
    
    constructor(op, olam) {
        super(op, olam);
        this.maxSpeed = 80;
        this.seatOffset.set(0, 0.2, -0.2);
    }

    async heescheel(olam) {
        this.olam = olam;
        
        // 1. Create Chassis
        const chassisGeo = new THREE.BoxGeometry(1.5, 0.5, 3);
        const chassisMat = new THREE.MeshLambertMaterial({ color: Math.random() * 0xffffff });
        const chassis = new THREE.Mesh(chassisGeo, chassisMat);
        chassis.position.y = 0.5;
        chassis.castShadow = true;

        // 2. Create Wheels
        const wheelGeo = new THREE.CylinderGeometry(0.4, 0.4, 0.3, 16);
        wheelGeo.rotateZ(Math.PI / 2);
        const wheelMat = new THREE.MeshLambertMaterial({ color: 0x333333 });
        
        this.wheels = [];
        const positions = [
            [-0.9, 0.4, 1.0], [0.9, 0.4, 1.0], // Front
            [-0.9, 0.4, -1.0], [0.9, 0.4, -1.0] // Back
        ];

        positions.forEach(pos => {
            const w = new THREE.Mesh(wheelGeo, wheelMat);
            w.position.set(...pos);
            w.castShadow = true;
            chassis.add(w);
            this.wheels.push(w);
        });

        // 3. Windshield / Top
        const topGeo = new THREE.BoxGeometry(1.3, 0.4, 1.5);
        const topMat = new THREE.MeshLambertMaterial({ color: 0x88ccff, opacity: 0.7, transparent: true });
        const top = new THREE.Mesh(topGeo, topMat);
        top.position.set(0, 0.5, -0.2);
        chassis.add(top);

        // 4. Headlights
        const lightGeo = new THREE.CylinderGeometry(0.1, 0.1, 0.2);
        lightGeo.rotateX(Math.PI / 2);
        const lightMat = new THREE.MeshBasicMaterial({ color: 0xffffaa });
        
        const l1 = new THREE.Mesh(lightGeo, lightMat);
        l1.position.set(-0.5, 0.0, 1.5);
        chassis.add(l1);
        
        const l2 = new THREE.Mesh(lightGeo, lightMat);
        l2.position.set(0.5, 0.0, 1.5);
        chassis.add(l2);

        this.mesh = chassis;
        this.mesh.nivraAwtsmoos = this;
        this.mesh.userData.isSolid = true; // Collide with others
        
        if (this.position) this.mesh.position.copy(this.position.vector3());
        
        this.mesh.updateMatrixWorld(true);
        await olam.hoyseef(this);
        
        // Add to Physics
        this.olam.worldOctree.addObject(this.mesh);
        
        this.isReady = true;
    }

    applyPhysics(dt) {
        super.applyPhysics(dt);
        
        // Spin Wheels
        const wheelSpeed = this.speed * dt * 2.0;
        this.wheels.forEach(w => {
            w.rotation.x += wheelSpeed;
        });

        // Drifting / Steering Visuals
        if (Math.abs(this.speed) > 1) {
            const turn = (this.olam.inputs.LEFT_ROTATE ? 0.3 : 0) + (this.olam.inputs.RIGHT_ROTATE ? -0.3 : 0);
            // Rotate front wheels
            this.wheels[0].rotation.y = turn;
            this.wheels[1].rotation.y = turn;
        }
        
        // Simple Gravity for Car
        if (!this.onFloor) {
             this.velocity.y -= 30 * dt;
        }
    }
}
