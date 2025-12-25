
//B"H
/**
 * @file boyrayNivra.js
 * Olam method for "creating" a nivra (Entity Creation)
 * Standardized Loader logic without manual timeouts.
 */

import Utils from '../../utils.js'
import * as THREE from '/games/scripts/build/three.module.js';
import generateThreeJsMesh from './helpers/generateMesh.js';
import * as SkeletonUtils from '/games/scripts/jsm/utils/SkeletonUtils.js';
import HoleManager from '../math/HoleManager.js';
import AssetCache from '../../utils/AssetCache.js'; 

export default class {
    // Helper to create a fallback vessel when the intended one fails
    createPlaceholderMesh(nivra) {
        const geo = new THREE.BoxGeometry(1, 1, 1);
        const mat = new THREE.MeshBasicMaterial({ color: 0xff0000, wireframe: true });
        const mesh = new THREE.Mesh(geo, mat);
        mesh.name = (nivra.name || "Unknown") + "_FALLBACK";
        mesh.nivraAwtsmoos = nivra;
        nivra.mesh = mesh;
        this.objectsInScene.push(mesh);
        
        // Ensure it's positioned so we can see it
        if (nivra.position) {
             const vec = nivra.position.vector3 ? nivra.position.vector3() : nivra.position;
             mesh.position.copy(vec);
        }
        
        console.warn(`B"H - Created placeholder for ${nivra.name}`);
        return mesh;
    }

