
// B"H
export default {
    applyForces(deltaTime, isWorldBusy) {
        let damping = Math.exp(-20 * deltaTime) - 1;
        
        if (!this.onFloor) {
            // B"H: Suspend gravity if world is loading
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
        
        // Terminal velocity cap
        this.velocity.y = Math.max(this.velocity.y, -50); 
    }
};
