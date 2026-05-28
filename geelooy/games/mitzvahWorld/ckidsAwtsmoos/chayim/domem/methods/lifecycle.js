
/**
 * @file lifecycle.js (domem)
 * @description
 * ╔══════════════════════════════════════════════════════════════════════════╗
 * ║   CHAPTER 9: CREATION, INSTANTIATION, AND DESTRUCTION                  ║
 * ╚══════════════════════════════════════════════════════════════════════════╝
 */

import * as THREE from '/games/scripts/build/three.module.js';
import Nivra from "../../nivra.js";

/**
 * B"H
 * Separates living vessels from static geometry. Living render models are
 * never fed to world or interactive octree baking; their capsules/proxies carry
 * gameplay while the GLB stays a visual garment.
 *
 * @param {object} nivra
 * Entity instance.
 *
 * @returns {boolean}
 * True for player/NPC/mobile living objects.
 */
function isLivingNivra(nivra) {
    return nivra?.type === "chossid" ||
        nivra?.type === "chai" ||
        nivra?.type === "medabeir" ||
        nivra?.type === "customNpc" ||
        nivra?.type === "interactiveNpc";
}

/**
 * B"H
 * Marks a tree as visual-only living matter so octree intake can reject every
 * descendant without needing to understand game classes.
 *
 * @param {THREE.Object3D} mesh
 * Render root.
 *
 * @returns {void}
 */
function markLivingTree(mesh) {
    if (!mesh) return;
    if (!mesh.userData) mesh.userData = {};
    mesh.userData.isLiving = true;
    mesh.userData.skipOctree = true;
    mesh.userData.noOctree = true;
    mesh.traverse?.(child => {
        if (!child.userData) child.userData = {};
        child.userData.isLiving = true;
        child.userData.skipOctree = true;
        child.userData.noOctree = true;
    });
}

/**
 * B"H
 * Fits any loaded living GLB to its capsule-scale body once. This keeps NPCs
 * and the player from entering the world at the remote model's native giant
 * dimensions while preserving the collision capsule as the only physics body.
 *
 * @param {THREE.Object3D} mesh
 * Living render root.
 *
 * @param {object} nivra
 * Entity that owns the render root.
 *
 * @returns {void}
 */
function fitLivingTreeToHeight(mesh, nivra) {
    if (!mesh?.isObject3D) return;
    if (!mesh.userData) mesh.userData = {};
    if (mesh.userData.livingModelFitted) return;

    const targetHeight = Number(nivra?.visualHeight) ||
        Number(nivra?.originalOptions?.visualHeight) ||
        Number(nivra?.height) ||
        1.85;

    mesh.updateWorldMatrix(true, true);
    const box = new THREE.Box3().setFromObject(mesh);
    const size = box.getSize(new THREE.Vector3());
    if (Number.isFinite(size.y) && size.y > 0.001 && targetHeight > 0) {
        const scalar = targetHeight / size.y;
        if (Number.isFinite(scalar) && scalar > 0.00001 && scalar < 1000) {
            mesh.scale.multiplyScalar(scalar);
        }
    }

    mesh.updateWorldMatrix(true, true);
    const fittedBox = new THREE.Box3().setFromObject(mesh);
    const rootY = mesh.getWorldPosition(new THREE.Vector3()).y;
    const offset = rootY - fittedBox.min.y;
    mesh.userData.visualGroundOffsetY = Number.isFinite(offset) ? offset : 0;
    mesh.userData.livingModelFitted = true;
}

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

            const isLiving = isLivingNivra(this);

            if (isLiving) {
                fitLivingTreeToHeight(this.mesh, this);
                markLivingTree(this.mesh);
            } else {
                if (this.isSolid && olam.worldOctree) {
                    olam.worldOctree.addObject(this.mesh);
                }
            }

            if (this.interactable && !isLiving && olam.interactiveOctree) {
                // B"H: Static interactables may enter the interactive octree.
                // Living beings keep their render mesh separate from spatial baking.
                if (this.mesh?.isMesh && this.mesh?.geometry) {
                    olam.interactiveOctree.addObject(this.mesh);
                } else if (olam.interactiveOctree.fromGraphNode) {
                    olam.interactiveOctree.fromGraphNode(this.mesh);
                }
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
