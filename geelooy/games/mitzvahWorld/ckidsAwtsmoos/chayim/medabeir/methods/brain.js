//B"H
import * as THREE from '/games/scripts/build/three.module.js';

export default {
    updateBrain(dt) {
        if (!this.isReady || !this.mesh) return;
        const time = this.olam.environment ? this.olam.environment.gameTime : 12;
        
        // Daily Routine
        if (time > 6 && time < 8) this.targetPosition = new THREE.Vector3(0,0,0); // Morning: Water
        else if (time > 12 && time < 14) this.targetPosition = new THREE.Vector3(10,0,10); // Noon: Pushka
        
        if (this.targetPosition) {
            const dist = this.mesh.position.distanceTo(this.targetPosition);
            if (dist > 2) this.navigate(dt, this.targetPosition);
            else { this.velocity.set(0,0,0); this.playChaweeyoos("idle"); }
        }
    },
    navigate(dt, dest) {
        const dir = new THREE.Vector3().subVectors(dest, this.mesh.position).normalize();
        this.velocity.x = dir.x * this.speed * dt; this.velocity.z = dir.z * this.speed * dt;
        this.mesh.rotation.y = Math.atan2(dir.x, dir.z);
        this.playChaweeyoos("run");
    }
}