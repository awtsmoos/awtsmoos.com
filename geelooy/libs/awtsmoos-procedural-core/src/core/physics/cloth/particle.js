// B"H
import { Vec3 } from '../../math/vec3.js';

export class Particle {
    /**
     * @param {number} x - Initial X
     * @param {number} y - Initial Y
     * @param {number} z - Initial Z
     * @param {number} mass - Mass of the particle (heavier = harder to move, more gravity)
     * @param {number} drag - Air resistance (0 to 1). Higher = thicker atmosphere/cloth.
     * @param {boolean} pinned - If true, particle is static.
     */
    constructor(x, y, z, mass = 1.0, drag = 0.01, pinned = false) {
        this.pos = [x, y, z];
        this.oldPos = [x, y, z];
        this.originalPos = [x, y, z];
        this.forces = [0, 0, 0];
        
        this.mass = mass;
        this.invMass = pinned ? 0 : 1.0 / mass;
        this.drag = drag;
        this.pinned = pinned;
        
        // Render indices tracking
        this.renderIndices = []; 
        this.accumulatedNormal = [0, 0, 0];
    }

    addForce(f) {
        if (this.pinned) return;
        this.forces = Vec3.add(this.forces, f);
    }

    integrate(dt) {
        if (this.pinned) return;

        // Verlet Integration
        let velocity = Vec3.sub(this.pos, this.oldPos);
        
        // Apply Drag (simulating air resistance / thickness)
        velocity = Vec3.scale(velocity, 1.0 - this.drag);

        // Cap max velocity for stability
        const maxSpeed = 3.0; 
        const speedSq = velocity[0]*velocity[0] + velocity[1]*velocity[1] + velocity[2]*velocity[2];
        if (speedSq > maxSpeed * maxSpeed) {
            velocity = Vec3.scale(velocity, maxSpeed / Math.sqrt(speedSq));
        }

        // F = ma -> a = F * invMass
        const acc = Vec3.scale(this.forces, this.invMass);
        
        // x(t+dt) = x(t) + v + a*dt*dt
        const delta = Vec3.add(velocity, Vec3.scale(acc, dt * dt));
        const newPos = Vec3.add(this.pos, delta);

        this.oldPos = [...this.pos];
        this.pos = newPos;
        
        // Reset forces
        this.forces = [0, 0, 0];
    }
}