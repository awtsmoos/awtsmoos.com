
/**
 * B"H
 * Olam method for "creating" a nivra
 */

import Utils from '../../utils.js'
import * as THREE from '/games/scripts/build/three.module.js';
import { Octree } from '../math/AwtsmoosOctree/index.js';
import generateThreeJsMesh from './helpers/generateMesh.js';

export default class {
   
    isInWater(position) {
        if (!this.water) return null;
        var waterWorldPosition = null
        if(!this.globalWaterPosition) {
            waterWorldPosition = new THREE.Vector3();
            this.water.getWorldPosition(waterWorldPosition);
            this.globalWaterPosition = waterWorldPosition
        }
        waterWorldPosition = this.globalWaterPosition
        const globalPosition = position.clone();
        if(!this.temp) {
            this.temp = new THREE.Object3D();
        }
        var tempObject = this.temp
        tempObject.position.copy(position);
        tempObject.updateMatrixWorld(true);
        globalPosition.copy(tempObject.getWorldPosition(new THREE.Vector3()));
    
        return globalPosition.y <= waterWorldPosition.y;
    }
    
    // Delegate to helper
    async generateThreeJsMesh(golem) {
        return generateThreeJsMesh(golem, this);
    }
    
    async boyrayNivra(nivra, info) {
        try {
            if(nivra.path && typeof(nivra.path) == "string") {
                var derech = nivra.path;
                
                if (nivra.path.startsWith('awtsmoos://')) {
                    var component = this.getComponent(nivra.path);
                    if (!component) {
                        console.warn(`B"H: Component "${nivra.path}" not found. Fallback to primitive.`);
                        var fallbackGolem = {
                            guf: { BoxGeometry: [1, 2, 1] },
                            toyr: { MeshLambertMaterial: { color: 0xff0000, wireframe: true } }
                        };
                        var mesh = await this.generateThreeJsMesh(fallbackGolem);
                        mesh.userData.error = true;
                        return mesh;
                    }
                    derech = component;
                }
    
                var gltf = null;
                var gltfAsset = this.$ga("GLTF/" + derech);
                
                if(0&&gltfAsset) { } else { 
                    try {
                        console.log(`B"H - Loading Model: ${derech}`);
                        gltf = await new Promise((r,j) => {
                            if (!derech || typeof derech !== 'string') {
                                j("Invalid model path (derech)");
                                return;
                            }

                            this.loader.load(derech, onloadParsed => { r(onloadParsed) },
                            async progress => {
                                var { loaded, total } = progress;
                                // Optional verbose progress logging
                            }, error => { 
                                console.error(`B"H - Error loading ${derech}:`, error); 
                                r(null); // Resolve null to prevent hang
                            });
                        })
                        console.log(`B"H - Model Loaded: ${derech}`);
                    } catch(e) { throw e; }
                }
                
                if(!gltf) {
                     console.warn("B\"H - Failed to load model for", nivra.name);
                     // Return empty object or fallback mesh?
                     // For now, throw to trigger fallback logic if wrapped, or return null
                     throw "Couldn't load model!";
                }
                
                if(!gltfAsset) this.setAsset("GLTF/"+derech, gltf);
                
                nivra.asset = gltf;
                var placeholders = {};
                var thingsToRemove = [];
                var materials = [];
                var totalChildren = 0;
    
                gltf.scene.traverse(child => { totalChildren++ });
                var boneChildren = {}, garments= {}, bodyParts = {};
                nivra.boneChildren = boneChildren;
                var currentChild = 0;

                gltf.scene.traverse(child => {
                    if(child.type == "Bone") boneChildren[child.name] = child;
                    if(child?.userData?.garment) garments[child.userData.garment] = child;
                    if(child?.userData?.["body-part"]) bodyParts[child.userData["body-part"]] = child;
                    
                    currentChild++;

                    child.nivraAwtsmoos = nivra;
                    
                    if(child.userData && child.userData.water) {
                        child.isWater = true;
                        this.ayshPeula("start water", child);
                    }
    
                    if(child.userData.meen == "land") {
                        if(!nivra.lands) nivra.lands = [];
                        nivra.lands.push(child)
                    }
    
                    if(child.userData && child.userData.action) {
                        var ac = this.actions[child.userData.action];
                        if(ac) {
                            if(!nivra.childrenWithActions) nivra.childrenWithActions = [];
                            nivra.childrenWithActions.push(ac);
                            child.awtsmoosAction = (player, nivra) => ac(player, nivra, this);
                        }
                    }

                    if(typeof(child.userData.placeholder) == "string") {
                        var { position, rotation, scale } = this.getTransformation(child);
                        if(!placeholders[child.userData.placeholder]) placeholders[child.userData.placeholder] = [];
                        var shlichus = child.userData.shlichus;
                        placeholders[child.userData.placeholder].push({
                            position, rotation, scale, mesh: child, addedTo: false,
                            ...(shlichus ? { shlichus } : {})
                        });
                        thingsToRemove.push(child);
                    }
    
                    if(typeof(child.userData.entity) == "string") {
                        this.saveEntityInNivra(child.userData.entity, nivra, child)
                        if(nivra.isSolid) child.isSolid = true;
                        child.isMesh = true;
                    }
    
                    if (child.isMesh && !child.isAwduhm && !child.isWater) {
                        this.objectsInScene.push(child);
                    } else if(child.isWater) {
                        this.water = child;
                        if(!this.waters) this.waters = [];
                        this.waters.push(child);
                    }
    
                    if(child.material) {
                        Utils.replaceMaterialWithLambert(child);
                        materials.push(child.material);
                        if(child.userData.invisible) child.material.visible = false;
                    }
                });
                
                if(Object.keys(bodyParts).length) nivra.bodyParts = bodyParts;
                if(Object.keys(garments).length) nivra.garments = garments;
                if(nivra.entities) this.nivrayimWithEntities.push(nivra);
                
                if(thingsToRemove.length) {
                    thingsToRemove.forEach(q => q.removeFromParent());
                    nivra.placeholders = placeholders;
                    this.nivrayimWithPlaceholders.push(nivra);
                }
    
                if(nivra.isSolid) {
                    nivra.needsOctreeChange = true;
                    nivra.on("changeOctreePosition", () => {
                        gltf.scene.traverse(child => {
                            if(!child.isMesh || child.isWater) return;
                            if(child.geometry) child.geometry.sourceMesh = child;
                            if(!child.userData) child.userData = {};
                            child.userData.isSolid = true;
                            if(!child.userData.itemData) {
                                child.userData.itemData = nivra.itemData || { id: "world_brick", className: "Brick", name: "Ancient Brick" };
                            }
                            if(!child.userData.notSolid) this.worldOctree.fromGraphNode(child);
                        })
                    });
    
                    if(nivra.lands) {
                        nivra.landOctree = new Octree();
                        nivra.lands.forEach(w => nivra.landOctree.fromGraphNode(w));
                    }
                }

                if(nivra.interactable) {
                    this.interactableNivrayim.push(nivra);
                    if(nivra.type != "chossid" && nivra.type != "customNpc" && nivra.type != "medabeir" && nivra.type != "chai") { 
                        nivra.needsOctreeChange = true;
                        nivra.on("changeOctreePosition", () => {
                            this.interactiveOctree.fromGraphNode(gltf.scene);
                        });
                    }
                }
    
                nivra.materials = materials;
                return gltf;
            } else {
                var golem = nivra.golem || {};
                var mesh = await this.generateThreeJsMesh(golem);
                mesh.name = nivra.name;
                
                if (nivra.position) mesh.position.copy(nivra.position.vector3());
                if (nivra.rotation) mesh.rotation.set(nivra.rotation.x || 0, nivra.rotation.y || 0, nivra.rotation.z || 0);
                if (nivra.scale) mesh.scale.copy(nivra.scale.vector3());
                
                mesh.updateMatrixWorld(true);
                if (nivra.isSolid) this.worldOctree.addObject(mesh);
                if (nivra.interactable && nivra.type !== "chossid") this.interactiveOctree.fromGraphNode(mesh);
                
                return mesh;
            }
        } catch(e) {
            console.log(e);
            throw e;
        }
    }
}
