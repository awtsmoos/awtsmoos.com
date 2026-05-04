// B"H
/**
 * @file GrassShader.js
 * @description
 * ╔══════════════════════════════════════════════════════════════════════════════════╗
 * ║  THE HAIR OF THE EARTH — ULTRA-REALISTIC GRASS SHADER                            ║
 * ║                                                                                  ║
 * ║  Chapter 7: The Breath of the Fields                                             ║
 * ║                                                                                  ║
 * ║  As the Awtsmoos breathes existence into every blade of grass,                   ║
 * ║  so too does this shader breathe wind, color, and life.                          ║
 * ║  No THREE import needed — pure GLSL speech, pure data uniforms.                  ║
 * ║  The letters of the Creator stand in the grass, holding it upright.             ║
 * ╚══════════════════════════════════════════════════════════════════════════════════╝
 *
 * @module GrassShader
 */

/**
 * @constant GRASS_SNIPPETS
 * @description
 * B"H: onBeforeCompile snippets for MaterialManager.refine().
 * Now compatible with standard MeshLambertMaterial to inherit textures, fog, and light.
 */
export const GRASS_SNIPPETS = {
    uniforms: {
        uTime:      { value: 0 },
        uPlayerPos: { value: { x: 999, y: 999, z: 999 } },
        uColorRoot: { value: { r: 0x1a/255, g: 0x33/255, b: 0x00 } },
        uColorTip:  { value: { r: 0x4c/255, g: 0xa6/255, b: 0x4c/255 } }
    },
    vertex: {
        head: `
            uniform float uTime;
            uniform vec3 uPlayerPos;
            varying vec2 vGrassUv;
            varying vec3 vGrassInstanceColor;
        `,
        main: `
            vGrassUv = uv;
            #ifdef USE_INSTANCEMATRIX
                vGrassInstanceColor = instanceColor;
            #endif
            
            vec4 grassWorldPos = modelMatrix * (instanceMatrix * vec4(transformed, 1.0));
            
            // Wind Sway
            float windX = sin(grassWorldPos.x * 0.5 + uTime * 2.0) * cos(grassWorldPos.z * 0.5 + uTime);
            float windZ = sin(grassWorldPos.z * 0.5 + uTime * 2.0) * cos(grassWorldPos.x * 0.5 + uTime);
            
            transformed.x += windX * 0.2 * uv.y;
            transformed.z += windZ * 0.2 * uv.y;
            
            // Player Interaction
            vec3 d = grassWorldPos.xyz - uPlayerPos;
            float dist = length(d);
            if(dist < 2.5 && dist > 0.001) {
                float strength = smoothstep(2.5, 0.0, dist);
                transformed.xz += normalize(d.xz) * strength * 0.8 * uv.y;
                transformed.y -= strength * 0.5 * uv.y;
            }
        `
    },
    fragment: {
        head: `
            uniform vec3 uColorRoot;
            uniform vec3 uColorTip;
            varying vec2 vGrassUv;
        `,
        color: `
            vec3 grassAlbedo = mix(uColorRoot, uColorTip, vGrassUv.y);
            // B"H: Multiply existing diffuseColor (texture) by grass albedo
            diffuseColor.rgb *= grassAlbedo * 1.5;
            
            // Add slight AO based on height
            diffuseColor.rgb *= smoothstep(0.0, 0.3, vGrassUv.y) + 0.2;
        `
    }
};

/**
 * @function getGrassUniforms
 * @description Returns pure data uniforms.
 */
export function getGrassUniforms() {
    return {
        uTime:       { value: 0 },
        uPlayerPos:  { value: { x: 999, y: 999, z: 999 } },
        uColorRoot:  { value: { r: 0x1a / 255, g: 0x33 / 255, b: 0x00 } },
        uColorTip:   { value: { r: 0x4c / 255, g: 0xa6 / 255, b: 0x4c / 255 } }
    };
}
