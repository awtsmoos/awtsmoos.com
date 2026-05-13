
/**
 * B"H
 * @module TerrainShaderSnippets
 * @description
 * 📜 THE LETTERS OF THE GRASS 📜
 * 
 * Pure data object containing the GLSL snippets for the Terrain material.
 * Completely devoid of JS execution logic.
 */

export const GRASS_TERRAIN_SNIPPETS = {
    uniforms: {
        uTime:       { value: 0 },
        uGrassLight: { value: { r: 0x4d/255, g: 0x8b/255, b: 0x31/255 } }, 
        uGrassDark:  { value: { r: 0x1a/255, g: 0x3d/255, b: 0x14/255 } }, 
    },
    fragment: {
        head: `
            varying vec3 vPosition; 
            uniform float uTime;
            uniform vec3 uGrassLight; 
            uniform vec3 uGrassDark;

            // B"H: High-frequency noise for micro-detail
            float hash(vec2 p) {
                return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453);
            }
        `,
        color: `
            // B"H: Smooth height-based transition
            float h = vPosition.y;
            float hillFactor = smoothstep(-5.0, 40.0, h);
            vec3 gradientColor = mix(uGrassDark, uGrassLight, hillFactor);
            
            // B"H: Micro-noise for texture depth
            float micro = hash(vPosition.xz * 25.0);
            gradientColor = mix(gradientColor, gradientColor * 1.2, micro * 0.15);

            // B"H: The Shimmer of Divine Sparks
            float shimmer = pow(hash(vPosition.xz * 0.5 + floor(uTime * 1.5)), 20.0);
            gradientColor += vec3(0.1, 0.2, 0.1) * shimmer;

            // B"H: Blend with the texture and boost
            diffuseColor.rgb *= gradientColor * 2.0;
        `
    },
    vertex: {
        head: `varying vec3 vPosition;`,
        main: `vPosition = (modelMatrix * vec4(position, 1.0)).xyz;`
    }
};
