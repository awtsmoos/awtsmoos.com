
// B"H
/**
 * forces.js - Handling gravity and damping.
 * 
 * Chapter 4: The Downward Pull.
 * "He stretches out the north over the empty space, and hangs the earth upon nothing." (Iyov 26:7)
 */
export default {
    /**
     * @method applyForces
     * @description Injects gravity into the soul's velocity.
     */
    applyForces(deltaTime, isWorldBusy) {
        if (isNaN(this.velocity.y)) {
             this.velocity.y = 0;
        }

        let damping = Math.exp(-20 * deltaTime) - 1;
        
        if (!this.onFloor) {
            /**
             * B"H: THE HOLY HOVER
             * While the world is still building (isWorldBusy), we suspend gravity 
             * to prevent falling into the abyss.
             */
            if (!isWorldBusy) {
                const gravityPull = this.olam.GRAVITY * deltaTime;
                this.velocity.y -= gravityPull;
                
                // Logging occasional gravity state
                if (Math.random() < 0.001) {
                    console.log(`B"H - ⬇️ Gravity Engaged: -${gravityPull.toFixed(3)}. World Status: Solid.`);
                }
            } else {
                 this.velocity.y = 0; 
                 if (Math.random() < 0.01) {
                    console.log("B\"H - ⏳ Holy Hover: Gravity suspended while world solidifies.");
                 }
            }
            
            const airDamping = damping * 0.1;
            this.velocity.x += this.velocity.x * airDamping;
            this.velocity.z += this.velocity.z * airDamping;
        } else {
            // Apply ground damping
            this.velocity.addScaledVector(this.velocity, damping);
        }
        
        // Terminal velocity protection
        if (this.velocity.y < -50) this.velocity.y = -50; 
    }
};
