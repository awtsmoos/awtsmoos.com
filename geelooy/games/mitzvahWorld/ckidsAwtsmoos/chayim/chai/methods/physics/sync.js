
// B"H
/**
 * @file sync.js
 * @description
 * ⚖️ CHAPTER 100: THE SCALES OF TRUTH ⚖️
 * 
 * This module bridges the gap between the Physical Reality (Capsule) 
 * and the Visual Appearance (Mesh). 
 * 
 * THE TIKKUN:
 * We now calculate the 'Contact Point' (Malchus) which is the absolute 
 * bottom of the physics capsule. We then shift the visual mesh by its 
 * pivot-to-feet distance, ensuring the heels kiss the floor exactly.
 */
import * as THREE from '/games/scripts/build/three.module.js';

export default {
    /**
     * @method syncMesh
     * @description Synchronizes visual garments with physical logic.
     */
    syncMesh(deltaTime) {
        if (!this.mesh || !this.collider || !this.collider.start) return;

        // 1. ABYSS GUARD (Gevurah)
        if (this.collider.start.y < -100) {
            this.velocity.set(0, 0, 0);
            this.setPosition(new THREE.Vector3(0, 20, 0));
            return;
        }

        // 2. THE PHYSICAL CENTER
        this.mesh.position.copy(this.collider.start);
        
        // 3. THE GROUNDING ALIGNMENT (Tiferet)
        // This is the absolute Y coordinate of the bottom of the capsule.
        const capsuleBottomY = this.collider.start.y - this.radius;
        
        if (this.modelMesh) {
             // Sync horizontal position
             this.modelMesh.position.x = this.mesh.position.x;
             this.modelMesh.position.z = this.mesh.position.z;
             
             /**
              * B"H: THE REFINED ALIGNMENT MATH
              * 
              * pivotToFeet = how far the model's feet are from its local origin.
              * If we set mesh.y = capsuleBottomY, the Pivot sits on the floor.
              * We must subtract pivotToFeet to pull the model up/down so feet sit on floor.
              */
             const pivotToFeet = this.visualYOffset || 0;
             const additionalSinking = this.groundingOffset || 0; 
             
             // The result of this math places the FEET at capsuleBottomY!
             this.modelMesh.position.y = capsuleBottomY - pivotToFeet - additionalSinking;
             
             if (this.rotation) {
                 this.modelMesh.rotation.y = this.rotation.y + (this.rotateOffset || 0);
             }
        }

        if (this.rotation) {
            this.mesh.rotation.y = this.rotation.y;
        }
        
        // Smooth rotation (Lerp)
        this.targetRotateOffset = this.targetRotateOffset || 0;
        this.rotateOffset = this.rotateOffset || 0;
        this.lerpTurnSpeed = this.lerpTurnSpeed || 0.145;
        let angularDistance = this.targetRotateOffset - this.rotateOffset;
        if (angularDistance > Math.PI) angularDistance -= 2 * Math.PI;
        else if (angularDistance < -Math.PI) angularDistance += 2 * Math.PI;
        this.rotateOffset += angularDistance * this.lerpTurnSpeed;
    }
};
