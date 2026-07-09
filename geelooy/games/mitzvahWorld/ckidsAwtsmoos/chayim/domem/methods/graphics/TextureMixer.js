// B"H
import * as THREE from "/games/mitzvahWorld/systems/three/AwtsmoosThreeGateway.js";

/**
 * TextureMixer - Synthesis of the Earthly and the Heavenly.
 * B"H: SAFE MODE FORCED.
 * Disables all custom shaders and path mixing. 
 * Simply applies the base texture to the target mesh.
 */
export default class TextureMixer {
    /**
     * mix - The act of combining textures into a unified visual vessel.
     */
    static async mix(nivra, options = {}) {
        const {
            baseTexture,
            overlayTexture,
            repeatX = 1,
            repeatY = 1,
            childNameToSetItTo = null
        } = options;

        if (!nivra.olam) return;

        // B"H: silent


        // 1. Resolve and Load Textures with FALLBACK
        const bTexUrl = nivra.olam.$gc(baseTexture) || baseTexture;
        
        let base = null;
        try {
            if (bTexUrl) {
                base = await nivra.olam.loadTexture({ url: bTexUrl, shouldRepeat: true, repeatX, repeatY, nivra });
                if (base) {
                    base.wrapS = base.wrapT = THREE.RepeatWrapping;
                    base.needsUpdate = true;
                }
            }
        } catch (e) {
            console.warn("B\"H TextureMixer: Base texture failed.", e);
        }

        // 2. Find the target landscape mesh
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

        // 3. Create Standard Material (NO CUSTOM SHADERS)
        // This completely avoids 'undefined length' errors from array uniforms.
        const simpleMaterial = new THREE.MeshLambertMaterial({
            map: base,
            color: base ? 0xffffff : 0x885533 // White if texture exists, Earthy brown if not
        });

        // B"H: Preserve side property
        if (targetChild.material) {
            simpleMaterial.side = targetChild.material.side || THREE.FrontSide;
        }

        targetChild.material = simpleMaterial;
        targetChild.material.needsUpdate = true;
        targetChild.userData.isTerrain = true;
        
        // B"H: silent

    }
}