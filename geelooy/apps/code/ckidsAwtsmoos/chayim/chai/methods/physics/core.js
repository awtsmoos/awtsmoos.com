
// B"H
import * as THREE from '/games/scripts/build/three.module.js';

export default {
    setPosition(vec3) {
        if (!vec3 || isNaN(vec3.x) || isNaN(vec3.y) || isNaN(vec3.z)) {
            console.warn("B\"H: Attempted to set invalid position. Ignoring.");
            return;
        }
        if (!this.collider) return;
        
        this.collider.radius = this.radius;
        
        // B"H: The physical feet are located exactly at vec3.y.
        // Therefore, the center of the bottom sphere (start) is vec3.y + radius.
        this.collider.start.set(
            vec3.x, 
            vec3.y + this.radius, 
            vec3.z
        );
        
        // B"H: The physical crown is located at vec3.y + height.
        // Therefore, the center of the top sphere (end) is vec3.y + height - radius.
        this.collider.end.set(
            vec3.x, 
            vec3.y + this.height - this.radius, 
            vec3.z
        );
        
        this.isTeleporting = true;
    },

    getCapsule() {
        if(!this.collider) return null;
        const radius = this.collider.radius;
        // Total height = distance between centers + 2 * radius
        const height = (this.collider.end.y - this.collider.start.y) + (2 * radius);
        return {radius, height}
    }
};
