
/**
 * @file lifecycle.js (domem)
 * @description
 * ╔══════════════════════════════════════════════════════════════════════════╗
 * ║   CHAPTER 9: CREATION, INSTANTIATION, AND DESTRUCTION                  ║
 * ║                                                                          ║
 * ║  THE TIKKUN OF THE THREAD-LOCK & THE SHIELD OF THE SOUL                 ║
 * ║  The player (Chossid/Chai) tests its collisions AGAINST the Octree,    ║
 * ║  it must never be baked INTO the Octree. This causes infinite recursion.║
 * ╚══════════════════════════════════════════════════════════════════════════╝
 */

import * as THREE from '/games/scripts/build/three.module.js';
import Nivra from "../../nivra.js";

function safeMeshTraverse(node, callback) {
    if (!node || typeof callback !== 'function') return;
    callback(node);
    if (!node.children || !Array.isArray(node.children)) return;
    for (const child of node.children) {
        if (child != null) safeMeshTraverse(child, callback);
    }
}

export default {
    async heescheel(olam, info) {
        const _s = performance.now();
        console.log(`B"H - ⏱️ [${this.name}] ENTERING heescheel()`);
        
        this.olam = olam;

        await Nivra.prototype.heescheel.call(this, olam);

        if (this.isTemplate) return true;

        try {
            let threeObj;

            const _boyrayStart = performance.now();
            try {
                threeObj = await olam.boyrayNivra(this, info);
            } catch(e) { throw e; }
            console.log(`B"H - ⏱️ [${this.name}] boyrayNivra Returned! Took[${(performance.now() - _boyrayStart).toFixed(1)}ms]`);

            if (!threeObj) throw new Error(`boyrayNivra returned null/undefined for "${this.name}"`);

            if (threeObj.scene) this.mesh = threeObj.scene;
            else this.mesh = threeObj;

            if (threeObj.animations) this.animations = threeObj.animations;

            if (this.mesh) {
                this.mesh.nivraAwtsmoos = this;
                this.animationMixer = new THREE.AnimationMixer(this.mesh);
                this.getChaweeyoos();

                if (this.instanced) {
                    const geo = this.mesh.geometry || (this.mesh.children[0] && this.mesh.children[0].geometry);
                    if (geo && geo.isBufferGeometry) {
                        const mat = this.mesh.material || (this.mesh.children[0] && this.mesh.children[0].material);
                        if (mat) this.mesh = new THREE.InstancedMesh(geo, mat, this.instanced);
                        else this.instanced = false;
                    } else this.instanced = false;
                }

                if (!this.materials) this.materials = {};

                safeMeshTraverse(this.mesh, child => {
                    if (child && child.isMesh && child.material) {
                        const mats = Array.isArray(child.material) ? child.material : [child.material];
                        mats.forEach(m => {
                            if (m && m.name) this.materials[m.name] = m;
                        });
                    }
                });
            }

            // B"H: ABSOLUTE ALIGNMENT
            if (this.position) this.mesh.position.copy(this.position.vector3());

            if (this.rotation) {
                this.mesh.rotation.x = this.rotation.x;
                this.mesh.rotation.y = this.rotation.y;
                this.mesh.rotation.z = this.rotation.z;
            }

            if (this.scale) {
                this.mesh.scale.copy(this.scale.vector3());
            }
            
            this.mesh.updateMatrixWorld(true);

            await olam.hoyseef(this);
            this.mesh.visible = this.visible;

            // B"H: THE TIKKUN OF THE SOUL (Player Shield)
            // A player (chossid) or living soul (chai) tests its capsule against the 
            // static world. We NEVER insert it into the Octree matrices.
            const isPlayerOrAnimal = this.type === "chossid" || this.type === "chai";

            if (isPlayerOrAnimal) {
                 console.log(`B"H - 🛡️ [${this.name}] Entity is an Avatar. Bypassing Octree index generation. It moves independently.`);
            } else {
                // STATIC PHYSICS OCTREE
                if (this.isSolid && olam.worldOctree) {
                    if (this.path && typeof this.path === "string") {
                        olam.worldOctree.fromGraphNode(this.mesh);
                    } else {
                        olam.worldOctree.addObject(this.mesh);
                    }
                }

                // DYNAMIC INTERACTIVE OCTREE
                if (this.interactable && olam.interactiveOctree) {
                    let hasSkinnedMesh = false;
                    this.mesh.traverse(c => { if(c.isSkinnedMesh) hasSkinnedMesh = true; });

                    // B"H: NPCs might be interactable, but we shield the system using low-poly cylinders
                    if (hasSkinnedMesh || this.type === "medabeir" || this.type === "customNpc") {
                        console.log(`B"H - 🛡️ [${this.name}] Generating low-poly bounding cylinder proxy for NPC interaction.`);
                        const pGeo = new THREE.CylinderGeometry(0.5, 0.5, 2.0, 8);
                        const proxy = new THREE.Mesh(pGeo, new THREE.MeshBasicMaterial());
                        proxy.position.copy(this.mesh.position);
                        proxy.userData = { visualReference: this.mesh, isProxy: true };
                        proxy.nivraAwtsmoos = this;
                        proxy.updateMatrixWorld(true);
                        
                        olam.interactiveOctree.fromGraphNode(proxy);
                    } else {
                        olam.interactiveOctree.fromGraphNode(this.mesh);
                    }
                }
            }

            if (this.needsOctreeChange && this.path) {
                this.ayshPeula("changeOctreePosition", this.position);
            }

            console.log(`B"H - 🌟 [${this.name}] HEESCHEEL FULLY COMPLETE. Total Time:[${(performance.now() - _s).toFixed(1)}ms]`);
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
        this.proximityCollider = null;
    },

    async sealayk() {
        if (this.mesh) {
            if (this.mesh.parent) this.mesh.parent.remove(this.mesh);
        }
        this.ayshPeula("sealayk");
    }
};