    async boyrayNivra(nivra, info) {
        try {
            let threeObj = null;

            // --- 1. Vessel Manifestation (GLTF) ---
            if(nivra.path && typeof(nivra.path) == "string") {
                let derech = nivra.path;
                
                if (derech.startsWith('awtsmoos://')) {
                    const comp = this.getComponent(derech);
                    if (!comp) {
                        console.error(`B"H - Component not found: ${derech}`);
                        return this.createPlaceholderMesh(nivra);
                    }
                    derech = comp;
                }
    
                let gltfAsset = this.$ga("GLTF/" + derech);
                
                if(!gltfAsset) { 
                    try {
                        const shortName = derech.split('/').pop().substring(0, 20);
                        // Notify UI
                        this.ayshPeula("increase loading percentage", {
                            amount: 0,
                            action: "Manifesting Vessels...",
                            subAction: `Fetching: ${shortName}...`
                        });

                        // B"H: Pure Promise Wrapper - No ugly manual timeouts.
                        // If THREE.js loader fails, it calls onError, which resolves null.
                        gltfAsset = await new Promise((resolve, reject) => {
                            this.loader.load(
                                derech, 
                                (data) => {
                                    resolve(data);
                                },
                                (progress) => {
                                    // Optional: finer progress updates
                                },
                                (err) => {
                                    console.error(`B"H - Loader Error for ${derech}:`, err);
                                    resolve(null); // Resolve NULL on error to prevent hang
                                }
                            );
                        });

                        if(gltfAsset) {
                            this.setAsset("GLTF/" + derech, gltfAsset);
                        } else {
                            // If failed to load
                            return this.createPlaceholderMesh(nivra);
                        }

                    } catch (loadErr) {
                         console.error(`B"H - Exception loading ${derech}:`, loadErr);
                         return this.createPlaceholderMesh(nivra);
                    }
                }
                
                nivra.asset = gltfAsset;
                
                // Clone the scene to ensure unique instances
                const uniqueScene = SkeletonUtils.clone(gltfAsset.scene);
                if(!uniqueScene) {
                    console.error("SkeletonUtils clone failed.");
                    return this.createPlaceholderMesh(nivra);
                }

                // Process Children (Placeholders, Bones, Materials)
                const placeholders = {};
                const thingsToRemove = [];
                const boneChildren = {}, garments = {}, bodyParts = {};
                const materials = [];

                uniqueScene.traverse(child => {
                    child.nivraAwtsmoos = nivra;
                    
                    if(child.type === "Bone") boneChildren[child.name] = child;
                    if(child.userData?.garment) garments[child.userData.garment] = child;
                    if(child.userData?.["body-part"]) bodyParts[child.userData["body-part"]] = child;

                    // Water Logic
                    if(child.userData && child.userData.water) {
                        child.isWater = true;
                        this.ayshPeula("start water", child);
                    }

                    // Placeholder Logic (Critical for World/Level construction)
                    if(child.userData && typeof(child.userData.placeholder) == "string") {
                         const { position, rotation, scale } = this.getTransformation(child);
                         const pName = child.userData.placeholder;
                         if(!placeholders[pName]) placeholders[pName] = [];
                         
                         const phEntry = {
                            position, rotation, scale, mesh: child, addedTo: false,
                            ...(child.userData.shlichus ? { shlichus: child.userData.shlichus } : {})
                         };
                         
                         placeholders[pName].push(phEntry);
                         thingsToRemove.push(child);
                    }
                    
                    // Sub-Entity Logic
                    if(child.userData && typeof(child.userData.entity) == "string") {
                        this.saveEntityInNivra(child.userData.entity, nivra, child);
                        if(nivra.isSolid) child.isSolid = true;
                        child.isMesh = true;
                    }

                    if(child.isMesh) {
                        child.castShadow = true;
                        child.receiveShadow = true;
                        
                        // Register valid mesh for raycasting
                        if(!child.isWater && !child.userData.placeholder) {
                             this.objectsInScene.push(child);
                        }

                        if (child.material) {
                            child.material = child.material.clone();
                            materials.push(child.material);
                            Utils.replaceMaterialWithLambert(child);
                            
                            if (child.name.toLowerCase().includes("landscape") || 
                                child.name.toLowerCase().includes("terrain") || 
                                nivra.isTerrain) {
                                if(!child.material.userData) child.material.userData = {};
                                child.material.userData.isTerrain = true;
                                HoleManager.injectHoleLogic(child.material);
                            }
                            
                            if(child.userData.invisible) child.material.visible = false;
                        }
                    }
                });
                
                // Cleanup Placeholders
                if(thingsToRemove.length) {
                    thingsToRemove.forEach(q => q.removeFromParent());
                    nivra.placeholders = placeholders;
                    this.nivrayimWithPlaceholders.push(nivra);
                }

                nivra.boneChildren = boneChildren;
                nivra.garments = garments;
                nivra.bodyParts = bodyParts;
                nivra.materials = materials;

                threeObj = { scene: uniqueScene, animations: gltfAsset.animations };
                nivra.mesh = uniqueScene;
            } else {
                // --- 2. Golem Path (Procedural) ---
                const golemDef = nivra.golem || {};
                const mesh = await generateThreeJsMesh(golemDef, this);
                
                if(!mesh) {
                     console.error("generateThreeJsMesh failed.");
                     return this.createPlaceholderMesh(nivra);
                }

                mesh.name = nivra.name;
                mesh.nivraAwtsmoos = nivra;
                nivra.mesh = mesh;
                
                mesh.traverse(child => {
                    if (child.isMesh) {
                        child.nivraAwtsmoos = nivra;
                        this.objectsInScene.push(child);
                        if (child.material) {
                            const mats = Array.isArray(child.material) ? child.material : [child.material];
                            if(!nivra.materials) nivra.materials = [];
                            nivra.materials.push(...mats);
                        }
                    }
                });
                threeObj = mesh;
            }

            // --- 3. Registration and Alignment ---
            if (nivra.mesh) {
                if (nivra.position) {
                    const vec = nivra.position.vector3 ? nivra.position.vector3() : nivra.position;
                    nivra.mesh.position.copy(vec);
                }
                if (nivra.rotation) {
                     nivra.mesh.rotation.set(nivra.rotation.x || 0, nivra.rotation.y || 0, nivra.rotation.z || 0);
                }
                if (nivra.scale) {
                     const sc = nivra.scale.vector3 ? nivra.scale.vector3() : nivra.scale;
                     nivra.mesh.scale.copy(sc);
                }
                
                nivra.mesh.updateMatrixWorld(true);

                // Octree Physics Registration
                if (nivra.isSolid && this.worldOctree) {
                    // Hook for dynamic octree updates if needed
                    if (nivra.mesh.isMesh) {
                        this.worldOctree.addObject(nivra.mesh);
                    } else {
                        this.worldOctree.fromGraphNode(nivra.mesh);
                    }
                }

                // Interaction Octree
                if (nivra.interactable) {
                    this.interactableNivrayim.push(nivra);
                    if (nivra.type !== "chossid" && this.interactiveOctree) {
                        this.interactiveOctree.fromGraphNode(nivra.mesh);
                    }
                }
            } else {
                return this.createPlaceholderMesh(nivra);
            }

            return threeObj;

        } catch(e) { 
            console.error(`B"H Critical Error in boyrayNivra for entity '${nivra.name}':`, e);
            return this.createPlaceholderMesh(nivra);
        }
    }
}
