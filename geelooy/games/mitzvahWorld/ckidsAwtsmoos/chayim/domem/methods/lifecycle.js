
/**
 * @file lifecycle.js (domem)
 * @description
 * ╔══════════════════════════════════════════════════════════════════════════╗
 * ║   CHAPTER 9: CREATION, INSTANTIATION, AND DESTRUCTION                  ║
 * ╚══════════════════════════════════════════════════════════════════════════╝
 */

import * as THREE from '/games/scripts/build/three.module.js';
import Nivra from "../../nivra.js";

export default {
    async heescheel(olam, info) {
        this.olam = olam;
        await Nivra.prototype.heescheel.call(this, olam);

        if (this.isTemplate) {
            return true;
        }

        try {
            let threeObj;

            try {
                threeObj = await olam.boyrayNivra(this, info);
            } catch(e) { throw e; }
            
            if (!threeObj) throw new Error(`boyrayNivra returned null for "${this.name}"`);

            if (threeObj.scene) this.mesh = threeObj.scene;
            else this.mesh = threeObj;

            if (threeObj.animations) this.animations = threeObj.animations;

            if (this.mesh) {
                this.mesh.nivraAwtsmoos = this;
                this.animationMixer = new THREE.AnimationMixer(this.mesh);
                this.getChaweeyoos();

                this.mesh.traverse(child => {
                    if (child.isMesh) {
                        if (child.geometry && child.geometry.boundingBox) {
                            const size = new THREE.Vector3();
                            child.geometry.boundingBox.getSize(size);
                            if (size.x > 300 || size.z > 300) {
                                child.frustumCulled = false;
                            }
                        }
                        
                        if (child.material) {
                            const mats = Array.isArray(child.material) ? child.material : [child.material];
                            mats.forEach(m => {
                                m.visible = true; 
                                if (m.name && this.materials) this.materials[m.name] = m;
                            });
                        }
                    }
                });
            }

            if (this.position) this.mesh.position.copy(this.position.vector3());
            if (this.rotation) this.mesh.rotation.set(this.rotation.x, this.rotation.y, this.rotation.z);
            if (this.scale) this.mesh.scale.copy(this.scale.vector3());
            
            this.mesh.updateMatrixWorld(true);

            await olam.hoyseef(this);
            this.mesh.visible = this.visible;

            const isLiving = this.type === "chossid" || 
                           this.type === "chai" || 
                           this.type === "medabeir" ||
                           this.type === "customNpc";

            if (isLiving) {
                 this.mesh.userData.isLiving = true; 
            } else {
                if (this.isSolid && olam.worldOctree) {
                    olam.worldOctree.addObject(this.mesh);
                }
            }

            if (this.interactable && !isLiving && olam.interactiveOctree) {
                // B"H: Static interactables may enter the interactive octree.
                // Living beings keep their render mesh separate from spatial baking.
                olam.interactiveOctree.addObject(this.mesh);
            }

            return true;

        } catch(e) {
            console.error(`B"H - 🚨 [${this.name}] FATAL ERROR in heescheel:`, e);
            throw e;
        }
    },

    moveMeshToSceneRetainPosition(mesh = null) {
        const target = mesh || this.mesh;
        const scene = this.olam ? this.olam.scene : null;
        if (!scene || !target) return;
        target.updateMatrixWorld(true);
        const position = new THREE.Vector3();
        const quaternion = new THREE.Quaternion();
        const scale = new THREE.Vector3();
        target.matrixWorld.decompose(position, quaternion, scale);
        if (target.parent) target.parent.remove(target);
        scene.add(target);
        target.position.copy(position);
        target.quaternion.copy(quaternion);
        target.scale.copy(scale);
        target.updateMatrix();
    },

    setMesh(mesh) {
        this.mesh = mesh;
        this.mesh.nivraAwtsmoos = this;
    },

    async sealayk() {
        if (this.mesh) {
            if (this.mesh.parent) this.mesh.parent.remove(this.mesh);
        }
        this.ayshPeula("sealayk");
    }
};
