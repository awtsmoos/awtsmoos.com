
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
        const _s = performance.now();
        const label = `[${this.name}]`;
        console.log(`B"H - ⏱️ ${label} ENTERING heescheel()`);
        
        this.olam = olam;

        await Nivra.prototype.heescheel.call(this, olam);

        if (this.isTemplate) {
            return true;
        }

        try {
            let threeObj;

            const _boyrayStart = performance.now();
            try {
                threeObj = await olam.boyrayNivra(this, info);
            } catch(e) { throw e; }
            
            console.log(`B"H - ⏱️ ${label} boyrayNivra Returned! Took[${(performance.now() - _boyrayStart).toFixed(1)}ms]`);

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
                        // B"H: ABSOLUTE VISIBILITY FOR THE FOUNDATION
                        // If it's a huge ground mesh, we force it to NOT cull.
                        if (child.geometry && child.geometry.boundingBox) {
                            const size = new THREE.Vector3();
                            child.geometry.boundingBox.getSize(size);
                            if (size.x > 300 || size.z > 300) {
                                child.frustumCulled = false;
                                console.log(`B"H - 🌍 ${label} Terrain identified. Frustum culling DISABLED.`);
                            }
                        }
                        
                        if (child.material) {
                            const mats = Array.isArray(child.material) ? child.material : [child.material];
                            mats.forEach(m => {
                                m.visible = true; // Ensure visibility
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
                    console.log(`B"H - ⚓ ${label} Solidifying in Static Octree...`);
                    olam.worldOctree.addObject(this.mesh);
                }
            }

            if (this.interactable && olam.interactiveOctree) {
                if (isLiving) {
                    const pGeo = new THREE.CylinderGeometry(0.8, 0.8, 2.5, 8);
                    const proxy = new THREE.Mesh(pGeo, new THREE.MeshBasicMaterial({ visible: false }));
                    proxy.position.copy(this.mesh.position);
                    proxy.userData = { visualReference: this.mesh, isProxy: true };
                    proxy.nivraAwtsmoos = this;
                    proxy.updateMatrixWorld(true);
                    olam.interactiveOctree.addObject(proxy);
                } else {
                    olam.interactiveOctree.addObject(this.mesh);
                }
            }

            console.log(`B"H - 🌟 ${label} HEESCHEEL COMPLETE. Total Time:[${(performance.now() - _s).toFixed(1)}ms]`);
            return true;

        } catch(e) {
            console.error(`B"H - 🚨 ${label} FATAL ERROR in heescheel:`, e);
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
