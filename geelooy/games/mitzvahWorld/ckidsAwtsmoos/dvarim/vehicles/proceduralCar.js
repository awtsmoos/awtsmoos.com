
// B"H
import Vehicle from "./vehicle.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1";
import * as THREE from "/games/mitzvahWorld/systems/three/AwtsmoosThreeGateway.js";
import GeometryManager from "../../Olam/math/GeometryManager.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1";
import AwtsmoosThreeManifestor from "../../utils/3d/procedural/AwtsmoosThreeManifestor.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1";

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
        
        const color = Math.random() * 0xffffff;
        const carBlueprint = {
            type: "Group",
            children: [
                {
                    type: "Mesh",
                    name: "chassis",
                    geometry: { type: "BoxGeometry", args: [1.5, 0.5, 3] },
                    material: { type: "MeshLambertMaterial", args: [{ color }] },
                    castShadow: true,
                    position: [0, 0.5, 0],
                    children: [
                        { type: "Mesh", name: "wheel_fl", geometry: { type: "CylinderGeometry", args: [0.4, 0.4, 0.3, 16] }, rotation: [0, 0, Math.PI/2], material: { type: "MeshLambertMaterial", args: [{ color: 0x333333 }] }, position: [-0.9, 0.4, 1.0], castShadow: true },
                        { type: "Mesh", name: "wheel_fr", geometry: { type: "CylinderGeometry", args: [0.4, 0.4, 0.3, 16] }, rotation: [0, 0, Math.PI/2], material: { type: "MeshLambertMaterial", args: [{ color: 0x333333 }] }, position: [0.9, 0.4, 1.0], castShadow: true },
                        { type: "Mesh", name: "wheel_bl", geometry: { type: "CylinderGeometry", args: [0.4, 0.4, 0.3, 16] }, rotation: [0, 0, Math.PI/2], material: { type: "MeshLambertMaterial", args: [{ color: 0x333333 }] }, position: [-0.9, 0.4, -1.0], castShadow: true },
                        { type: "Mesh", name: "wheel_br", geometry: { type: "CylinderGeometry", args: [0.4, 0.4, 0.3, 16] }, rotation: [0, 0, Math.PI/2], material: { type: "MeshLambertMaterial", args: [{ color: 0x333333 }] }, position: [0.9, 0.4, -1.0], castShadow: true },
                        { type: "Mesh", name: "windshield", geometry: { type: "BoxGeometry", args: [1.3, 0.4, 1.5] }, material: { type: "MeshLambertMaterial", args: [{ color: 0x88ccff, opacity: 0.7, transparent: true }] }, position: [0, 0.5, -0.2] },
                        { type: "Mesh", name: "headlight1", geometry: { type: "CylinderGeometry", args: [0.1, 0.1, 0.2] }, rotation: [Math.PI/2, 0, 0], material: { type: "MeshBasicMaterial", args: [{ color: 0xffffaa }] }, position: [-0.5, 0.0, 1.5] },
                        { type: "Mesh", name: "headlight2", geometry: { type: "CylinderGeometry", args: [0.1, 0.1, 0.2] }, rotation: [Math.PI/2, 0, 0], material: { type: "MeshBasicMaterial", args: [{ color: 0xffffaa }] }, position: [0.5, 0.0, 1.5] }
                    ]
                }
            ]
        };

        this.mesh = AwtsmoosThreeManifestor.emanate(carBlueprint);

        this.wheels = [];
        this.mesh.traverse(c => {
            if (c.name && c.name.startsWith("wheel_")) this.wheels.push(c);
        });
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
