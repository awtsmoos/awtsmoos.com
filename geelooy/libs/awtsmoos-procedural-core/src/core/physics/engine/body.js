
// B"H
import { Vec3 } from '../../math/vec3.js';

export class RigidBody {
    constructor(id, renderObj, config) {
        this.id = id;
        this.renderObj = renderObj;
        
        // B"H - Add back-reference for system lookups
        if (this.renderObj) {
            this.renderObj.physicsBody = this;
        }

        // Physics State
        this.pos = config.initialPosition ? [...config.initialPosition] : [0,0,0];
        this.oldPos = [...this.pos]; 
        this.velocity = config.initialVelocity ? [...config.initialVelocity] : [0,0,0];
        this.force = [0,0,0];
        
        // Properties
        this.mass = config.mass || 1.0;
        this.invMass = this.mass > 0 ? 1.0 / this.mass : 0.0;
        this.bounciness = config.restitution || 0.5; 
        this.friction = config.friction !== undefined ? config.friction : 0.3;
        this.radius = config.radius || 0.5;
        this.isStatic = this.mass <= 0;
        
        // Sleep state
        this.isSleeping = false;
        this.motionEnergy = 0;
        
        console.log(`B"H - RigidBody Created: ${id} at [${this.pos}] m=${this.mass} f=${this.friction}`);
    }

    applyForce(f) {
        if (this.isStatic) return;
        this.force = Vec3.add(this.force, f);
    }

    integrate(dt, gravity) {
        if (this.isStatic || this.isSleeping) return;
        
        // Record position for tunneling checks
        this.oldPos = [...this.pos];

        // F = ma
        const gravForce = Vec3.scale(gravity, this.mass);
        const totalForce = Vec3.add(this.force, gravForce);
        
        const acc = Vec3.scale(totalForce, this.invMass);
        
        // Euler Integration
        this.velocity = Vec3.add(this.velocity, Vec3.scale(acc, dt));
        
        // B"H - Near-zero damping (0.999) to preserve every ounce of kinetic energy
        this.velocity = Vec3.scale(this.velocity, 0.999);

        // Position update
        this.pos = Vec3.add(this.pos, Vec3.scale(this.velocity, dt));
        
        // Reset forces
        this.force = [0,0,0];
    }

    syncVisuals() {
        if (!this.renderObj) return;
        
        this.renderObj.physicsTransform = {
            position: this.pos,
            rotation: [0,0,0], 
            scale: [1,1,1] 
        };
    }
}
