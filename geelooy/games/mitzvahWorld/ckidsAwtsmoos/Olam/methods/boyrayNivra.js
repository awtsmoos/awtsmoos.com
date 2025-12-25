
//B"H
/**
 * @file boyrayNivra.js
 * Olam method for "creating" a nivra (Entity Creation)
 * Hardened to ensure 100% visibility for raycasting across all hierarchies.
 * Now with Graceful Fallback for missing assets AND Self-Healing Cache.
 */

import Utils from '../../utils.js'
import * as THREE from '/games/scripts/build/three.module.js';
import generateThreeJsMesh from './helpers/generateMesh.js';
import * as SkeletonUtils from '/games/scripts/jsm/utils/SkeletonUtils.js';
import HoleManager from '../math/HoleManager.js';
import AssetCache from '../../utils/AssetCache.js'; // B"H: Needed for self-healing

export default class {
    // Helper to create a fallback vessel when the intended one fails
    createPlaceholderMesh(nivra) {
        const geo = new THREE.BoxGeometry(1, 1, 1);
        const mat = new THREE.MeshBasicMaterial({ color: 0xff0000, wireframe: true });
        const mesh = new THREE.Mesh(geo, mat);
        mesh.name = nivra.name + "_fallback";
        mesh.nivraAwtsmoos = nivra;
        nivra.mesh = mesh;
        this.objectsInScene.push(mesh);
        return mesh;
    }

    async boyrayNivra(nivra, info) {
        try {
            let threeObj = null;

            // --- 1. Vessel Manifestation ---
            if(nivra.path && typeof(nivra.path) == "string") {
                let derech = nivra.path;
                let originalDerech = derech; // B"H: Preserve original config path (e.g. awtsmoos://world)
                
                if (derech.startsWith('awtsmoos://')) {
                    const comp = this.getComponent(derech);
                    if (!comp) {
                        console.error(`B"H - Component not found: ${originalDerech}`);
                        // Notify User
                        this.ayshPeula("increase loading percentage", {
                            error: {
                                title: "Missing Component",
                                message: `Could not find definition for: ${originalDerech}`,
                                details: `The entity '${nivra.name}' will appear as a placeholder.`
                            }
                        });
                        return this.createPlaceholderMesh(nivra);
                    }
                    derech = comp;
                }
    
                let gltfAsset = this.$ga("GLTF/" + derech);
                if(!gltfAsset) { 
                    try {
                        gltfAsset = await new Promise((resolve, reject) => {
                            this.loader.load(
                                derech, 
                                resolve, 
                                undefined, 
                                (e) => reject(e) // B"H: Properly reject to catch below
                            );
                        });
                        
                        if(gltfAsset) {
                            this.setAsset("GLTF/" + derech, gltfAsset);
                        }
                    } catch (loadErr) {
                         // B"H: CRITICAL ERROR HANDLED GRACEFULLY
                         console.group(`B"H - ASSET LOAD FAILED for Entity: ${nivra.name}`);
                         
                         // 1. Resolve TRUE SOURCE URL
                         let rawSourceUrl = "Unknown";
                         if (originalDerech.startsWith('awtsmoos://')) {
                             // Extract key from awtsmoos://key/subpath
                             const key = originalDerech.slice(11).split('/')[0];
                             if (this.componentSourceUrls && this.componentSourceUrls[key]) {
                                 rawSourceUrl = this.componentSourceUrls[key];
                             }
                         }

                         console.error(`Original Config Path: ${originalDerech}`);
                         console.error(`Resolved Blob Path: ${derech}`);
                         console.error(`TRUE SOURCE URL: ${rawSourceUrl}`);
                         console.error(`Error Details:`, loadErr);
                         console.error(`Stack Trace:`, loadErr.stack); // B"H: Explicit Stack Trace
                         
                         let diag = "Unknown file type.";
                         let shouldPurge = false;

                         // B"H: Forensics - Inspect the file header
                         try {
                             if(derech && (derech.startsWith("blob:") || derech.startsWith("http"))) {
                                const response = await fetch(derech);
                                const buf = await response.arrayBuffer();
                                const headerBytes = new Uint8Array(buf.slice(0, 16));
                                const headerHex = Array.from(headerBytes).map(b => b.toString(16).padStart(2,'0')).join(' ');
                                const headerStr = new TextDecoder().decode(headerBytes);
                                console.error(`File Header Hex: ${headerHex}`);
                                console.error(`File Header Text: ${headerStr}`);
                                
                                if(headerStr.includes("glTF")) diag = "Valid GLTF Header found (Corruption elsewhere?)";
                                else if(headerStr.includes("Exif") || headerHex.startsWith("ff d8")) { diag = "It looks like a JPEG Image, NOT a 3D Model!"; shouldPurge = true; }
                                else if(headerStr.includes("PNG")) { diag = "It looks like a PNG Image, NOT a 3D Model!"; shouldPurge = true; }
                                else if(headerStr.includes("<!DOCT") || headerStr.includes("<html")) { diag = "It looks like HTML (probably a 404 or Auth page)!"; shouldPurge = true; }
                                else if(headerStr.includes("ID3")) { diag = "It looks like an MP3 Audio file!"; shouldPurge = true; }
                                
                                console.error(`B"H DIAGNOSIS: ${diag}`);
                                
                                // Update error message for UI
                                loadErr.message += `\n[DIAGNOSIS: ${diag}]`;
                             }
                         } catch(forensicErr) {
                             console.error("Could not analyze file header:", forensicErr);
                         }

                         // B"H: SELF-HEALING LOGIC
                         // Delete the ORIGINAL SOURCE URL from cache, not the blob URL
                         if (shouldPurge) {
                             if (rawSourceUrl && rawSourceUrl !== "Unknown") {
                                 console.warn(`B"H - PURGING CORRUPTED ASSET FROM CACHE: ${rawSourceUrl}`);
                                 AssetCache.delete(rawSourceUrl);
                                 loadErr.message += `\n[ACTION: Cache Cleared for ${rawSourceUrl}. Please Reload Page.]`;
                             } else {
                                 console.warn("B\"H - Could not determine original source URL for cache deletion. Try clearing browser cache manually.");
                             }
                         }

                         console.groupEnd();
                         
                         // 1. Alert the User (Huge Interrupt)
                         this.ayshPeula("increase loading percentage", {
                            error: {
                                title: "Asset Manifestation Failed",
                                message: `Failed to load model for '${nivra.name}'`,
                                details: `Path: ${originalDerech}\nSource: ${rawSourceUrl}\nError: ${loadErr.message || loadErr}`
                            }
                        });

                        // 2. Return Fallback (Still Continue)
                        return this.createPlaceholderMesh(nivra);
                    }
                }
                
                const uniqueScene = SkeletonUtils.clone(gltfAsset.scene);
                if(!uniqueScene) {
                    console.error("SkeletonUtils clone failed.");
                    return this.createPlaceholderMesh(nivra);
                }

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
                if(!mesh) {
                     console.error("generateThreeJsMesh failed.");
                     return this.createPlaceholderMesh(nivra);
                }

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
                // If we got here with no mesh, make a placeholder
                return this.createPlaceholderMesh(nivra);
            }

            return threeObj;

        } catch(e) { 
            console.error(`B"H Critical Error in boyrayNivra for entity '${nivra.name}':`, e);
            // Even if unexpected logic error, return placeholder so world loads
            return this.createPlaceholderMesh(nivra);
        }
    }
}
