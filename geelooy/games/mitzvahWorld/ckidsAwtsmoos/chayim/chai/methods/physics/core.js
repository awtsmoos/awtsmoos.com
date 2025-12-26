
// B"H
import * as THREE from '/games/scripts/build/three.module.js';

export default {
    setPosition(vec3) {
        if (!vec3 || isNaN(vec3.x) || isNaN(vec3.y) || isNaN(vec3.z)) {
            console.warn("B\"H: Attempted to set invalid position. Ignoring.");
            return;
        }
        this.collider.start.set(
            vec3.x, 
            vec3.y + this.height / 2, 
            vec3.z
        );
        this.collider.end.set(
            vec3.x, 
            vec3.y + this.height, 
            vec3.z
        );
        this.collider.radius = this.radius;
        this.isTeleporting = true;
    },

    getCapsule() {
        if(!this.collider) return null;
        const radius = this.collider.radius;
        const height = this.collider.end.y - this.collider.start.y;
        return {radius, height}
    }
};
