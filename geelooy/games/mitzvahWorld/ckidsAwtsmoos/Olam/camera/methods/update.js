// B"H
/**
 * update.js - The constant adjustment of the spiritual eye (Ayin).
 * 
 * B"H: DECOUPLED MODE ACTIVATED.
 * The Ayin now observes from a distance to ensure the landscape is visible, 
 * bypassing the entrapment of near-collision snapping.
 */
import * as THREE from '/games/scripts/build/three.module.js';

export default function update() {
    // 1. THE HASHGACHA LOG (Throttled to every 2 seconds)
    const now = Date.now();
    if (!this._lastDiagnosticLog || now - this._lastDiagnosticLog > 2000) {
        console.group(`B"H [Ayin Diagnostic] - Heartbeat: ${new Date().toLocaleTimeString()}`);
        console.log(`- Decoupled Mode: ${!!this.decoupled}`);
        console.log(`- Target Vessel: ${this.target ? (this.target.name || "Unnamed") : "NULL"}`);
        if (this.target && this.target.mesh) {
            console.log(`- Target Pos: x:${this.target.mesh.position.x.toFixed(2)}, y:${this.target.mesh.position.y.toFixed(2)}, z:${this.target.mesh.position.z.toFixed(2)}`);
        }
        console.log(`- Current Camera Pos: x:${this.camera.position.x.toFixed(2)}, y:${this.camera.position.y.toFixed(2)}, z:${this.camera.position.z.toFixed(2)}`);
        console.log(`- Far Plane: ${this.camera.far}`);
        console.groupEnd();
        this._lastDiagnosticLog = now;
    }

    // 2. THE HEAVENLY OVERVIEW (Decoupled Logic)
    if (this.decoupled) {
        /**
         * B"H: Position the Eye at a safe altitude and distance.
         * We look from a great height to ensure visibility of the entire creation.
         */
        const overviewPos = new THREE.Vector3(1000, 1000, 1000);
        const lookAtTarget = new THREE.Vector3(0, 0, 0);
        
        if (this.target && this.target.mesh) {
            // If a target exists, stay relative to it but stay HIGH.
            overviewPos.set(
                this.target.mesh.position.x + 500,
                this.target.mesh.position.y + 1000,
                this.target.mesh.position.z + 500
            );
            lookAtTarget.copy(this.target.mesh.position);
        }

        // B"H: SNAP, do not lerp. Snapping ensures we escape any interior geometry immediately.
        this.camera.position.copy(overviewPos); 
        this.camera.lookAt(lookAtTarget);
        
        // Sync the follower for vector calculations
        this.cameraFollower.position.copy(this.camera.position);
        this.cameraFollower.quaternion.copy(this.camera.quaternion);
        return; 
    }

    // --- LEGACY TRACKING LOGIC (Only runs if not decoupled) ---
    if (!this.target || !this.target.mesh) return;

    // Protection against corrupted numbers
    if (isNaN(this.userInputTheta) || isNaN(this.userInputPhi)) {
        this.userInputTheta = 0;
        this.userInputPhi = 0;
        return; 
    }

    this.userInputPhi = this.clampAngle(this.userInputPhi, this.yMinLimit, this.yMaxLimit);
    this.euler = new THREE.Euler(this.userInputPhi * THREE.MathUtils.DEG2RAD, this.userInputTheta * THREE.MathUtils.DEG2RAD, 0, 'YXZ');
    const rotation = new THREE.Quaternion().setFromEuler(this.euler);
    
    let tHeight = (typeof(this.targetHeight) === 'number' && !isNaN(this.targetHeight)) ? this.targetHeight : 1.5;
    const finalPosition = new THREE.Vector3().copy(this.target.mesh.position);
    finalPosition.y += tHeight;
    
    // Position camera far back
    const offset = new THREE.Vector3(0, 0, 15).applyQuaternion(rotation);
    finalPosition.add(offset);

    if (!isNaN(finalPosition.x)) {
        this.camera.position.copy(finalPosition);
        const lookAtPos = this.target.mesh.position.clone().add(new THREE.Vector3(0, tHeight, 0));
        this.camera.lookAt(lookAtPos);
    }
}
