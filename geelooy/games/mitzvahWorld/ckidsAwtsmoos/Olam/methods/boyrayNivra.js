
import * as THREE from '/games/scripts/build/three.module.js';
import * as SkeletonUtils from '/games/scripts/jsm/utils/SkeletonUtils.js';
import Utils from '../../utils.js';
import BoneSanctifier from './boyrayNivra/BoneSanctifier.js';
import AttributeHealer from './boyrayNivra/AttributeHealer.js';
import generateThreeJsMesh from './helpers/generateMesh.js';
import { loadFreshChossidGltf } from '../worlds/mitzvahWorld/npcs/ChossidNpcLoader.js';
import { cloneChossidNpcScene } from '../worlds/mitzvahWorld/npcs/ChossidNpcClone.js';

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
                               nivra.type === "customNpc";

            if (nivra.path && typeof nivra.path === "string") {
                let derech = nivra.path;
                if (derech.startsWith('awtsmoos://')) derech = this.getComponent(derech);
                if (!derech) return await generateThreeJsMesh({ guf: { BoxGeometry:[1, 1, 1] } }, this);

                if (nivra.type === "chossid") {
                    const playerBlock = await generateThreeJsMesh({
                        guf: { BoxGeometry: [0.8, 1.6, 0.8] },
                        toyr: { MeshLambertMaterial: { color: 0x1f6fff } }
                    }, this);
                    playerBlock.name = nivra.name || "Chossid_Player_Test_Block";
                    playerBlock.geometry?.translate?.(0, 0.8, 0);
                    playerBlock.updateMatrixWorld(true);
                    playerBlock.userData.isLiving = true;
                    playerBlock.nivraAwtsmoos = nivra;
                    return playerBlock;
                }

                if (nivra.type === "__never_player_glb" && derech.includes("chossid.glb")) {
                    const npcGltf = await loadFreshChossidGltf(this);
                    const scene = cloneChossidNpcScene(npcGltf);
                    return {
                        scene,
                        animations: npcGltf.animations || npcGltf.scene?.animations || [],
                        cameras: npcGltf.cameras || []
                    };
                }

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
                }

                return mesh;
            }

        } catch (e) {
            console.error(`B"H - ⚡ boyrayNivra failed for [${nivra.name}]:`, e);
            return await generateThreeJsMesh({ guf: { BoxGeometry:[0.5, 0.5, 0.5] } }, this);
        }
    }
}
