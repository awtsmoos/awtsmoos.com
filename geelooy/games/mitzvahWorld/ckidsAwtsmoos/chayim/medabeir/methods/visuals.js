

/**
 * B"H
 * @file visuals.js
 * Visual representation logic: Garments, Body Parts (Goof), and Mood.
 */
import * as THREE from '/games/scripts/build/three.module.js';

export default {
    garmentsDefault: {
        glasses: true,
        jacket: true,
        "top-hat": false,
    },

    wear(item) {
        this.updateAppearance();
    },
    
    takeoff(item) {
        this.updateAppearance();
    },

    /**
     * B"H
     * Recalculates visibility of all garments based on current equipment.
     */
    updateAppearance() {
        if (!this.garments) return;
        if (!this.inventory) return;

        // Helper to resolve the actual item object from the equipment reference
        const getItem = (ref) => {
            if (!ref) return null;
            // If it's already an item object (legacy support or direct assignment)
            if (ref.id && ref.className) return ref; 
            
            // If it's a reference pointer { sourceType, index }
            if (ref.sourceType && ref.index !== undefined) {
                const source = ref.sourceType === 'action' ? this.inventory.actionSlots : this.inventory.slots;
                if (source && source[ref.index]) {
                    return source[ref.index];
                }
            }
            return null;
        };

        // 1. Reset all garments to invisible
        for (const meshName in this.garments) {
            this.garments[meshName].visible = false;
        }

        const equippedRefs = this.inventory.equipment;
        
        // Resolve actual items
        const jacketItem = getItem(equippedRefs.jacket);
        const headItem = getItem(equippedRefs.head);
        const legsItem = getItem(equippedRefs.legs);
        const feetItem = getItem(equippedRefs.feet);
        const leftHandItem = getItem(equippedRefs.leftHand);
        const rightHandItem = getItem(equippedRefs.rightHand);

        // 2. Determine States
        let jacketEquipped = !!jacketItem;
        let armTeffilinEquipped = (leftHandItem?.id?.includes("teffilin_arm") || rightHandItem?.id?.includes("teffilin_arm")); 
        let headTeffilinEquipped = (headItem?.id?.includes("teffilin_head"));

        // 3. Logic for Jacket & Teffilin
        if (jacketEquipped) {
            const jacketColor = jacketItem.customData?.color;
            if (armTeffilinEquipped) {
                // Wear special jacket (rolled sleeve)
                if (this.garments["jacket-teffilin"]) {
                    this.garments["jacket-teffilin"].visible = true;
                    if (jacketColor) this.applyMaterialColor(this.garments["jacket-teffilin"], jacketColor);
                }
            } else {
                // Wear regular jacket
                if (this.garments["jacket"]) {
                    this.garments["jacket"].visible = true;
                    if (jacketColor) this.applyMaterialColor(this.garments["jacket"], jacketColor);
                }
            }
        } else {
            // If NO jacket, ensure outer-shirt is visible (or whatever default undergarment)
            if(this.garments["outer-shirt"]) this.garments["outer-shirt"].visible = true;
        }

        // 4. Logic for Arm Teffilin
        if (armTeffilinEquipped) {
            if (this.garments["teffilin-arm-straps"]) this.garments["teffilin-arm-straps"].visible = true;
            if (this.garments["teffiln-arm-box"]) this.garments["teffiln-arm-box"].visible = true;
        }

        // 5. Logic for Head Teffilin
        if (headTeffilinEquipped) {
            if (this.garments["head-teffilin-straps"]) this.garments["head-teffilin-straps"].visible = true;
            if (this.garments["teffilin-head-box"]) this.garments["teffilin-head-box"].visible = true;
        } else {
            // 6. Hats
            if (headItem) {
                const id = (headItem.id || "").toLowerCase();
                let meshName = null;
                
                if (id.includes("yarmulke") || id.includes("kippah")) meshName = "yamulka";
                else if (id.includes("hat") || id.includes("fedora")) meshName = "top-hat";
                
                if (meshName && this.garments[meshName]) {
                    this.garments[meshName].visible = true;
                    if (headItem.customData?.color) {
                        this.applyMaterialColor(this.garments[meshName], headItem.customData.color);
                    }
                }
            } else {
                 if(this.garments["yamulka"]) this.garments["yamulka"].visible = true;
            }
        }

        // 7. Pants & Shoes (Material based)
        if (legsItem && legsItem.customData?.color) {
            this.applyColorToMaterialName("pants", legsItem.customData.color);
        }
        if (feetItem && feetItem.customData?.color) {
            this.applyColorToMaterialName("shoes", feetItem.customData.color);
        }
    },

    applyMaterialColor(object3D, colorHex) {
        if (!object3D) return;
        
        // B"H: Deep recursive traversal to catch ALL nested meshes in a group
        object3D.traverse((child) => {
            if (child.isMesh) {
                // Handle single material or array of materials
                const materials = Array.isArray(child.material) ? child.material : [child.material];
                
                materials.forEach((mat, index) => {
                    // Clone to avoid global side effects if this asset is reused elsewhere
                    // We check if WE specifically cloned it for this instance.
                    if (!child.userData.hasClonedMaterial) {
                         if(Array.isArray(child.material)) {
                             child.material = child.material.map(m => m.clone());
                         } else {
                             child.material = child.material.clone();
                         }
                         child.userData.hasClonedMaterial = true;
                    }

                    // Re-fetch materials after potential cloning
                    const currentMats = Array.isArray(child.material) ? child.material : [child.material];
                    const targetMat = currentMats[index];
                    
                    if (targetMat) {
                        targetMat.color.set(colorHex);
                        // B"H: Ensure update happens. Sometimes texture maps override color if not configured right.
                        // Setting map to null would force color, but might lose detail. 
                        // For now, we assume the texture is tintable (grayscale/white).
                        targetMat.needsUpdate = true; 
                    }
                });
            }
        });
    },

    applyColorToMaterialName(matName, colorHex) {
        if(!this.mesh) return;
        this.mesh.traverse(child => {
             if(child.isMesh && child.material) {
                 const mats = Array.isArray(child.material) ? child.material : [child.material];
                 mats.forEach(m => {
                     if(m.name === matName) {
                         m.color.set(colorHex);
                         m.needsUpdate = true;
                     }
                 });
             }
        });
    },

    // B"H: Default implementation to prevent crashes in child classes
    adjustDOF() {
        // No-op for base Medabeir
    },

    initializeEyelid(ref) { 
    },

    setupGoof() {
        if(this.goofParts && this.mesh) {
            this.goof = {}
            Object.keys(this.goofParts).forEach(q => {
                this.mesh.traverse(child => {
                    if(child.isMesh && child.name == q) {
                        this.goof[this.goofParts[q]] = child;
                    }
                })
            });
            delete this.goofOptions;
            delete this.goofParts;
        }
    }
};
