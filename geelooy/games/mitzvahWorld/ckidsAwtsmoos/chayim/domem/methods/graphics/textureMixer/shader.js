// B"H
import * as THREE from "/games/mitzvahWorld/systems/three/AwtsmoosThreeGateway.js";

/**
 * MAX_SEGMENTS_FOR_SHADER - The number of segments the GPU can process.
 * Matches reference: 200 segments = 400 vector3s.
 */
export const MAX_SEGMENTS_FOR_SHADER = 200;
export const TOTAL_VEC3_COUNT = MAX_SEGMENTS_FOR_SHADER * 2;

export function getShaderSnippets(base, overlay, repeatX, repeatY, textureScale, usePathMixing, feather, intensity, lowHeight, highHeight, pathSegments, numActualSegments) {
    return {
        uniforms: {
            baseTexture: { value: base },
            overlayTexture: { value: overlay },
            repeatVector: { value: new THREE.Vector2(repeatX, repeatY) },
            textureScale: { value: textureScale },
            usePathMixing: { value: usePathMixing },
            feather: { value: feather },
            intensity: { value: intensity },
            lowHeight: { value: lowHeight },
            highHeight: { value: highHeight },
            pathSegments: { value: pathSegments },
            numPathSegments: { value: numActualSegments }
        },
        fragmentHeader: `
            uniform sampler2D baseTexture;
            uniform sampler2D overlayTexture;
            uniform vec2 repeatVector;
            uniform float textureScale;
            uniform float feather;
            uniform float lowHeight;
            uniform float highHeight;
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
        `,
        fragmentLogic: `
            // B"H: Manual texture fetch based on World Position
            vec4 dirtColor = texture2D(baseTexture, (vWorldPosition.xz * textureScale) * repeatVector);
            vec4 grassColor = texture2D(overlayTexture, (vWorldPosition.xz * textureScale) * repeatVector);

            float mixFactor = 0.0;
            if (usePathMixing && numPathSegments > 0) {
                float minDistance = 1e38;
                // B"H: Unrollable loop structure matching reference
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
            
            // B"H: Modulate diffuseColor. Since we didn't use map_fragment's default logic,
            // diffuseColor is white (from material.color), so this applies our texture safely.
            diffuseColor *= mixedColor; 
        `
    };
}
