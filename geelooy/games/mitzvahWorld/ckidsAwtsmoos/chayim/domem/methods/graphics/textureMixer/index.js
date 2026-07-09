// B"H
import * as THREE from "/games/mitzvahWorld/systems/three/AwtsmoosThreeGateway.js";

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

        // B"H: silent

        // B"H: silent


        const bTexUrl = nivra.olam.$gc(baseTexture) || baseTexture;
        // B"H: silent

        
        let base = null;
        try {
            if (bTexUrl) {
                base = await nivra.olam.loadTexture({ url: bTexUrl, shouldRepeat: true, repeatX: options.repeatX || 1, repeatY: options.repeatY || 1, nivra });
                if (base) {
                    base.wrapS = base.wrapT = THREE.RepeatWrapping;
                    base.needsUpdate = true;
                    // B"H: silent

                } else {
                    console.warn(`B"H [TextureMixer] Texture Load Returned Null.`);
                }
            } else {
                console.warn(`B"H [TextureMixer] No URL resolved for base texture.`);
            }
        } catch (e) {
            console.warn("B\"H TextureMixer: Base texture failed exception.", e);
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

        if (!targetChild) {
            console.warn(`B"H [TextureMixer] Target child '${childNameToSetItTo}' not found in ${nivra.name}.`);
            return;
        }

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
        
        // B"H: silent

    }
}