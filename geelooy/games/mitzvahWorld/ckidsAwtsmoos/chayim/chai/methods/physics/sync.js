// B"H
import * as THREE from '/games/scripts/build/three.module.js';

/**
 * syncMesh - The Pulse of Physical Realignment.
 * Reverted to the manual 'copy' logic from the perfect old.md state.
 */
export default {
    syncMesh(deltaTime) {
        // 1. Abyss Guard: Respawn if fallen into the infinite nothingness
        if (this.collider.start.y < -100) {
            console.log(`B"H - ${this.name} fell into the abyss. Respawning at high potential.`);
            this.velocity.set(0, 0, 0);
            this.setPosition(new THREE.Vector3(0, 15, 0));
        }

        // 2. Sync Physics Root (The Invisible Vessel)
        this.mesh.position.copy(this.collider.start);
        this.mesh.position.y -= this.radius;
        this.mesh.rotation.y = this.rotation.y;
        
        // Sync anchors
        if (this?.emptyCopy?.rotation) this.emptyCopy.rotation.copy(this.mesh.rotation);
        if (this?.nonRotatingEmptyForMovement?.rotation) this.nonRotatingEmptyForMovement.rotation.copy(this.mesh.rotation);

        // 3. Smooth Visual Rotation calculation
        let angularDistance = this.targetRotateOffset - this.rotateOffset;
        if (angularDistance > Math.PI) angularDistance -= 2 * Math.PI;
        else if (angularDistance < -Math.PI) angularDistance += 2 * Math.PI;
        if (Math.abs(angularDistance - Math.PI) < 0.01) angularDistance = -Math.PI;
        
        this.rotateOffset += angularDistance * this.lerpTurnSpeed;
        if (this.rotateOffset > Math.PI) this.rotateOffset -= 2 * Math.PI;
        else if (this.rotateOffset < -Math.PI) this.rotateOffset += 2 * Math.PI;

        // 4. Manual Sync: Visual Model (The Body) following the Physics Root
        if (this.modelMesh) {
            /**
             * B"H - PERFECT SYNC LOGIC (from old.md)
             * We manually copy both rotation and position.
             */
            this.modelMesh.rotation.y = this.rotation.y + this.rotateOffset;
            
            if (this.lastRotateOffset !== this.rotateOffset) {
                // Broadcast rotation change for networked souls or logic triggers
                this.ayshPeula("rotate", this.modelMesh.rotation.y);
                this.lastRotateOffset = this.rotateOffset;
            }
            this.modelMesh.position.copy(this.mesh.position);
        }
        
        this.emptyCopy.position.copy(this.mesh.position);
        this.nonRotatingEmptyForMovement.position.copy(this.mesh.position);
        
        if(this.modelMesh) {
            this.emptyCopy.rotation.copy(this.modelMesh.rotation);
        }

        // 5. FPS Anchor Logic
        if (this.activeRay && this.olam.ayin.isFPS) {
            const camera = this.olam.ayin.camera;
            this.rayAnchor.position.copy(camera.position);
            const cameraEuler = new THREE.Euler().setFromQuaternion(camera.quaternion, 'YXZ');
            this.rayAnchor.rotation.y = cameraEuler.y;
        }
    }
};
