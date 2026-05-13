/**
 * B"H
 * @file leaf_variants.js
 * @description THE RADIANCE OF THE SPECIES — Specialized Leaf Shaders
 */

export const leaf_palm = async (olam) => ({
    type: 'Standard',
    properties: { color: 0x4caf50, side: 2, transparent: true, alphaTest: 0.5 },
    snippets: {
        onBeforeCompile: `
            // B"H: Palm Frond Shader
            varying vec2 vUv;
            void main() {
                float frond = abs(sin(vUv.x * 20.0)) * smoothstep(0.5, 0.0, abs(vUv.y - 0.5));
                if(frond < 0.2) discard;
                gl_FragColor.rgb *= (0.8 + 0.2 * frond);
            }
        `
    }
});

export const leaf_pine = async (olam) => ({
    type: 'Standard',
    properties: { color: 0x1b5e20, side: 2, transparent: true, alphaTest: 0.5 },
    snippets: {
        onBeforeCompile: `
            // B"H: Pine Needle Shader
            varying vec2 vUv;
            void main() {
                float needle = abs(sin(vUv.x * 50.0 + vUv.y * 100.0));
                if(needle < 0.5) discard;
                gl_FragColor.rgb *= 0.7;
            }
        `
    }
});

export const leaf_willow = async (olam) => ({
    type: 'Standard',
    properties: { color: 0x8bc34a, side: 2, transparent: true, alphaTest: 0.5 },
    snippets: {
        onBeforeCompile: `
            // B"H: Willow Droop Shader
            varying vec2 vUv;
            void main() {
                float leaf = smoothstep(0.1, 0.0, abs(vUv.x - 0.5)) * sin(vUv.y * 3.14);
                if(leaf < 0.1) discard;
                gl_FragColor.rgb = mix(gl_FragColor.rgb, vec3(0.1, 0.3, 0.0), 1.0 - leaf);
            }
        `
    }
});
