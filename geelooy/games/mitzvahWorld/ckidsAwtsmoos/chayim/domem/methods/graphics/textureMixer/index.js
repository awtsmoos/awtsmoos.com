// B"H
import * as THREE from '/games/scripts/build/three.module.js';

/**
 * TextureMixer - Synthesis of the Earthly and the Heavenly.
 * B"H: SAFE MODE FORCED.
 * Disables all custom shaders and path mixing. 
 * Simply applies the base texture to the target mesh.
 */
export default class TextureMixer {
    static async mix(nivra, options = {}) {
        const { baseTexture, childNameToSetItTo = null } = options;

        if (!nivra.olam) return;

        console.log(`B"H [TextureMixer] SAFE MODE: Applying simple texture to ${nivra.name}`);

        const bTexUrl = nivra.olam.$gc(baseTexture) || baseTexture;
        
        let base = null;
        try {
            if (bTexUrl) {
                base = await nivra.olam.loadTexture({ url: bTexUrl, shouldRepeat: true, repeatX: options.repeatX || 1, repeatY: options.repeatY || 1, nivra });
                if (base) {
                    base.wrapS = base.wrapT = THREE.RepeatWrapping;
                    base.needsUpdate = true;
                }
            }
        } catch (e) {
            console.warn("B\"H TextureMixer: Base texture failed.", e);
        }

        let targetChild = null;
        if (childNameToSetItTo && nivra.mesh) {
            nivra.mesh.traverse((child) => {
                if (!targetChild && child.isMesh && child.name.includes(childNameToSetItTo)) {
                    targetChild = child;
                }
            });
        }
        
        if (!targetChild && nivra.mesh) {
             nivra.mesh.traverse(c => {
                if(!targetChild && c.isMesh && (c.name.toLowerCase().includes("land") || c.name.toLowerCase().includes("landscape"))) {
                    targetChild = c;
                }
             });
        }

        if (!targetChild) return;

        // B"H: Use Lambert Material (No custom shaders)
        const simpleMaterial = new THREE.MeshLambertMaterial({
            map: base,
            color: base ? 0xffffff : 0x885533
        });

        if (targetChild.material) {
            simpleMaterial.side = targetChild.material.side || THREE.FrontSide;
        }

        targetChild.material = simpleMaterial;
        targetChild.material.needsUpdate = true;
        targetChild.userData.isTerrain = true;
    }
}