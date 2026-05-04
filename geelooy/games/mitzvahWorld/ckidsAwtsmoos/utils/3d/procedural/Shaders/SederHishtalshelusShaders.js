
/**
 * B"H
 * @file SederHishtalshelusShaders.js
 * @description
 * 🌌 THE BOOK OF FORMS (DATA-BASED SHADERS) 🌌
 * 
 * Chapter 33: The Raw Light of the Essence
 * 
 * This file contains the pure, raw GLSL snippets for architectural 
 * procedural textures. No Three.js logic here — only the sacred 
 * mathematics of the Awtsmoos.
 */

export const ARCHITECTURAL_SHADERS = {
    AwtsmoosBrickMaterial: {
        header: `
            float awtsmoos_brick_mortar(vec2 coord, vec2 brickSize, float mortarWidth) {
                float xOffset = step(1.0, mod(floor(coord.y / (brickSize.y + mortarWidth)), 2.0)) * (brickSize.x * 0.5);
                float bx = step(brickSize.x, mod(coord.x + xOffset, brickSize.x + mortarWidth));
                float by = step(brickSize.y, mod(coord.y, brickSize.y + mortarWidth));
                return clamp(bx + by, 0.0, 1.0);
            }
        `,
        fragment: `
            vec3 p = vWorldPosition * 2.0; // Higher frequency
            vec3 n = abs(normalize(vNormalVec));
            vec2 brickSize = vec2(0.8, 0.4);
            float mortarWidth = 0.06;
            
            float mX = awtsmoos_brick_mortar(p.zy, brickSize, mortarWidth);
            float mY = awtsmoos_brick_mortar(p.xz, brickSize, mortarWidth);
            float mZ = awtsmoos_brick_mortar(p.xy, brickSize, mortarWidth);
            
            float mortar = (mX * n.x + mY * n.y + mZ * n.z);
            diffuseColor.rgb = mix(diffuseColor.rgb, vec3(0.8), clamp(mortar, 0.0, 1.0));
        `
    },
    AwtsmoosFloorMaterial: {
        fragment: `
            vec3 p = vWorldPosition;
            float tiles = step(0.5, fract(p.x * 0.5)) == step(0.5, fract(p.z * 0.5)) ? 1.0 : 0.85;
            float grid = step(0.97, fract(p.x * 0.5)) + step(0.97, fract(p.z * 0.5));
            diffuseColor.rgb *= tiles;
            diffuseColor.rgb = mix(diffuseColor.rgb, vec3(0.15), clamp(grid, 0.0, 1.0));
        `
    },
    AwtsmoosGrassMaterial: {
        header: `
            float awtsmoos_noise(vec2 p) {
                return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
            }
            float awtsmoos_smooth_noise(vec2 p) {
                vec2 i = floor(p); vec2 f = fract(p);
                f = f*f*(3.0-2.0*f);
                return mix(mix(awtsmoos_noise(i), awtsmoos_noise(i + vec2(1.0, 0.0)), f.x),
                           mix(awtsmoos_noise(i + vec2(0.0, 1.0)), awtsmoos_noise(i + vec2(1.0, 1.0)), f.x), f.y);
            }
            float awtsmoos_fbm(vec2 p) {
                float v = 0.0; float a = 0.5;
                for (int i = 0; i < 6; i++) {
                    v += a * awtsmoos_smooth_noise(p);
                    p *= 2.5; a *= 0.45;
                }
                return v;
            }
        `,
        fragment: `
            vec3 p = vWorldPosition;
            float n = awtsmoos_fbm(p.xz * 2.5);
            vec3 grassDark = vec3(0.05, 0.25, 0.08);
            vec3 grassLight = vec3(0.3, 0.7, 0.35);
            
            // B"H: Multiplicative mix to preserve texture
            diffuseColor.rgb *= mix(grassDark, grassLight, n * 1.2) * 2.5; 
            
            float patches = awtsmoos_fbm(p.xz * 0.5);
            if(patches > 0.6) diffuseColor.rgb = mix(diffuseColor.rgb, vec3(0.25, 0.18, 0.10), (patches-0.6)*2.0);
        `
    },
    AwtsmoosWoodMaterial: {
        fragment: `
            vec3 p = vWorldPosition;
            float grain = sin(p.y * 40.0 + sin(p.x * 10.0 + p.z * 10.0) * 2.0) * 0.03;
            // B"H: Multiply or add to preserve texture base
            diffuseColor.rgb += grain; 
            diffuseColor.rgb *= 1.1; // Slight boost to reveal bark pattern
        `
    },
    AwtsmoosDoorMaterial: {
        fragment: `
            vec3 p = vWorldPosition;
            float grain = sin(p.y * 60.0 + sin(p.x * 20.0 + p.z * 20.0) * 4.0) * 0.05;
            diffuseColor.rgb += grain;
        `
    },
    AwtsmoosRoofMaterial: {
        fragment: `
            vec3 p = vWorldPosition;
            float shingles = step(0.9, fract(p.z * 2.5 + step(0.5, fract(p.x * 1.5)) * 0.5));
            diffuseColor.rgb *= mix(1.0, 0.5, shingles);
        `
    },
    AwtsmoosEmeraldMaterial: {
        fragment: `
            vec3 p = vWorldPosition;
            float e = sin(p.x * 10.0 + p.z * 10.0 + p.y * 10.0);
            diffuseColor.rgb += vec3(0.0, e * 0.1, 0.0);
        `
    }
};
