import * as THREE from '/games/scripts/build/three.module.js';
import * as SkeletonUtils from '/games/scripts/jsm/utils/SkeletonUtils.js';
import Utils from '../../utils.js';
import BoneSanctifier from './boyrayNivra/BoneSanctifier.js';
import AttributeHealer from './boyrayNivra/AttributeHealer.js';
import generateThreeJsMesh from './helpers/generateMesh.js';

/**
 * @file boyrayNivra.js
 * @description
 * ╔══════════════════════════════════════════════════════════════════════════╗
 * ║   CHAPTER 10: THE TEN UTTERANCES — THE ACT OF CREATION (BRIYAH)        ║
 * ║   (Equipped with ultra-verbose timing analytics)                         ║
 * ╚══════════════════════════════════════════════════════════════════════════╝
 */

function sanitizeHierarchy(node) {
    if (!node) return;
    if (node.children && Array.isArray(node.children)) {
        node.children = node.children.filter(c => c != null);
        for (const child of node.children) sanitizeHierarchy(child);
    }
}

function safeTraverse(node, callback) {
    if (!node || typeof callback !== 'function') return;
    try { callback(node); } catch(e) { console.warn("B\"H - Traversal skip:", e); }
    
    if (!node.children || !Array.isArray(node.children)) return;
    for (const child of node.children) {
        if (child != null) safeTraverse(child, callback);
    }
}

export default class {
    async boyrayNivra(nivra, info) {
        try {
            if (nivra.path && typeof nivra.path === "string") {
                let derech = nivra.path;
                if (derech.startsWith('awtsmoos://')) derech = this.getComponent(derech);

                if (!derech) return await generateThreeJsMesh({ guf: { BoxGeometry:[1, 1, 1] } }, this);

                const _tLoad = performance.now();
                console.log(`B"H - 🧪 [boyrayNivra]: Requesting GLTF Payload for [${nivra.name}] from cache/net...`);
                const baseGltf = await this.loadGLTF(derech);
                console.log(`B"H - 🧪 [boyrayNivra]: GLTF Payload Resolved.[${(performance.now()-_tLoad).toFixed(1)}ms]`);
                
                if (!baseGltf || !baseGltf.scene) throw new Error(`Divine source missing for "${nivra.name}".`);

                const _tClone = performance.now();
                console.log(`B"H - 🧪 [boyrayNivra]: Executing SkeletonUtils.clone() for [${nivra.name}]...`);
                let clonedScene;
                try {
                    clonedScene = SkeletonUtils.clone(baseGltf.scene);
                    if (!clonedScene) throw new Error("Null return from SkeletonUtils");
                } catch(err) {
                    console.error(`B"H - 🚨 Clone failed for "${nivra.name}". Using void fallback.`, err);
                    clonedScene = new THREE.Group(); 
                }
                console.log(`B"H - 🧪[boyrayNivra]: Clone Execution Complete. [${(performance.now()-_tClone).toFixed(1)}ms]`);

                const _tTrav = performance.now();
                console.log(`B"H - 🧪 [boyrayNivra]: Traversing and healing bones & materials...`);
                
                sanitizeHierarchy(clonedScene);

                const gltf = { scene: clonedScene, animations: baseGltf.animations, cameras: baseGltf.cameras };
                const boneChildren = {};
                const garments = {};
                const materials =[];

                safeTraverse(clonedScene, child => {
                    if (child.isPoints || child.isLine) {
                        child.removeFromParent();
                        return;
                    }

                    if (child.isMesh) {
                        child.castShadow = false;
                        child.receiveShadow = false;
                    }

                    BoneSanctifier.sanctify(child, boneChildren);
                    AttributeHealer.heal(child);

                    child.nivraAwtsmoos = nivra;

                    if (child.material) {
                        Utils.replaceMaterialWithLambert(child);
                        materials.push(child.material);
                    }
                    
                    if (child.userData && child.userData.garment) garments[child.userData.garment] = child;
                    if (child.userData && child.userData.placeholder) this.registerPlaceholder(child, nivra);
                });

                console.log(`B"H - 🧪 [boyrayNivra]: Traversal Complete.[${(performance.now()-_tTrav).toFixed(1)}ms]`);

                nivra.boneChildren = boneChildren;
                nivra.materials = materials;
                nivra.garments = garments; 

                return gltf;
            } else {
                const golem = nivra.golem || { guf: { BoxGeometry: [1, 1, 1] } };
                golem.name = nivra.name;
                
                console.log(`B"H - 🧪 [boyrayNivra]: Generating procedural Mesh for[${nivra.name}]...`);
                const mesh = await generateThreeJsMesh(golem, this);
                mesh.name = nivra.name;
                mesh.nivraAwtsmoos = nivra;

                mesh.castShadow = false;
                mesh.receiveShadow = false;

                return mesh;
            }

        } catch (e) {
            console.error(`B"H - ⚡ ACT OF CREATION FAILED for [${nivra.name}]:`, e);
            return await generateThreeJsMesh({ guf: { BoxGeometry:[0.5, 0.5, 0.5] } }, this);
        }
    }

    registerPlaceholder(child, nivra) {
        const name = child.userData.placeholder;
        if (!nivra.placeholders) nivra.placeholders = {};
        if (!nivra.placeholders[name]) nivra.placeholders[name] =[];
        const trans = this.getTransformation(child);
        nivra.placeholders[name].push({ ...trans, mesh: child, addedTo: false });
        child.visible = false;
    }
}