
// B"H
import * as THREE from '/games/scripts/build/three.module.js';

export default {
    syncMesh(deltaTime) {
        // Respawn check
        if (this.collider.start.y < -100) {
            console.log("B\"H: Player fell into abyss. Respawning.");
            this.velocity.set(0, 0, 0);
            this.setPosition(new THREE.Vector3(0, 10, 0));
        }

        this.mesh.position.copy(this.collider.start);
        this.mesh.position.y -= this.radius;
        this.mesh.rotation.y = this.rotation.y;
        
        if (this?.emptyCopy?.rotation) this.emptyCopy.rotation.copy(this.mesh.rotation);
        if (this?.nonRotatingEmptyForMovement?.rotation) this.nonRotatingEmptyForMovement.rotation.copy(this.mesh.rotation);

        // Rotation Smoothing
        let angularDistance = this.targetRotateOffset - this.rotateOffset;
        if (angularDistance > Math.PI) angularDistance -= 2 * Math.PI;
        else if (angularDistance < -Math.PI) angularDistance += 2 * Math.PI;
        if (Math.abs(angularDistance - Math.PI) < 0.01) angularDistance = -Math.PI;
        
        this.rotateOffset += angularDistance * this.lerpTurnSpeed;
        if (this.rotateOffset > Math.PI) this.rotateOffset -= 2 * Math.PI;
        else if (this.rotateOffset < -Math.PI) this.rotateOffset += 2 * Math.PI;

        if (this.modelMesh) {
            this.modelMesh.rotation.y = this.rotation.y + this.rotateOffset;
            if (this.lastRotateOffset !== this.rotateOffset) {
                this.ayshPeula("rotate", this.modelMesh.rotation.y);
                this.lastRotateOffset = this.rotateOffset;
            }
            this.modelMesh.position.copy(this.mesh.position);
        }
        
        this.emptyCopy.position.copy(this.mesh.position);
        this.nonRotatingEmptyForMovement.position.copy(this.mesh.position);
        this.emptyCopy.rotation.copy(this.modelMesh.rotation);

        if (this.activeRay && this.olam.ayin.isFPS) {
            const camera = this.olam.ayin.camera;
            this.rayAnchor.position.copy(camera.position);
            const cameraEuler = new THREE.Euler().setFromQuaternion(camera.quaternion, 'YXZ');
            this.rayAnchor.rotation.y = cameraEuler.y;
        }
    }
};
