
//B"H
import Vehicle from "./vehicle.js";
import * as THREE from '/games/scripts/build/three.module.js';

export default class HotAirBalloon extends Vehicle {
    type = "hotAirBalloon";
    static itemName = "Hot Air Balloon";
    static description = "Uses fire to rise. Watch your fuel!";
    
    constructor(op, olam) {
        super(op, olam);
        this.maxSpeed = 15;
        this.seatOffset.set(0, 0.5, 0);
        this.burnerOn = false;
        this.heat = 0; // Buoyancy factor
        this.fuel = 100;
        this.coolingRate = 0.5;
        this.heatingRate = 1.5;
    }
    
    async heescheel(olam) {
        this.olam = olam;
        
        // Procedural Basket
        const basketGeo = new THREE.BoxGeometry(1.5, 1.2, 1.5);
        const basketMat = new THREE.MeshLambertMaterial({ color: 0x8B4513 });
        const basket = new THREE.Mesh(basketGeo, basketMat);
        
        // Envelope (Balloon)
        const balloonGeo = new THREE.SphereGeometry(4, 32, 32);
        const balloonMat = new THREE.MeshStandardMaterial({ color: Math.random() * 0xffffff, roughness: 0.4 });
        const balloon = new THREE.Mesh(balloonGeo, balloonMat);
        balloon.position.y = 5.5;
        balloon.scale.y = 1.2;
        
        // Ropes
        const ropeGeo = new THREE.CylinderGeometry(0.02, 0.02, 5);
        const ropeMat = new THREE.MeshBasicMaterial({ color: 0x000000 });
        for(let i=0; i<4; i++) {
            const rope = new THREE.Mesh(ropeGeo, ropeMat);
            const x = (i%2===0 ? 0.7 : -0.7);
            const z = (i<2 ? 0.7 : -0.7);
            rope.position.set(x, 2.5, z);
            basket.add(rope);
        }

        basket.add(balloon);
        this.mesh = basket;
        this.mesh.nivraAwtsmoos = this;
        this.mesh.userData.isSolid = true;

        if (this.position) this.mesh.position.copy(this.position.vector3());
        
        // Burner Light
        this.burnerLight = new THREE.PointLight(0xffaa00, 0, 10);
        this.burnerLight.position.y = 2;
        this.mesh.add(this.burnerLight);

        await olam.hoyseef(this);
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
