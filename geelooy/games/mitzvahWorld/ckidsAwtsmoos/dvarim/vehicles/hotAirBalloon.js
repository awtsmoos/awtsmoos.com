
//B"H
import Vehicle from "./vehicle.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1";
import * as THREE from "/games/mitzvahWorld/systems/three/AwtsmoosThreeGateway.js";

export default class HotAirBalloon extends Vehicle {
    type = "hotAirBalloon";
    static itemName = "Hot Air Balloon";
    static description = "Uses fire to rise. Watch your fuel!";
    
    constructor(op, olam) {
        // B"H: The Golem of the Skies
        op.golem = op.golem || {
            guf: {
                Compound: [
                    { type: "Box", args: [1.5, 1.2, 1.5], pos: [0, 0, 0], mat: { color: 0x8B4513 } }, // Basket
                    { type: "Sphere", args: [4, 32, 32], pos: [0, 5.5, 0], scale: [1, 1.2, 1], mat: { color: "#ff5722", roughness: 0.4 } }, // Balloon
                    // Ropes
                    { type: "Cylinder", args: [0.02, 0.02, 5], pos: [0.7, 2.5, 0.7], mat: { color: 0x000000 } },
                    { type: "Cylinder", args: [0.02, 0.02, 5], pos: [-0.7, 2.5, 0.7], mat: { color: 0x000000 } },
                    { type: "Cylinder", args: [0.02, 0.02, 5], pos: [0.7, 2.5, -0.7], mat: { color: 0x000000 } },
                    { type: "Cylinder", args: [0.02, 0.02, 5], pos: [-0.7, 2.5, -0.7], mat: { color: 0x000000 } }
                ]
            }
        };

        super(op, olam);
        this.maxSpeed = 15;
        this.seatOffset = new THREE.Vector3(0, 0.5, 0);
        this.burnerOn = false;
        this.heat = 0; 
        this.fuel = 100;
        this.coolingRate = 0.5;
        this.heatingRate = 1.5;
    }
    
    async heescheel(olam) {
        this.olam = olam;
        await super.heescheel(olam); // This will generate the mesh from op.golem

        // B"H: Add the Burner Light as a separate vessel property
        if (this.mesh) {
            this.burnerLight = new THREE.PointLight(0xffaa00, 0, 10);
            this.burnerLight.position.set(0, 2, 0);
            this.mesh.add(this.burnerLight);
        }

        this.isReady = true;
    }


    applyPhysics(dt) {
        // Controls: Space to Burn
        if (this.driver) {
            if (this.olam.inputs.JUMP && this.fuel > 0) {
                this.burnerOn = true;
                this.fuel -= dt * 2;
            } else {
                this.burnerOn = false;
            }
            
            // Movement (Wind/Propulsion)
            if (this.olam.inputs.FORWARD) {
                const f = new THREE.Vector3(0,0,1).applyQuaternion(this.mesh.quaternion);
                this.velocity.add(f.multiplyScalar(dt * 5));
            }
            if (this.olam.inputs.LEFT_ROTATE) this.rotation.y += dt;
            if (this.olam.inputs.RIGHT_ROTATE) this.rotation.y -= dt;
        } else {
            this.burnerOn = false;
        }

        // Thermodynamics
        if (this.burnerOn) {
            this.heat = Math.min(20, this.heat + this.heatingRate * dt);
            this.burnerLight.intensity = Math.random() * 2 + 1;
        } else {
            this.heat = Math.max(0, this.heat - this.coolingRate * dt);
            this.burnerLight.intensity = 0;
        }

        // Buoyancy vs Gravity
        // Gravity is roughly -30 in Olam. We need lift > 30 to rise.
        // Base lift = heat * liftMultiplier
        const lift = this.heat * 2.0; 
        const gravity = 30; // Matches Olam gravity
        
        // Net vertical force
        const netForceY = lift - gravity;
        
        // Apply to velocity
        this.velocity.y += netForceY * dt;
        
        // Air Resistance (Drag)
        this.velocity.x *= 0.98;
        this.velocity.z *= 0.98;
        this.velocity.y *= 0.98;
        
        // Ground collision handled by super
        if (this.mesh.position.y < 0.6 && this.velocity.y < 0) {
             this.velocity.y = 0;
             this.mesh.position.y = 0.6;
             this.onFloor = true;
        } else {
            this.onFloor = false;
        }
        
        // Move
        this.mesh.position.addScaledVector(this.velocity, dt);
        this.mesh.rotation.y = this.rotation.y;
        
        // UI Feedback
        if (this.driver) {
            this.olam.ayshPeula("ui event", "gameHUD", {
                updateStats: {
                    customText: `Fuel: ${Math.floor(this.fuel)}% | Heat: ${Math.floor(this.heat)}`
                }
            });
        }
    }
}
