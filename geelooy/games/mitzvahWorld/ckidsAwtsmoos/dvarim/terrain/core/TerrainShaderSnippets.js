
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
        uGrassLight: { value: { r: 0x4d/255, g: 0x8b/255, b: 0x31/255 } }, 
        uGrassDark:  { value: { r: 0x1a/255, g: 0x3d/255, b: 0x14/255 } }, 
    },
    fragment: {
        head: `
            varying vec3 vPosition; 
            uniform vec3 uGrassLight; 
            uniform vec3 uGrassDark;
        `,
        color: `
            // B"H: Smooth height-based transition
            float h = vPosition.y;
            float hillFactor = smoothstep(-5.0, 40.0, h);
            vec3 gradientColor = mix(uGrassDark, uGrassLight, hillFactor);
            
            // B"H: Large stable waves only. No frame-time shimmer, no grain.
            float broad = 0.5 + 0.5 * sin(vPosition.x * 0.22) * cos(vPosition.z * 0.18);
            gradientColor *= 0.92 + broad * 0.16;

            // B"H: Blend with the texture and boost
            diffuseColor.rgb *= gradientColor * 1.55;
        `
    },
    vertex: {
        head: `varying vec3 vPosition;`,
        main: `vPosition = (modelMatrix * vec4(position, 1.0)).xyz;`
    }
};
