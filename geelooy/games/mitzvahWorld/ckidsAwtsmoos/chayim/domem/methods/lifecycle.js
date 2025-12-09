



/**
 * B"H
 * @file lifecycle.js
 * Creation, instantiation, and destruction of the object.
 */
import * as THREE from '/games/scripts/build/three.module.js';
import Nivra from "../../nivra.js"; 
import Utils from '../../../utils.js';

export default {
    async heescheel(olam, info) {
        this.olam = olam;
        
        // B"H: Fix for super call in object literal mixin
        await Nivra.prototype.heescheel.call(this, olam);
        
        if(this.isTemplate) {
            return true;
        } else {
            try {
                var threeObj; 
                var res;
                try {
                    res = await olam.boyrayNivra(this, info);
                } catch(e) {
                    throw e;
                }

                if(res) {
                    threeObj = res;
                } else {
                    throw "issue";
                }
                
                if(threeObj) {
                    if(threeObj.scene) {
                        this.mesh = threeObj.scene;
                    } else if(threeObj) {
                        this.mesh = threeObj;
                    }

                    if(threeObj.animations) {
                        this.animations = threeObj.animations;
                    }

                    if(this.mesh) {
                        this.mesh.nivraAwtsmoos = this;
                        this.animationMixer = new THREE.AnimationMixer(this.mesh);
                        this.getChaweeyoos();

                        if(this.instanced) {
                            var geo = this.mesh.geometry || this.mesh.children[0].geometry;
                            if(geo && geo.isBufferGeometry) {
                                var mat = this.mesh.material || this.mesh.children[0].material;
                                if(mat) {
                                    var instancedMesh = new THREE.InstancedMesh(geo, mat, this.instanced);
                                    this.mesh = instancedMesh;
                                } else {
                                    this.instanced = false;
                                }
                            } else {
                                this.instanced = false;
                            }
                        }
                        
                        // B"H: Collect materials into an Object Map (Name -> Material)
                        // This allows O(1) access by name (e.g., this.materials['pants'])
                        if(!this.materials) this.materials = {};
                        
                        this.mesh.traverse(child => {
                            if(child.isMesh && child.material) {
                                const mats = Array.isArray(child.material) ? child.material : [child.material];
                                mats.forEach(m => {
                                    // Use the material name as the key. 
                                    // B"H: Assuming names are unique or last-write-wins is acceptable.
                                    if(m.name) {
                                        this.materials[m.name] = m;
                                    }
                                });
                            }
                        });
                    }

                    this.mesh.position.copy(this.position.vector3());
                    if(this.rotation) {
                        this.mesh.rotation.x = this.rotation.x;
                        this.mesh.rotation.y = this.rotation.y;
                        this.mesh.rotation.z = this.rotation.z;
                    }
                    if(this.scale) {
                        this.mesh.scale.copy(this.scale);
                    }
                    
                    await olam.hoyseef(this);
                    this.mesh.visible = this.visible;
                    
                    if (this.needsOctreeChange) {
                        this.ayshPeula("increase loading percentage", {
                            amount: 0,
                            nivra: this,
                            action: "Getting ready to add nivra " + this.name + " to Octree"
                        });
                        
                        if (this.path) {
                            this.ayshPeula("changeOctreePosition", this.position);
                        }
                    }
                    return true;
                }
                return false;
            } catch(e) {
                throw e;
            }
        }
    },

    moveMeshToSceneRetainPosition(mesh = null) {
        var mesh = mesh || this.mesh;
        var scene = this.olam?this.olam.scene:null;
        if(!scene || !mesh) return;

        mesh.updateMatrixWorld(true);
    
        const position = new THREE.Vector3();
        const quaternion = new THREE.Quaternion();
        const scale = new THREE.Vector3();
        mesh.matrixWorld.decompose(position, quaternion, scale);
    
        if (mesh.parent) {
            mesh.parent.remove(mesh);
        }
    
        scene.add(mesh);
    
        mesh.position.copy(position);
        mesh.quaternion.copy(quaternion);
        mesh.scale.copy(scale);
        mesh.updateMatrix();
    },

    setMesh(mesh) {
        this.mesh = mesh;
        this.mesh.nivraAwtsmoos = this;
        this.proximityCollider = null;
    },

    async madeAll(olam) {
        
    },

    async ready() {
        // B"H: Fix for super call in object literal mixin
        await Nivra.prototype.ready.call(this);
    },
    
    async afterBriyah() {
        // B"H: Fix for super call in object literal mixin
        await Nivra.prototype.afterBriyah.call(this);
        if(this.playAll) {
            this.heesHawveh = true;
            if(this.chaweeyoos)
                this.chaweeyoos.forEach(c => {
                    this.playChaweeyoos(c);
                });
        }
        if(this.methodsToCall) {
            this.olam.callMethods(this, this.methodsToCall);
        }
    }
};