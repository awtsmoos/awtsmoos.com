// B"H
/**
 * forces.js - Handling gravity and damping.
 * Implements the "Holy Hover" to stabilize loading.
 */
export default {
    applyForces(deltaTime, isWorldBusy) {
        let damping = Math.exp(-20 * deltaTime) - 1;
        
        if (!this.onFloor) {
            /**
             * B"H: THE HOLY HOVER
             * While the Speech of the Awtsmoos is still manifesting (isWorldBusy),
             * we suspend the gravity pull to prevent souls from falling into the abyss
             * before the floor is physically present.
             */
            if (!isWorldBusy) {
                this.velocity.y -= this.olam.GRAVITY * deltaTime;
            } else {
                 this.velocity.y = 0; 
            }
            
            const airDamping = damping * 0.1;
            this.velocity.x += this.velocity.x * airDamping;
            this.velocity.z += this.velocity.z * airDamping;
        } else {
            this.velocity.addScaledVector(this.velocity, damping);
        }
        
        // Terminal velocity cap - protects against physics explosions
        this.velocity.y = Math.max(this.velocity.y, -50); 
    }
};
