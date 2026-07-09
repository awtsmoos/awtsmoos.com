// B"H
import * as THREE from "/games/mitzvahWorld/systems/three/AwtsmoosThreeGateway.js";

export default {
    setPosition(vec3) {
        if (!vec3 || isNaN(vec3.x) || isNaN(vec3.y) || isNaN(vec3.z)) {
            console.warn("B\"H: Attempted to set invalid position. Ignoring.");
            return;
        }
        if (!this.collider || !this.collider.start || !this.collider.end) {
            console.warn("B\"H: Collider not fully initialized for setPosition.");
            return;
        }
        
        const halfInnerHeight = (this.height - 2 * this.radius) / 2;
        const centerY = vec3.y + this.height / 2;
        
        this.collider.start.set(vec3.x, centerY - halfInnerHeight, vec3.z);
        this.collider.end.set(vec3.x, centerY + halfInnerHeight, vec3.z);
        this.collider.radius = this.radius;
        this.isTeleporting = true;
    },

    getCapsule() {
        if(!this.collider) return null;
        return { radius: this.collider.radius, height: this.collider.end.y - this.collider.start.y };
    },

    _checkNaNAndReset() {
        if (!this.mesh) return false;
        if (isNaN(this.mesh.position.x) || isNaN(this.mesh.position.y) || isNaN(this.mesh.position.z)) {
            // B"H: NaN detected — silently reset to prevent spiral
            if(this.velocity) this.velocity.set(0, 0, 0);
            this.setPosition(new THREE.Vector3(0, 15, 0));
            if(this.olam && this.olam.ayin) this.olam.ayin.currentDistance = 5;
            return true;
        }
        return false;
    },

    _checkAbyss() {
        if (this.collider && this.collider.start.y < -100) {
            // B"H: Fell into the abyss — silently respawn
            this.velocity.set(0, 0, 0);
            this.setPosition(new THREE.Vector3(0, 10, 0));
        }
    },

    _updateSubSystems(deltaTime) {
        if(typeof this.updateRayColor === 'function') this.updateRayColor();      
        if(typeof this.updateHandState === 'function') this.updateHandState();     
        if(typeof this.updateBlockHighlight === 'function') this.updateBlockHighlight();
        if(typeof this.updateParticles === 'function') this.updateParticles(deltaTime);
        if (this.activeObject && this.activeObject.mesh && this.activeObject.mesh.userData && this.activeObject.mesh.userData.onUpdate) {
            this.activeObject.mesh.userData.onUpdate(deltaTime);
        }
    }
};
