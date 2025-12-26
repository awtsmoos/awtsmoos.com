// B"H
import * as THREE from '/games/scripts/build/three.module.js';
import { loadTextures, findTargetMesh, processPathObject } from './helpers.js';
import { getShader, TOTAL_VEC3_COUNT, MAX_SEGMENTS_FOR_SHADER } from './shader.js';

/**
 * TextureMixer - Elevating matter through the synthesis of textures.
 */
export default class TextureMixer {
    static async mix(nivra, options = {}) {
        console.group(`B"H [${nivra.name}] TextureMixer STARTING`);

        const {
            baseTexture,
            overlayTexture,
            repeatX = 1,
            repeatY = 1,
            childNameToSetItTo = null,
            textureScale = 0.05,
            pathChildName = null,
            feather = 5.0,
            intensity = 1.0,
            lowHeight = 0.0,
            highHeight = 10.0
        } = options;

        if (!baseTexture || !overlayTexture) {
            console.error("B\"H TextureMixer CRITICAL: Missing texture URLs.");
            console.groupEnd();
            return;
        }

        const textures = await loadTextures(nivra.olam, baseTexture, overlayTexture, repeatX, repeatY, nivra);
        if (!textures.base || !textures.overlay) {
            console.groupEnd();
            return;
        }

        const targetChild = findTargetMesh(nivra, childNameToSetItTo);
        if (!targetChild) {
            console.groupEnd();
            return;
        }

        const pathData = processPathObject(nivra, pathChildName, MAX_SEGMENTS_FOR_SHADER);
        
        // B"H: Fill remaining buffer with safe dummy vectors (under the ground)
        while(pathData.pathSegments.length < TOTAL_VEC3_COUNT) {
            pathData.pathSegments.push(new THREE.Vector3(0, -99999, 0));
        }

        const customMaterial = new THREE.MeshLambertMaterial(); 
        customMaterial.name = `MixedMaterial_${nivra.name}`;
        
        const shaderDef = getShader(
            textures.base, 
            textures.overlay, 
            repeatX, 
            repeatY, 
            textureScale, 
            pathData.usePathMixing, 
            feather, 
            intensity, 
            lowHeight, 
            highHeight, 
            pathData.pathSegments, 
            pathData.numActualSegments
        );

        customMaterial.onBeforeCompile = (shader) => {
            Object.assign(shader.uniforms, shaderDef.uniforms);
            shader.vertexShader = shaderDef.vertexShader;
            shader.fragmentShader = shaderDef.fragmentShader;
        };

        targetChild.material = customMaterial;
        targetChild.material.needsUpdate = true;
        
        console.log("B\"H Texture Mixer Manifested Successfully.");
        console.groupEnd();
    }
}
