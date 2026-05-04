/**
 * B"H
 * @file mouseRaycaster.js
 * @description
 * 🔦 THE BEAM OF DISCERNMENT (KAV) 🔦
 * 
 * "And the spirit of G-d hovered over the face of the waters."
 * This module projects the player's will (mouse) into the 3D world, 
 * using a ray to find the Messengers (NPCs) and other interactive vessels.
 */
import * as THREE from '/games/scripts/build/three.module.js';

export default class MouseInteractionHandler {
    constructor(olam) {
        this.olam = olam;
        this.raycaster = new THREE.Raycaster();
        this.mouse = new THREE.Vector2();
        this.currentHovered = null;
    }

    /**
     * @method handleInteraction
     * @description Casts a ray from the mouse through the camera and checks for intersections.
     */
    update(payload, isClick = false) {
        if (!this.olam.ayin || !this.olam.ayin.camera) return;
        if (payload.clientX === undefined) return;

        // B"H: Transform screen coordinates to normalized device coordinates (-1 to +1)
        const canvas = this.olam.renderer.domElement;
        const rect = { width: this.olam.width, height: this.olam.height }; // Using cached dimensions
        
        this.mouse.x = (payload.clientX / rect.width) * 2 - 1;
        this.mouse.y = -(payload.clientY / rect.height) * 2 + 1;

        this.raycaster.setFromCamera(this.mouse, this.olam.ayin.camera);

        // B"H: We cast against the INTERACTIVE OCTREE for NPCs, not the static world!
        // This ensures we hit the capsule/bounds specifically.
        let intersects = [];
        if (this.olam.interactiveOctree) {
            // Note: interactiveOctree search logic might vary based on implementation
            // Here we search through the interactable meshes
            intersects = this.raycaster.intersectObjects(this.olam.interactableNivrayim.map(n => n.mesh || n.modelMesh).filter(m => !!m), true);
        }

        const hit = intersects[0];
        const hitNivra = hit ? (hit.object.nivraAwtsmoos || hit.object.parent?.nivraAwtsmoos) : null;

        if (hitNivra && hitNivra.interactable) {
            if (this.currentHovered !== hitNivra) {
                if (this.currentHovered) this.currentHovered.ayshPeula("mouseLeave");
                this.currentHovered = hitNivra;
                this.currentHovered.ayshPeula("mouseEnter");
            }

            if (isClick) {
                // B"H: silent

                hitNivra.ayshPeula("accepted interaction");
            }
        } else {
            if (this.currentHovered) {
                this.currentHovered.ayshPeula("mouseLeave");
                this.currentHovered = null;
            }
        }
    }
}
