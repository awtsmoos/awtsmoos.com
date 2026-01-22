// B"H
/**
 * lifecycle.js - Creation, instantiation, and destruction of the object.
 * Refined to ensure unique clones are correctly assigned and logged.
 */
import * as THREE from '/games/scripts/build/three.module.js';
import Nivra from "../../nivra.js"; 
import Utils from '../../../utils.js';

export default {
    async heescheel(olam, info) {
        this.olam = olam;
        
        console.log(`B"H - Lifecycle: heescheel pulse for ${this.name} (${this.type})...`);
        
        // B"H: Fix for super call in object literal mixin
        await Nivra.prototype.heescheel.call(this, olam);
        
        if(this.isTemplate) {
            console.log(`B"H - ${this.name} is a template, skipping physical forge.`);
            return true;
        } else {
            try {
                let res;
                try {
                    res = await olam.boyrayNivra(this, info);
                } catch(e) {
                    throw e;
                }

                if(!res) {
                    throw new Error(`B"H - The forge produced no result for ${this.name}`);
                }
                
                /**
                 * B"H: Package Awareness
                 * boyrayNivra returns either a package {scene, animations} or a direct Mesh.
                 */
                if (res.scene) {
                    console.log(`B"H - Attaching unique mesh clone to soul: ${this.name}`);
                    this.mesh = res.scene;
                    this.animations = res.animations || [];
                } else {
                    console.log(`B"H - Attaching primitive mesh to soul: ${this.name}`);
                    this.mesh = res;
                }

                if (this.mesh) {
                    this.mesh.nivraAwtsmoos = this;
                    this.animationMixer = new THREE.AnimationMixer(this.mesh);
                    this.getChaweeyoos();

                    // B"H: Collect materials for direct named access
                    if(!this.materials) this.materials = {};
                    this.mesh.traverse(child => {
                        if(child.isMesh && child.material) {
                            const mats = Array.isArray(child.material) ? child.material : [child.material];
                            mats.forEach(m => {
                                if(m.name) this.materials[m.name] = m;
                            });
                        }
                    });

                    // Initial Transformation
                    this.mesh.position.copy(this.position.vector3());
                    if(this.rotation) {
                        this.mesh.rotation.x = this.rotation.x;
                        this.mesh.rotation.y = this.rotation.y;
                        this.mesh.rotation.z = this.rotation.z;
                    }
                    if(this.scale) {
                        this.mesh.scale.copy(this.scale.vector3());
                    }
                    
                    console.log(`B"H - Adding ${this.name} to the collective Olam...`);
                    await olam.hoyseef(this);
                    
                    this.mesh.visible = this.visible;
                    
                    if (this.needsOctreeChange) {
                        console.log(`B"H - Requesting spatial update for ${this.name}...`);
                        this.ayshPeula("changeOctreePosition", this.position);
                    }
                    return true;
                }
                return false;
            } catch(e) {
                console.error(`B"H - Physical Manifestation Error for ${this.name}:`, e);
                throw e;
            }
        }
    },

    moveMeshToSceneRetainPosition(mesh = null) {
        var mesh = mesh || this.mesh;
        var scene = this.olam ? this.olam.scene : null;
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
        console.log(`B"H - Manually anchoring mesh for ${this.name}`);
        this.mesh = mesh;
        this.mesh.nivraAwtsmoos = this;
        this.proximityCollider = null;
    },

    async madeAll(olam) {
        console.log(`B"H - Logical sync complete for ${this.name}.`);
    },

    async ready() {
        console.log(`B"H - ${this.name} is fully manifest and standing in the Light.`);
        await Nivra.prototype.ready.call(this);
    },
    
    async afterBriyah() {
        await Nivra.prototype.afterBriyah.call(this);
        if(this.playAll) {
            this.heesHawveh = true;
            if(this.chaweeyoos) {
                this.chaweeyoos.forEach(c => {
                    this.playChaweeyoos(c);
                });
            }
        }
        if(this.methodsToCall) {
            this.olam.callMethods(this, this.methodsToCall);
        }
    }
};
