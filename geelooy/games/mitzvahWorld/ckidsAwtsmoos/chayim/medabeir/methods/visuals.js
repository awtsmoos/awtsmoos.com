
// B"H
/**
 * @file visuals.js
 * @description
 * 🥋 THE SEFIRAH OF TIFERET (BEAUTY) 🥋
 * 
 * Chapter 12: The Outer Manifestation.
 * "A body for the soul."
 * 
 * This module handles the physical garments (clothes) and structural body (mesh) of 
 * speakers. It maps inventory items to internal skeletal names.
 * 
 * THE TIKKUN OF THE TWIN SOULS:
 * Previously, the traversal attempted to navigate the invisible physics shell 
 * (`this.mesh`), leaving the true visual vessel (`this.modelMesh`) fully clothed
 * in every possible overlapping garment! Now, we target the true visual vessel, 
 * banishing the illusion of double-loaded models.
 */
import * as THREE from '/games/scripts/build/three.module.js';

export default {
    /**
     * @function setupGoof
     * @description Anchors the physical vessel parameters.
     */
    setupGoof() {
        if (!this.goofOptions || !this.mesh) return;
    },

    /**
     * @function updateAppearance
     * @description Navigates the garments (visible sub-meshes) of the soul's vessel.
     */
    updateAppearance() {
        // B"H: The true visual vessel is modelMesh!
        const targetMesh = this.modelMesh || this.mesh;
        
        if (!targetMesh || typeof targetMesh.traverse !== 'function') {
             return; 
        }

        // The absolute list of potential garments that might overlap
        const knownClothingSlots =[
            "jacket", "outer-shirt", "pants", "shoes", "yamulka", "top-hat", "glasses",
            "teffilin-arm-straps", "teffiln-arm-box", "head-teffilin-straps", "teffilin-head-box", "jacket-teffilin"
        ];

        // 1. Return to state of absolute transparency (Ayin)
        targetMesh.traverse(child => {
            const isGarment = knownClothingSlots.includes(child.name) || (child.userData && child.userData.garment);
            if (isGarment) {
                child.visible = false;
            }
        });

        // 2. Clothe the vessel strictly with active equipment
        const activeClothes = [];

        if (this.inventory && this.inventory.equipment) {
            Object.values(this.inventory.equipment).forEach(ref => {
                if (!ref) return;
                let item = null;
                if (ref.sourceType === 'inventory') item = this.inventory.slots[ref.index];
                else if (ref.sourceType === 'action') item = this.inventory.actionSlots[ref.index];
                if (item && item.customData) {
                    activeClothes.push(item.customData);
                }
            });
        } else if (this.options && this.options.clothes) {
            // B"H: For NPCs who don't have a full inventory system but have clothes defined
            activeClothes.push(...this.options.clothes);
        }

        activeClothes.forEach(cloth => {
            if (cloth.meshName) {
                const targetNames = Array.isArray(cloth.meshName) ? cloth.meshName : [cloth.meshName];
                targetMesh.traverse(child => {
                    if (targetNames.includes(child.name) || (child.userData && targetNames.includes(child.userData.garment))) {
                        child.visible = true;
                        // B"H: Apply dynamic Sefirotic colors to the garment!
                        if (cloth.color && child.material) {
                            if (Array.isArray(child.material)) {
                                child.material.forEach(m => {
                                    if(m.color) m.color.set(cloth.color);
                                });
                            } else if (child.material.color) {
                                child.material.color.set(cloth.color);
                            }
                        }
                    }
                });
            }
        });
    },

    randomizeAppearance() {
        if (!this.mesh) return;
    }
};
