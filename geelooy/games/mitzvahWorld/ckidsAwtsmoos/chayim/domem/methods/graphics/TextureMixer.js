
// B"H
import * as THREE from '/games/scripts/build/three.module.js';

export default class TextureMixer {
    static async mix(nivra, options = {}) {
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

        console.group(`B"H [${nivra.name}] TextureMixer Started`);
        console.log("B\"H TextureMixer Params:", JSON.stringify(options, null, 2));

        var base, overlay;
        try {
            console.time("B\"H Texture Load Time");
            const bTexStr = nivra.olam.$gc(baseTexture) || baseTexture;
            const oTexStr = nivra.olam.$gc(overlayTexture) || overlayTexture;
            
            console.log("B\"H Resolving Base Texture:", bTexStr);
            console.log("B\"H Resolving Overlay Texture:", oTexStr);

            base = await nivra.olam.loadTexture({ url: bTexStr, shouldRepeat: true, repeatX, repeatY, nivra });
            overlay = await nivra.olam.loadTexture({ url: oTexStr, shouldRepeat: true, repeatX, repeatY, nivra });
            console.timeEnd("B\"H Texture Load Time");

            if (!base) console.warn("B\"H FAILURE: Base texture failed to load:", bTexStr);
            else console.log("B\"H SUCCESS: Base texture loaded.");

            if (!overlay) console.warn("B\"H FAILURE: Overlay texture failed to load:", oTexStr);
            else console.log("B\"H SUCCESS: Overlay texture loaded.");
            
            if(base) {
                base.wrapS = base.wrapT = THREE.RepeatWrapping;
            }
            if(overlay) {
                overlay.wrapS = overlay.wrapT = THREE.RepeatWrapping;
            }

        } catch (e) {
            console.error("B\"H Texture Load CRITICAL ERROR", e);
            console.groupEnd();
            return;
        }

        var targetChild = null;
        if (childNameToSetItTo && nivra.mesh) {
            nivra.mesh.traverse((child) => {
                if (!targetChild && child.isMesh && child.name.includes(childNameToSetItTo)) {
                    targetChild = child;
                    console.log("B\"H Found Target Mesh:", child.name);
                }
            });
        }

        if (!targetChild) {
            console.error(`B"H CRITICAL: Target child '${childNameToSetItTo}' not found in ${nivra.name}. Available children:`);
            nivra.mesh.traverse(c => console.log("- " + c.name));
            console.groupEnd();
            return;
        }

        // B"H: Matched Old Config
        const MAX_SEGMENTS_FOR_SHADER = 200;
        const TOTAL_VEC3_COUNT = MAX_SEGMENTS_FOR_SHADER * 2;
        
        const pathSegments = [];
        // Pre-fill with dummy data to avoid undefined uniforms
        console.log(`B"H Initializing pathSegments array with size: ${TOTAL_VEC3_COUNT}`);
        
        let numActualSegments = 0;
        let usePathMixing = false;

        let pathObject = null;
        if (pathChildName) {
            nivra.mesh.traverse(child => {
                if (child.name === pathChildName && child.geometry) {
                    pathObject = child;
                }
            });
        }

        if (pathObject) {
            console.log("B\"H Found path object:", pathChildName);
            pathObject.visible = false;
            usePathMixing = true;
            pathObject.updateMatrixWorld(true);

            const positions = pathObject.geometry.attributes.position;
            if (positions) {
                const worldVertices = [];
                // console.groupCollapsed("B\"H Path Vertices (World Space) - Details");
                for (let i = 0; i < positions.count; i++) {
                    const localPoint = new THREE.Vector3().fromBufferAttribute(positions, i);
                    const worldPoint = localPoint.clone().applyMatrix4(pathObject.matrixWorld);
                    worldVertices.push(worldPoint);
                    // console.log(`Vertex ${i}:`, worldPoint.x, worldPoint.y, worldPoint.z);
                }
                // console.groupEnd();

                const step = Math.max(1, Math.ceil(worldVertices.length / MAX_SEGMENTS_FOR_SHADER));
                let segIndex = 0;

                console.log(`B"H Path Processing: Total Vertices=${worldVertices.length}, Step=${step}`);

                for (let i = 0; i < worldVertices.length - 1; i += step) {
                    if (segIndex * 2 >= TOTAL_VEC3_COUNT) {
                        console.warn("B\"H Max segments reached, truncating path.");
                        break;
                    }

                    if (worldVertices[i] && worldVertices[i + 1]) {
                        pathSegments.push(worldVertices[i]);
                        pathSegments.push(worldVertices[i + 1]);
                        segIndex++;
                    }
                }
                numActualSegments = segIndex;
                console.log(`B"H Processed ${numActualSegments} path segments.`);
            } else {
                console.warn("B\"H Path object has no position attribute.");
            }
        } else {
            console.log("B\"H No path object found, path mixing disabled.");
        }

        // Fill remaining buffer with dummy data to satisfy shader uniform size
        while(pathSegments.length < TOTAL_VEC3_COUNT) {
            pathSegments.push(new THREE.Vector3(0, -99999, 0));
        }

        console.log("B\"H Final pathSegments Array Length:", pathSegments.length);

        var customLambertMaterial = new THREE.MeshLambertMaterial();
        customLambertMaterial.name = `MixedMaterial_${nivra.name}`;

        customLambertMaterial.onBeforeCompile = function (shader) {
            console.log("B\"H Compiling Shader for Texture Mixer...");
            
            shader.uniforms.baseTexture = { value: base };
            shader.uniforms.overlayTexture = { value: overlay };
            shader.uniforms.repeatVector = { value: new THREE.Vector2(repeatX, repeatY) };
            shader.uniforms.textureScale = { value: textureScale };
            shader.uniforms.usePathMixing = { value: usePathMixing };
            shader.uniforms.feather = { value: feather };
            shader.uniforms.intensity = { value: intensity };
            shader.uniforms.lowHeight = { value: lowHeight };
            shader.uniforms.highHeight = { value: highHeight };
            shader.uniforms.pathSegments = { value: pathSegments };
            shader.uniforms.numPathSegments = { value: numActualSegments };

            // Log Uniforms
            console.groupCollapsed("B\"H Shader Uniforms Check");
            console.log("baseTexture:", !!base);
            console.log("overlayTexture:", !!overlay);
            console.log("repeatVector:", repeatX, repeatY);
            console.log("textureScale:", textureScale);
            console.log("usePathMixing:", usePathMixing);
            console.log("numPathSegments:", numActualSegments);
            console.groupEnd();

            shader.vertexShader = `varying vec3 vWorldPosition;\n` + shader.vertexShader;
            shader.vertexShader = shader.vertexShader.replace('#include <begin_vertex>', `#include <begin_vertex>\nvWorldPosition = (modelMatrix * vec4(position, 1.0)).xyz;`);

            shader.fragmentShader = `
                uniform sampler2D baseTexture, overlayTexture; uniform vec2 repeatVector; uniform float textureScale, feather, lowHeight, highHeight;
                uniform float intensity;
                uniform bool usePathMixing;
                uniform vec3 pathSegments[${TOTAL_VEC3_COUNT}]; 
                uniform int numPathSegments; 
                varying vec3 vWorldPosition;
                float distanceToLineSegment(vec3 p, vec3 a, vec3 b) {
                    vec2 p2 = p.xz;
                    vec2 a2 = a.xz;
                    vec2 b2 = b.xz;
                    vec2 pa = p2 - a2, ba = b2 - a2;
                    float h = clamp(dot(pa, ba) / dot(ba, ba), 0.0, 1.0);
                    return length(pa - ba * h);
                }
            ` + shader.fragmentShader;

            var fragmentLogic = `
                vec4 dirtColor = vec4(1.0);
                if(true) dirtColor = texture2D(baseTexture, (vWorldPosition.xz * textureScale) * repeatVector);
                
                vec4 grassColor = vec4(0.5, 0.8, 0.5, 1.0);
                if(true) grassColor = texture2D(overlayTexture, (vWorldPosition.xz * textureScale) * repeatVector);

                float mixFactor = 0.0;
                if (usePathMixing && numPathSegments > 0) {
                    float minDistance = 1e38;
                    for (int i = 0; i < ${MAX_SEGMENTS_FOR_SHADER}; ++i) {
                        if (i >= numPathSegments) break;
                        minDistance = min(minDistance, distanceToLineSegment(vWorldPosition, pathSegments[i * 2], pathSegments[i * 2 + 1]));
                    }
                    float smoothFactor = 1.0 - smoothstep(0.0, feather, minDistance);
                    mixFactor = pow(smoothFactor, 1.0 / intensity);
                } else {
                    mixFactor = smoothstep(lowHeight, highHeight, vWorldPosition.y);
                }
                vec4 mixedColor = mix(dirtColor, grassColor, mixFactor);
                diffuseColor *= mixedColor;
            `;

            shader.fragmentShader = shader.fragmentShader.replace('#include <map_fragment>', '#include <map_fragment>\n' + fragmentLogic);
        };

        targetChild.material = customLambertMaterial;
        targetChild.material.needsUpdate = true;
        
        console.log("B\"H Texture Mixing Complete.");
        console.groupEnd();
    }
}
