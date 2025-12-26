
// B"H
export default {
    executeMovement(deltaTime) {
        const deltaPosition = this.velocity.clone().multiplyScalar(deltaTime);
        const capsule = this.collider;
        
        let numSteps = Math.ceil(deltaPosition.length() / (capsule.radius * 0.5));
        if (numSteps > 10) numSteps = 10; 

        if(this.olam.worldOctree) {
            if (numSteps > 1) {
                const stepDelta = deltaPosition.clone().divideScalar(numSteps);
                for (let i = 0; i < numSteps; i++) {
                    capsule.translate(stepDelta);
                    this.collisions();
                }
            } else {
                capsule.translate(deltaPosition);
                this.collisions();
            }
        }
    }
};
