









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
     * Uses EXACT mesh names provided by the user.
     */
    updateAppearance() {
        if (!this.inventory) return;

        // B"H: The EXACT mesh names as provided.
        // DO NOT GUESS.
        const MESHES = {
            JACKET: "jacket",
            JACKET_TEFFILIN: "jacket-teffilin", // The rolled up jacket
            OUTER_SHIRT: "outer-shirt",
            
            // Arm Teffilin
            TEFFILIN_ARM_STRAPS: "teffilin-arm-straps",
            TEFFILIN_ARM_BOX: "teffiln-arm-box", // Sic: "teffiln"
            
            // Head Teffilin
            TEFFILIN_HEAD_STRAPS: "head-teffilin-straps",
            TEFFILIN_HEAD_BOX: "teffilin-head-box",
            
            GLASSES: "glasses",
            TOP_HAT: "top-hat",
            // Note: Yarmulke/Kippah isn't in the provided list, but we handle it if found
            YAMULKA: "yamulka" 
        };

        // Helper to find mesh by name in garments or children
        const findMesh = (name) => {
            if (this.garments && this.garments[name]) return this.garments[name];
            if (this.modelMesh) {
                let found = null;
                this.modelMesh.traverse(c => {
                    if (c.name === name) found = c;
                });
                return found;
            }
            return null;
        };

        // Helper to set visibility
        const setVis = (name, visible, colorHex = null) => {
            const mesh = findMesh(name);
            if (mesh) {
                mesh.visible = visible;
                if (visible && colorHex) {
                    this.applyMaterialColor(mesh, colorHex);
                }
            }
        };

        // 1. Reset everything to invisible first (optional, but safer)
        // Actually, let's just set based on logic to avoid flicker.

        // 2. Get Equipped Items
        const getItem = (slot) => {
            const ref = this.inventory.equipment[slot];
            if (!ref) return null;
            if (ref.id && ref.className) return ref;
            const source = ref.sourceType === 'action' ? this.inventory.actionSlots : this.inventory.slots;
            return source ? source[ref.index] : null;
        };

        const jacketItem = getItem('jacket');
        const headItem = getItem('head');
        const leftHandItem = getItem('leftHand');
        const rightHandItem = getItem('rightHand');
        
        // 3. Determine States
        const isTeffilin = (item) => item && item.id && item.id.toLowerCase().includes("teffilin");
        
        // Check arm teffilin (usually left hand, checking both to be safe)
        const hasArmTeffilin = isTeffilin(leftHandItem) || isTeffilin(rightHandItem);
        const hasHeadTeffilin = isTeffilin(headItem);
        const hasJacket = !!jacketItem;

        // 4. Apply Logic

        // --- JACKET & SHIRT ---
        setVis(MESHES.OUTER_SHIRT, true); // Shirt always on under jacket

        if (hasJacket) {
            const color = jacketItem.customData?.color || "#FFFFFF";
            
            if (hasArmTeffilin) {
                // Wearing Teffilin: Show Special Jacket, Hide Regular
                setVis(MESHES.JACKET, false);
                setVis(MESHES.JACKET_TEFFILIN, true, color);
            } else {
                // Normal: Show Regular Jacket, Hide Special
                setVis(MESHES.JACKET, true, color);
                setVis(MESHES.JACKET_TEFFILIN, false);
            }
        } else {
            // No Jacket
            setVis(MESHES.JACKET, false);
            setVis(MESHES.JACKET_TEFFILIN, false);
        }

        // --- ARM TEFFILIN ---
        if (hasArmTeffilin) {
            setVis(MESHES.TEFFILIN_ARM_STRAPS, true);
            setVis(MESHES.TEFFILIN_ARM_BOX, true);
        } else {
            setVis(MESHES.TEFFILIN_ARM_STRAPS, false);
            setVis(MESHES.TEFFILIN_ARM_BOX, false);
        }

        // --- HEAD TEFFILIN ---
        if (hasHeadTeffilin) {
            setVis(MESHES.TEFFILIN_HEAD_STRAPS, true);
            setVis(MESHES.TEFFILIN_HEAD_BOX, true);
            // Hide hat if wearing Shel Rosh? Usually yes.
            setVis(MESHES.TOP_HAT, false);
            setVis(MESHES.YAMULKA, false); // Usually Kippah is worn, but mesh might conflict? Let's leave it hidden for now or assume Head Teffilin replaces Head slot.
        } else {
            setVis(MESHES.TEFFILIN_HEAD_STRAPS, false);
            setVis(MESHES.TEFFILIN_HEAD_BOX, false);

            // --- HAT ---
            if (headItem) {
                const color = headItem.customData?.color;
                if (headItem.id.includes("hat") || headItem.id.includes("fedora")) {
                    setVis(MESHES.TOP_HAT, true, color);
                    setVis(MESHES.YAMULKA, false);
                } else if (headItem.id.includes("yarmulke") || headItem.id.includes("kippah")) {
                    setVis(MESHES.TOP_HAT, false);
                    setVis(MESHES.YAMULKA, true, color);
                }
            } else {
                // Default headwear
                setVis(MESHES.TOP_HAT, false);
                setVis(MESHES.YAMULKA, true); 
            }
        }

        // --- GLASSES ---
        // Always show glasses mesh if it exists (or control via item if implemented)
        setVis(MESHES.GLASSES, true);
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
