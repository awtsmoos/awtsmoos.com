
import * as THREE from '/games/scripts/build/three.module.js';
import * as SkeletonUtils from '/games/scripts/jsm/utils/SkeletonUtils.js';
import Utils from '../../utils.js';
import BoneSanctifier from './boyrayNivra/BoneSanctifier.js';
import AttributeHealer from './boyrayNivra/AttributeHealer.js';
import generateThreeJsMesh from './helpers/generateMesh.js';

const LIVING_MODEL_HIDDEN_PARTS = new Set([
    'Camera',
    'Camera.001',
    'NurbsPath',
    'Plane.001',
    'Plane.002',
    'teeth',
    'tooth-distance'
]);

const LIVING_MODEL_HIDDEN_MATERIALS = new Set([
    'teffilinStrap'
]);

function hasHiddenAncestor(node) {
    let current = node;
    while (current) {
        if (LIVING_MODEL_HIDDEN_PARTS.has(current.name)) return true;
        current = current.parent;
    }
    return false;
}

function materialNameOf(node) {
    const material = Array.isArray(node.material) ? node.material[0] : node.material;
    return material?.name || '';
}

function shouldHideLivingPart(node) {
    return hasHiddenAncestor(node) ||
        LIVING_MODEL_HIDDEN_MATERIALS.has(materialNameOf(node));
}

/**
 * B"H
 * Marks a loaded living visual as a visual garment only, never as terrain for
 * the heavy physics octree. The capsule owns collision; the GLB reveals form,
 * animation, shadow, and click ownership without being baked into triangles.
 *
 * @param {THREE.Object3D} root
 * Root scene or mesh returned from the model loader.
 *
 * @param {object} nivra
 * Living entity that owns the model.
 *
 * @returns {void}
 */
function markLivingModel(root, nivra) {
    if (!root) return;
    if (!root.userData) root.userData = {};
    root.userData.isLiving = true;
    root.userData.skipOctree = true;
    root.userData.noOctree = true;
    root.nivraAwtsmoos = nivra;

    root.traverse?.(child => {
        if (!child.userData) child.userData = {};
        child.userData.isLiving = true;
        child.userData.skipOctree = true;
        child.userData.noOctree = true;
        if (nivra.type === "interactiveNpc") child.userData.isNpc = true;
        if (nivra.type === "chossid") child.userData.isPlayer = true;
        child.nivraAwtsmoos = nivra;
    });
}

/**
 * @file boyrayNivra.js
 * @description
 * ╔══════════════════════════════════════════════════════════════════════════╗
 * ║   CHAPTER 10: THE TEN UTTERANCES — THE ACT OF CREATION (BRIYAH)        ║
 * ╚══════════════════════════════════════════════════════════════════════════╝
 */

export default class {
    async boyrayNivra(nivra, info) {
        try {
            const isLivingType = nivra.type === "chossid" || 
                               nivra.type === "medabeir" || 
                               nivra.type === "customNpc" ||
                               nivra.type === "interactiveNpc";

            if (nivra.path && typeof nivra.path === "string") {
                let derech = nivra.path;
                if (derech.startsWith('awtsmoos://')) derech = this.getComponent(derech);
                if (!derech) return await generateThreeJsMesh({ guf: { BoxGeometry:[1, 1, 1] } }, this);

                const baseGltf = await this.loadGLTF(derech);
                if (!baseGltf || !baseGltf.scene) throw new Error(`Divine source missing for "${nivra.name}".`);

                let clonedScene;
                try {
                    clonedScene = SkeletonUtils.clone(baseGltf.scene);
                } catch(err) {
                    console.error(`B"H - 🚨 Clone failed for "${nivra.name}".`, err);
                    clonedScene = new THREE.Group(); 
                }

                const gltf = { scene: clonedScene, animations: baseGltf.animations, cameras: baseGltf.cameras };
                if (isLivingType) markLivingModel(clonedScene, nivra);

                const boneChildren = {};
                const garments = {};
                const materials =[];

                clonedScene.traverse(child => {
                    if (isLivingType && shouldHideLivingPart(child)) {
                        child.visible = false;
                    }

                    if (child.isMesh) {
                        child.castShadow = true;
                        child.receiveShadow = true;
                        
                        // B"H: Marking as living to shield from Octree triangle bake
                        if (isLivingType) {
                            child.userData.isLiving = true;
                            child.userData.skipOctree = true;
                            child.userData.noOctree = true;
                        }
                    }

                    BoneSanctifier.sanctify(child, boneChildren);
                    AttributeHealer.heal(child);

                    child.nivraAwtsmoos = nivra;

                    if (child.material) {
                        Utils.replaceMaterialWithLambert(child);
                        materials.push(child.material);
                    }
                    
                    if (child.userData && child.userData.garment) garments[child.userData.garment] = child;
                });

                nivra.boneChildren = boneChildren;
                nivra.materials = materials;
                nivra.garments = garments; 

                return gltf;
            } else {
                const golem = nivra.golem || { guf: { BoxGeometry: [1, 1, 1] } };
                const mesh = await generateThreeJsMesh(golem, this);
                mesh.name = nivra.name;
                mesh.nivraAwtsmoos = nivra;
                
                if (isLivingType) {
                    mesh.userData.isLiving = true;
                    mesh.userData.skipOctree = true;
                    mesh.userData.noOctree = true;
                }

                return mesh;
            }

        } catch (e) {
            console.error(`B"H - ⚡ boyrayNivra failed for [${nivra.name}]:`, e);
            return await generateThreeJsMesh({ guf: { BoxGeometry:[0.5, 0.5, 0.5] } }, this);
        }
    }
}
