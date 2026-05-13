
// B"H
/**
 * @file visuals.js
 * @description
 * 🥋 THE SEFIRAH OF TIFERET (BEAUTY) 🥋
 * 
 * "A body for the soul."
 * This module handles the physical garments (clothes) and structural body (mesh) of 
 * speakers. It delegates to the NpcRandomizer for generating unique visual identities.
 */
import * as THREE from '/games/scripts/build/three.module.js';
import NpcRandomizer from './visuals/NpcRandomizer.js';

export default {
    setupGoof() {
        if (!this.goofOptions || !this.mesh) return;
    },

    updateAppearance() {
        const targetMesh = this.modelMesh || this.mesh;
        
        if (!targetMesh || typeof targetMesh.traverse !== 'function') {
             return; 
        }

        const knownClothingSlots =[
            "jacket", "outer-shirt", "pants", "shoes", "yamulka", "top-hat", "glasses",
            "teffilin-arm-straps", "teffiln-arm-box", "head-teffilin-straps", "teffilin-head-box", "jacket-teffilin"
        ];

        // 1. Transparency reset
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
            activeClothes.push(...this.options.clothes);
        }

        activeClothes.forEach(cloth => {
            if (cloth.meshName) {
                const targetNames = Array.isArray(cloth.meshName) ? cloth.meshName : [cloth.meshName];
                targetMesh.traverse(child => {
                    if (targetNames.includes(child.name) || (child.userData && targetNames.includes(child.userData.garment))) {
                        child.visible = true;
                        
                        if (cloth.color && child.material) {
                            // B"H: Clone material so we don't paint the whole world!
                            if (!child.userData.materialCloned) {
                                child.material = child.material.clone();
                                child.userData.materialCloned = true;
                            }
                            
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

    /**
     * @method randomizeAppearance
     * @description Ensures every cloned NPC looks completely unique.
     */
    randomizeAppearance() {
        const targetMesh = this.modelMesh || this.mesh;
        if (!targetMesh) return;
        
        NpcRandomizer.randomize(targetMesh);
    }
};
