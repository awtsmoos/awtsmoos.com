






















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

    wear(name) {
        if (!this.garments) return;
        const mesh = this.garments[name];
        if (mesh) {
            mesh.visible = true;
            mesh.traverse(child => {
                child.visible = true;
            });
        }
    },

    takeOff(name) {
        if (!this.garments) return;
        const mesh = this.garments[name];
        if (mesh) {
            mesh.visible = false;
            mesh.traverse(child => {
                child.visible = false;
            });
        }
    },
    
    // B"H: Helper for setting shape keys - Updated to traverse children
    setMorphInfluence(object, name, value) {
        if (!object) return;

        const apply = (mesh) => {
            if (mesh.morphTargetDictionary && mesh.morphTargetInfluences) {
                const index = mesh.morphTargetDictionary[name];
                if (index !== undefined) {
                    mesh.morphTargetInfluences[index] = value;
                }
            }
        };

        // Check the object itself
        apply(object);

        // Check all children (crucial if 'outer-shirt' is a Group)
        object.traverse((child) => {
            if (child.isMesh) {
                apply(child);
            }
        });
    },
    
    // B"H: New Helper to set color on a specific named material
    setSmartMaterialColor(materialName, colorHex) {
        if (!this.materials) return;
        const mat = this.materials[materialName];
        if (mat) {
             // B"H: We should ideally check if we need to clone to avoid affecting other instances,
             // but since we aggregated materials in lifecycle per-instance, modifying 'mat' is generally safe
             // for this specific entity instance if loader handled cloning correctly.
             mat.color.set(colorHex);
        }
    },

    updateAppearance() {
        if (!this.inventory) return;

        const MESHES = {
            JACKET: "jacket",
            JACKET_TEFFILIN: "jacket-teffilin", 
            OUTER_SHIRT: "outer-shirt",
            TEFFILIN_ARM_STRAPS: "teffilin-arm-straps",
            TEFFILIN_ARM_BOX: "teffiln-arm-box", 
            TEFFILIN_HEAD_STRAPS: "head-teffilin-straps",
            TEFFILIN_HEAD_BOX: "teffilin-head-box",
            GLASSES: "glasses",
            TOP_HAT: "top-hat",
            YAMULKA: "yamulka" 
        };

        const getItem = (slot) => {
            const ref = this.inventory.equipment[slot];
            if (!ref) return null;
            
            if (ref.id && ref.className) return ref; 
            
            if (ref.sourceType === 'action') return this.inventory.actionSlots ? this.inventory.actionSlots[ref.index] : null;
            if (ref.sourceType === 'inventory') return this.inventory.slots ? this.inventory.slots[ref.index] : null;
            
            if (ref.sourceType === 'container') {
                const containerId = ref.containerId;
                
                // 1. Try Active Container
                if (this.inventory.activeContainer && this.inventory.activeContainer.id === containerId) {
                     return this.inventory.activeContainer.customData.slots[ref.index];
                }
                
                // 2. Scan Inventory for Closed Bag
                if (this.inventory.slots) {
                    for(const s of this.inventory.slots) {
                        if (s && s.id === containerId && s.customData && s.customData.slots) {
                             return s.customData.slots[ref.index];
                        }
                    }
                }
            }
            return null;
        };

        const jacketItem = getItem('jacket');
        const headItem = getItem('head');
        const shirtItem = getItem('shirt'); 
        const legsItem = getItem('legs'); // Pants
        const feetItem = getItem('feet'); // Shoes
        const leftHandItem = getItem('leftHand');
        const rightHandItem = getItem('rightHand'); 
        
        const isTeffilin = (item) => item && item.id && item.id.toLowerCase().includes("teffilin");
        
        const hasArmTeffilin = isTeffilin(leftHandItem) || isTeffilin(rightHandItem);
        const hasHeadTeffilin = isTeffilin(headItem);
        const hasJacket = !!jacketItem;

        // --- MATERIAL COLOR OVERRIDES (B"H) ---
        // 1. Shoes
        if (feetItem && feetItem.customData?.color) {
            this.setSmartMaterialColor("shoes", feetItem.customData.color);
        } else {
            this.setSmartMaterialColor("shoes", "#111111"); // Default Black Leather
        }

        // 2. Pants
        if (legsItem && legsItem.customData?.color) {
            this.setSmartMaterialColor("pants", legsItem.customData.color);
        } else {
            this.setSmartMaterialColor("pants", "#222222"); // Default Dark Grey
        }

        // 3. Inner Shirt
        if (shirtItem && shirtItem.customData?.color) {
            this.setSmartMaterialColor("shirt", shirtItem.customData.color);
        } else {
            this.setSmartMaterialColor("shirt", "#FFFFFF"); // Default White
        }


        // --- OUTER SHIRT MESH Logic ---
        const outerShirtMesh = this.garments[MESHES.OUTER_SHIRT];
        
        if (shirtItem) {
            // If shirt is equipped, show the OUTER layer as well (assuming it represents the same item)
            // Or if you want separate items, you can filter by ID. For now, any shirt item shows the mesh.
            this.wear(MESHES.OUTER_SHIRT);
            
            if (outerShirtMesh) {
                // Apply Shirt Color to Outer Mesh
                const color = shirtItem.customData?.color;
                if (color) this.applyMaterialColor(outerShirtMesh, color);
                
                // Apply Rolled-Up Shape Key if Arm Teffilin is worn
                const influence = hasArmTeffilin ? 1 : 0;
                this.setMorphInfluence(outerShirtMesh, "rolled-up", influence);
            }
        } else {
            // If no shirt equipped, hide the outer layer (showing inner skin/shirt material)
            this.takeOff(MESHES.OUTER_SHIRT);
            
            if (outerShirtMesh) {
                this.setMorphInfluence(outerShirtMesh, "rolled-up", 0);
            }
        }

        // --- JACKET Logic ---
        if (hasJacket) {
            const color = jacketItem.customData?.color || "#FFFFFF";
            
            if (hasArmTeffilin) {
                this.takeOff(MESHES.JACKET);
                this.wear(MESHES.JACKET_TEFFILIN);
                if(this.garments[MESHES.JACKET_TEFFILIN]) {
                    this.applyMaterialColor(this.garments[MESHES.JACKET_TEFFILIN], color);
                }
            } else {
                this.wear(MESHES.JACKET);
                this.takeOff(MESHES.JACKET_TEFFILIN);
                if(this.garments[MESHES.JACKET]) {
                    this.applyMaterialColor(this.garments[MESHES.JACKET], color);
                }
            }
        } else {
            this.takeOff(MESHES.JACKET);
            this.takeOff(MESHES.JACKET_TEFFILIN);
        }

        // --- ARM TEFFILIN ---
        if (hasArmTeffilin) {
            this.wear(MESHES.TEFFILIN_ARM_STRAPS);
            this.wear(MESHES.TEFFILIN_ARM_BOX);
        } else {
            this.takeOff(MESHES.TEFFILIN_ARM_STRAPS);
            this.takeOff(MESHES.TEFFILIN_ARM_BOX);
        }

        // --- HEAD TEFFILIN ---
        if (hasHeadTeffilin) {
            this.wear(MESHES.TEFFILIN_HEAD_STRAPS);
            this.wear(MESHES.TEFFILIN_HEAD_BOX);
            this.takeOff(MESHES.TOP_HAT);
            this.takeOff(MESHES.YAMULKA);
        } else {
            this.takeOff(MESHES.TEFFILIN_HEAD_STRAPS);
            this.takeOff(MESHES.TEFFILIN_HEAD_BOX);

            if (headItem) {
                const color = headItem.customData?.color;
                if (headItem.id.includes("hat") || headItem.id.includes("fedora")) {
                    this.wear(MESHES.TOP_HAT);
                    this.takeOff(MESHES.YAMULKA);
                    if(color && this.garments[MESHES.TOP_HAT]) this.applyMaterialColor(this.garments[MESHES.TOP_HAT], color);
                } else if (headItem.id.includes("yarmulke") || headItem.id.includes("kippah")) {
                    this.takeOff(MESHES.TOP_HAT);
                    this.wear(MESHES.YAMULKA);
                    if(color && this.garments[MESHES.YAMULKA]) this.applyMaterialColor(this.garments[MESHES.YAMULKA], color);
                }
            } else {
                this.takeOff(MESHES.TOP_HAT);
                this.wear(MESHES.YAMULKA); 
            }
        }

        this.wear(MESHES.GLASSES);
    },

    applyMaterialColor(object3D, colorHex) {
        if (!object3D) return;
        
        object3D.traverse((child) => {
            if (child.isMesh) {
                const materials = Array.isArray(child.material) ? child.material : [child.material];
                
                materials.forEach((mat, index) => {
                    if (!child.userData.hasClonedMaterial) {
                         if(Array.isArray(child.material)) {
                             child.material = child.material.map(m => m.clone());
                         } else {
                             child.material = child.material.clone();
                         }
                         child.userData.hasClonedMaterial = true;
                    }

                    const currentMats = Array.isArray(child.material) ? child.material : [child.material];
                    const targetMat = currentMats[index];
                    
                    if (targetMat) {
                        targetMat.color.set(colorHex);
                        targetMat.needsUpdate = true; 
                    }
                });
            }
        });
    },

    adjustDOF() { },
    initializeEyelid(ref) { },

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