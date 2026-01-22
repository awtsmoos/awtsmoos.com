// B"H
/**
 * boyrayNivra.js - The art of low-level mesh creation.
 * Implements "Hierarchical Yielding" via Traversal module.
 */
import Utils from '../../utils.js'
import * as THREE from '/games/scripts/build/three.module.js';
import generateThreeJsMesh from './helpers/generateMesh.js';
import Traversal from './boyray/Traversal.js';

export default class {
    isInWater(position) {
        if (!this.water) return null;
        const waterWorldPos = new THREE.Vector3();
        this.water.getWorldPosition(waterWorldPos);
        return position.y <= waterWorldPos.y;
    }
    
    async generateThreeJsMesh(golem) {
        console.log("B\"H - Synthesizing mesh from golem blueprint...");
        return generateThreeJsMesh(golem, this);
    }
    
    async boyrayNivra(nivra) {
        console.group(`B"H - Manifesting Vessel for: ${nivra.name || 'Anonymous'}`);
        try {
            if(nivra.path && typeof(nivra.path) == "string") {
                let derech = nivra.path;
                
                if (nivra.path.startsWith('awtsmoos://')) {
                    const component = this.getComponent(nivra.path);
                    if (!component) {
                        console.warn(`B"H: Component path "${nivra.path}" not found. Fallback to Cube.`);
                        console.groupEnd();
                        return await this.generateThreeJsMesh({ guf: { BoxGeometry: [1,1,1] } });
                    }
                    derech = component;
                }
    
                console.log(`B"H - Drawing down GLTF asset from: ${derech}`);
                let gltf = this.$ga("GLTF/" + derech);
                
                if(!gltf) { 
                    try {
                        gltf = await new Promise((r, j) => {
                            this.loader.load(derech, onload => {
                                console.log(`B"H - GLTF Asset Manifested: ${derech}`);
                                r(onload);
                            }, null, err => {
                                console.error(`B"H - GLTF Load Error: ${derech}`, err);
                                r(null);
                            });
                        });
                    } catch(e) { throw e; }
                }
                
                if(!gltf) {
                    console.groupEnd();
                    throw `B"H Error: Could not draw down vessel from ${derech}`;
                }
                
                this.setAsset("GLTF/"+derech, gltf);

                // B"H: THE SACRED CLONE
                console.log(`B"H - Cloning Sacred Vessel for ${nivra.name}...`);
                const meshRoot = gltf.scene.clone();

                const placeholders = {}, thingsToRemove = [], materials = [];
                const boneChildren = {}, garments= {}, bodyParts = {};
                nivra.boneChildren = boneChildren;

                const collections = {
                    placeholders, thingsToRemove, materials,
                    boneChildren, garments, bodyParts
                };

                // B"H: Delegate complexity to Traversal module
                const nodeCount = await Traversal.traverseVessel(meshRoot, nivra, this, collections);
                
                console.log(`B"H - Vessel processed. Nodes: ${nodeCount}, Materials: ${materials.length}`);
                
                if(Object.keys(bodyParts).length) nivra.bodyParts = bodyParts;
                if(Object.keys(garments).length) nivra.garments = garments;
                
                if(thingsToRemove.length) {
                    console.log(`B"H - Clearing ${thingsToRemove.length} placeholders from ${nivra.name}.`);
                    thingsToRemove.forEach(q => q.removeFromParent());
                    nivra.placeholders = placeholders;
                    this.nivrayimWithPlaceholders.push(nivra);
                }
    
                if(nivra.isSolid) {
                    nivra.needsOctreeChange = true;
                    nivra.on("changeOctreePosition", () => {
                        console.log(`B"H - Solidifying ${nivra.name} in the Physics Octree.`);
                        meshRoot.traverse(child => {
                            if(!child.isMesh || child.isWater) return;
                            if(child.geometry) child.geometry.sourceMesh = child;
                            child.userData.isSolid = true;
                            if(!child.userData.itemData) {
                                child.userData.itemData = nivra.itemData || { id: "brick", className: "Brick", name: "Solid Matter" };
                            }
                            if(!child.userData.notSolid) this.worldOctree.addObject(child);
                        });
                    });
                }

                if(nivra.interactable) {
                    this.interactableNivrayim.push(nivra);
                    if(nivra.type != "chossid" && nivra.type != "customNpc" && nivra.type != "medabeir") { 
                        nivra.needsOctreeChange = true;
                        nivra.on("changeOctreePosition", () => {
                            console.log(`B"H - Mapping ${nivra.name} to Interactive Octree.`);
                            this.interactiveOctree.fromGraphNode(meshRoot);
                        });
                    }
                }
    
                nivra.materials = materials;
                
                console.log(`B"H - Manifestation Package for ${nivra.name} complete.`);
                console.groupEnd();
                
                return { scene: meshRoot, animations: gltf.animations };
            } else {
                console.log(`B"H - Manifesting primitive vessel for ${nivra.name}...`);
                const golem = nivra.golem || { guf: { BoxGeometry: [1,1,1] } };
                const mesh = await this.generateThreeJsMesh(golem);
                mesh.name = nivra.name;
                
                if (nivra.position) mesh.position.copy(nivra.position.vector3());
                if (nivra.rotation) mesh.rotation.set(nivra.rotation.x || 0, nivra.rotation.y || 0, nivra.rotation.z || 0);
                if (nivra.scale) mesh.scale.copy(nivra.scale.vector3());
                
                mesh.updateMatrixWorld(true);
                mesh.castShadow = true; mesh.receiveShadow = true;

                if (nivra.isSolid) {
                    console.log(`B"H - Solidifying primitive ${nivra.name}.`);
                    this.worldOctree.addObject(mesh);
                }
                if (nivra.interactable && nivra.type !== "chossid") this.interactiveOctree.fromGraphNode(mesh);
                
                console.groupEnd();
                return mesh;
            }
        } catch(e) {
            console.error("B\"H Critical Forge Error:", e);
            console.groupEnd();
            throw e;
        }
    }
}
