
// B"H
import * as THREE from '/games/scripts/build/three.module.js';
import { loadTextures, findTargetMesh, processPathObject } from './helpers.js';
import { getShader, TOTAL_VEC3_COUNT, MAX_SEGMENTS_FOR_SHADER } from './shader.js';

export default class TextureMixer {
    static async mix(nivra, options = {}) {
        console.group(`B"H [${nivra.name}] TextureMixer STARTING`);
        console.log("B\"H TextureMixer Input Options:", JSON.stringify(options, null, 2));

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

        console.log("B\"H TextureMixer: Loading textures...");
        const textures = await loadTextures(nivra.olam, baseTexture, overlayTexture, repeatX, repeatY, nivra);
        
        if (!textures.base || !textures.overlay) {
            console.error("B\"H TextureMixer CRITICAL: Failed to load one or both textures.", textures);
            console.groupEnd();
            return;
        }
        console.log("B\"H TextureMixer: Textures loaded successfully.", textures);

        console.log(`B"H TextureMixer: Finding target mesh '${childNameToSetItTo}'...`);
        const targetChild = findTargetMesh(nivra, childNameToSetItTo);
        if (!targetChild) {
            console.error(`B"H TextureMixer CRITICAL: Target child '${childNameToSetItTo}' not found.`);
            console.groupEnd();
            return;
        }
        console.log("B\"H TextureMixer: Target mesh found:", targetChild);

        console.log("B\"H TextureMixer: Processing path object...");
        const pathData = processPathObject(nivra, pathChildName, MAX_SEGMENTS_FOR_SHADER);
        console.log("B\"H TextureMixer: Path Data Result:", {
            usePathMixing: pathData.usePathMixing,
            segmentsFound: pathData.numActualSegments,
            totalArraySize: pathData.pathSegments.length // Before padding
        });
        
        // Pad path segments array to meet fixed shader array size
        while(pathData.pathSegments.length < TOTAL_VEC3_COUNT) {
            pathData.pathSegments.push(new THREE.Vector3(0, -99999, 0));
        }

        console.log("B\"H TextureMixer: Generating Shader Definition...");
        
        // B"H: Construct the material with correct parameters
        // We use MeshPhongMaterial for better lighting interaction than basic Lambert if needed,
        // but sticking to Lambert to match old look if preferred. Let's use Lambert to be safe.
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

        console.log("B\"H TextureMixer: Injecting onBeforeCompile...");
        
        customMaterial.onBeforeCompile = (shader) => {
            console.log("B\"H TextureMixer: onBeforeCompile EXECUTING for", nivra.name);
            
            // Inject Uniforms
            Object.assign(shader.uniforms, shaderDef.uniforms);
            console.log("B\"H TextureMixer: Uniforms injected:", Object.keys(shader.uniforms));

            // Inject Vertex Shader
            shader.vertexShader = shaderDef.vertexShader;
            
            // Inject Fragment Shader
            // Note: We are REPLACING the fragment shader logic completely in the helper, 
            // or appending to standard chunks. Let's check shader.js strategy.
            // ... shader.js returns a full replacement logic usually attached to a standard template.
            
            // B"H: Important - The shader.js returns a struct with 'fragmentShader' property.
            // If we are using MeshLambertMaterial, we need to be careful not to break lights.
            // The shader.js provided in previous step seemed to replace main().
            
            shader.fragmentShader = shaderDef.fragmentShader;

            console.log("B\"H TextureMixer: Shader code replaced successfully.");
        };

        targetChild.material = customMaterial;
        targetChild.material.needsUpdate = true; // Force update
        
        console.log("B\"H TextureMixer: Material assigned to mesh. Process Complete.");
        console.groupEnd();
    }
}
