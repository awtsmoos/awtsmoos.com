// B"H
/**
 * @file BarkShader.js
 * @description
 * ╔══════════════════════════════════════════════════════════════════════════════════╗
 * ║  THE GARMENT OF THE TREE — ULTRA-REALISTIC BARK SHADER                           ║
 * ║                                                                                  ║
 * ║  "As the days of a tree shall be the days of my people..." (Yeshayahu 65:22)     ║
 * ║                                                                                  ║
 * ║  A high-performance, purely procedural PBR-style bark shader.                    ║
 * ║  Uses optimized domain-warping and high-frequency noise for deep ridges,         ║
 * ║  with procedural normal mapping and ambient occlusion.                           ║
 * ║                                                                                  ║
 * ║  No THREE import — pure GLSL + pure data uniform descriptors only.               ║
 * ╚══════════════════════════════════════════════════════════════════════════════════╝
 *
 * @module BarkShader
 */

/**
 * @constant noiseFunctions
 * @description GLSL noise helpers — fBm wood-grain ridge computation
 * @type {string}
 */
const noiseFunctions = `
    // Fast 3D Hash
    vec3 hash33(vec3 p) {
        p = vec3(dot(p, vec3(127.1, 311.7, 74.7)),
                 dot(p, vec3(269.5, 183.3, 246.1)),
                 dot(p, vec3(113.5, 271.9, 124.6)));
        return fract(sin(p) * 43758.5453123);
    }

    // Fast Value Noise
    float noise(vec3 p) {
        vec3 i = floor(p);
        vec3 f = fract(p);
        vec3 u = f * f * (3.0 - 2.0 * f);
        return mix(mix(mix(dot(hash33(i + vec3(0,0,0)), f - vec3(0,0,0)), 
                           dot(hash33(i + vec3(1,0,0)), f - vec3(1,0,0)), u.x),
                       mix(dot(hash33(i + vec3(0,1,0)), f - vec3(0,1,0)), 
                           dot(hash33(i + vec3(1,1,0)), f - vec3(1,1,0)), u.x), u.y),
                   mix(mix(dot(hash33(i + vec3(0,0,1)), f - vec3(0,0,1)), 
                           dot(hash33(i + vec3(1,0,1)), f - vec3(1,0,1)), u.x),
                       mix(dot(hash33(i + vec3(0,1,1)), f - vec3(0,1,1)), 
                           dot(hash33(i + vec3(1,1,1)), f - vec3(1,1,1)), u.x), u.y), u.z);
    }

    // B"H: Deep Ridge Fractal Brownian Motion
    float fbmBark(vec3 p) {
        float f = 0.0;
        float w = 0.5;
        for (int i = 0; i < 5; i++) { // Increased octaves for intensity
            float n = noise(p);
            f += w * abs(n); // Ridge noise for that deep bark look
            p *= 2.2;
            w *= 0.5;
        }
        return f;
    }
`;

/**
 * @constant BARK_SNIPPETS
 * @description
 * B"H: onBeforeCompile snippet data for MaterialManager.refine().
 */
export const BARK_SNIPPETS = {
    uniforms: {
        uTime:       { value: 0 },
        uColorDark:  { value: { r: 0x2d / 255, g: 0x1b / 255, b: 0x0f / 255 } },
        uColorLight: { value: { r: 0x6b / 255, g: 0x4b / 255, b: 0x2d / 255 } }
    },
    vertex: {
        head: `
            ${noiseFunctions}
            varying float vDisplacement;
            varying vec3 vBarkWorldPos;
        `,
        main: `
            vec4 barkWorldPos = modelMatrix * vec4(transformed, 1.0);
            // Vertical stretching for bark grain
            vec3 noisePos = vec3(barkWorldPos.x * 8.0, barkWorldPos.y * 0.2, barkWorldPos.z * 8.0);
            float bump = fbmBark(noisePos);
            
            // Intensify the displacement
            transformed += normal * bump * 0.15; 
            vDisplacement = bump;
            vBarkWorldPos = barkWorldPos.xyz;
        `
    },
    fragment: {
        head: `
            uniform vec3 uColorDark;
            uniform vec3 uColorLight;
            varying float vDisplacement;
        `,
        color: `
            // B"H: Intense color mapping for deep ridges
            float ridge = smoothstep(0.1, 0.6, vDisplacement);
            vec3 barkAlbedo = mix(uColorDark, uColorLight, ridge);
            
            // Add some "moss" or "lichen" highlights based on height and noise
            float lichen = smoothstep(0.7, 0.9, vDisplacement);
            barkAlbedo = mix(barkAlbedo, barkAlbedo * 1.4 + vec3(0.05, 0.1, 0.02), lichen);

            diffuseColor.rgb *= barkAlbedo * 2.2; // Significant intensity boost
        `
    }
};


/**
 * @function getBarkUniforms
 * @description
 * Returns a pure-data uniform map for the Bark shader.
 * No THREE.Color — plain {r,g,b} channel objects from 0.0–1.0.
 *
 * @param {'oak'|'birch'} [type='oak'] - Tree bark variety
 * @returns {Object} Uniform descriptor map
 */
export function getBarkUniforms(type = 'oak') {
    // B"H: Plain channel objects, no THREE dependency
    const dark  = type === 'birch'
        ? { r: 0x33 / 255, g: 0x33 / 255, b: 0x33 / 255 }
        : { r: 0x3d / 255, g: 0x2b / 255, b: 0x1f / 255 };

    const light = type === 'birch'
        ? { r: 0xee / 255, g: 0xee / 255, b: 0xee / 255 }
        : { r: 0x8b / 255, g: 0x6b / 255, b: 0x4d / 255 };

    return {
        uTime:       { value: 0 },
        uColorDark:  { value: dark },
        uColorLight: { value: light }
    };
}
