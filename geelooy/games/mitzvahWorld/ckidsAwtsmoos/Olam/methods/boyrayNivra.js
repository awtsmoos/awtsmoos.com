
//B"H
/**
 * @file boyrayNivra.js
 * Olam method for "creating" a nivra (Entity Creation)
 * Hardened to ensure 100% visibility for raycasting across all hierarchies.
 */

import Utils from '../../utils.js'
import * as THREE from '/games/scripts/build/three.module.js';
import generateThreeJsMesh from './helpers/generateMesh.js';
import * as SkeletonUtils from '/games/scripts/jsm/utils/SkeletonUtils.js';
import HoleManager from '../math/HoleManager.js';

export default class {
    async boyrayNivra(nivra, info) {
        try {
            let threeObj = null;

            // --- 1. Vessel Manifestation ---
            if(nivra.path && typeof(nivra.path) == "string") {
                let derech = nivra.path;
                if (derech.startsWith('awtsmoos://')) {
                    const comp = this.getComponent(derech);
                    if (!comp) {
                        throw new Error(`B"H - Component not found for path: ${derech}. Check defaultConfig or world file.`);
                    }
                    derech = comp;
                }
    
                let gltfAsset = this.$ga("GLTF/" + derech);
                if(!gltfAsset) { 
                    gltfAsset = await new Promise((resolve, reject) => {
                        this.loader.load(
                            derech, 
                            resolve, 
                            undefined, 
                            (e) => resolve(null) // Resolve null instead of reject to handle gracefully
                        );
                    });
                    
                    if(gltfAsset) {
                        this.setAsset("GLTF/" + derech, gltfAsset);
                    } else {
                        // B"H: Descriptive error for the UI
                        throw new Error(`Failed to load GLTF from URL: ${derech}`);
                    }
                }
                
                const uniqueScene = SkeletonUtils.clone(gltfAsset.scene);
                if(!uniqueScene) throw new Error("SkeletonUtils failed to clone scene.");

                const boneChildren = {}, garments = {}, bodyParts = {};
                const materials = [];

                uniqueScene.traverse(child => {
                    child.nivraAwtsmoos = nivra;
                    if(child.type === "Bone") boneChildren[child.name] = child;
                    if(child.userData?.garment) garments[child.userData.garment] = child;
                    if(child.userData?.["body-part"]) bodyParts[child.userData["body-part"]] = child;

                    if(child.isMesh) {
                        child.castShadow = true;
                        child.receiveShadow = true;
                        if (child.material) {
                            child.material = child.material.clone();
                            materials.push(child.material);
                            Utils.replaceMaterialWithLambert(child);
                            
                            if (child.name.toLowerCase().includes("landscape") || 
                                child.name.toLowerCase().includes("terrain") || 
                                nivra.isTerrain) {
                                child.material.userData.isTerrain = true;
                                HoleManager.injectHoleLogic(child.material);
                            }
                        }
                        // Register for raycasting (important for hovering/labels)
                        this.objectsInScene.push(child);
                    }
                });
                
                nivra.boneChildren = boneChildren;
                nivra.garments = garments;
                nivra.bodyParts = bodyParts;
                nivra.materials = materials;

                threeObj = { scene: uniqueScene, animations: gltfAsset.animations };
                nivra.mesh = uniqueScene;
            } else {
                // --- Golem Path ---
                const mesh = await generateThreeJsMesh(nivra.golem || {}, this);
                if(!mesh) throw new Error("generateThreeJsMesh returned null.");

                mesh.name = nivra.name;
                mesh.nivraAwtsmoos = nivra;
                nivra.mesh = mesh;
                
                // Traverse Golems too (they might be Groups, like stairs)
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

            // --- 2. Registration and Alignment ---
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

                // Physics Registration
                if (nivra.isSolid && this.worldOctree) {
                    // B"H: Robust Check for Mesh vs Group
                    if (nivra.mesh.isMesh) {
                        this.worldOctree.addObject(nivra.mesh);
                    } else {
                        // It's likely a Group or Scene (complex object)
                        this.worldOctree.fromGraphNode(nivra.mesh);
                    }
                }

                // Interaction Registration
                if (nivra.interactable) {
                    this.interactableNivrayim.push(nivra);
                    if (nivra.type !== "chossid" && this.interactiveOctree) {
                        this.interactiveOctree.fromGraphNode(nivra.mesh);
                    }
                }
            } else {
                throw new Error("Nivra mesh was not created.");
            }

            return threeObj;

        } catch(e) { 
            console.error(`B"H Critical Error in boyrayNivra for entity '${nivra.name}':`, e);
            throw e; // Rethrow to be caught by loadNivrayim
        }
    }
}
