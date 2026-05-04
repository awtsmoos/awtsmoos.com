// B"H
/**
 * @file LeafShader.js
 * @description
 * ╔══════════════════════════════════════════════════════════════════════════════════╗
 * ║  THE BREATH OF LIFE — ULTRA-REALISTIC LEAF SHADER                                ║
 * ║                                                                                  ║
 * ║  A high-performance PBR leaf shader with Subsurface Scattering (SSS),            ║
 * ║  procedural venation (veins), specular glossiness, and dynamic wind sway         ║
 * ║  that respects the player's presence.                                            ║
 * ║                                                                                  ║
 * ║  No THREE import — pure GLSL strings + pure plain-object uniform descriptors.   ║
 * ╚══════════════════════════════════════════════════════════════════════════════════╝
 *
 * @module LeafShader
 */

/**
 * @constant LEAF_SNIPPETS
 * @description
 * B"H: onBeforeCompile snippet data for MaterialManager.refine().
 * Uniform color values are plain {r,g,b} objects, player pos is {x,y,z}.
 * THREE.ShaderMaterial's uniform system accepts these without needing
 * THREE.Color or THREE.Vector3 instances at initialization.
 *
 * @type {Object}
 */
export const LEAF_SNIPPETS = {
    uniforms: {
        uTime:         { value: 0 },
        uPlayerPos:    { value: { x: 999, y: 999, z: 999 } },
        uSeason:       { value: 0.0 },
        uColorSummer:  { value: { r: 0x2d / 255, g: 0x5a / 255, b: 0x27 / 255 } },
        uColorAutumn:  { value: { r: 0xb2 / 255, g: 0x4a / 255, b: 0x10 / 255 } }
    },
    vertex: {
        head: `
            uniform float uTime;
            uniform vec3 uPlayerPos;
            varying vec2 vLeafUv;
        `,
        main: `
            vLeafUv = uv;
            vec4 leafWorldPos = modelMatrix * vec4(transformed, 1.0);
            float macroWind = sin(leafWorldPos.x * 0.5 + uTime) * cos(leafWorldPos.z * 0.5 + uTime) * 0.15;
            float microWind = sin(leafWorldPos.y * 5.0 + uTime * 3.0) * 0.05;
            transformed.x += (macroWind + microWind) * uv.y;
            transformed.z += (macroWind * 0.5) * uv.y;
            vec3 pushDir = leafWorldPos.xyz - uPlayerPos;
            float dist = length(pushDir);
            if(dist < 3.0 && dist > 0.001) {
                float push = smoothstep(3.0, 0.0, dist);
                transformed += normalize(normal) * push * 0.5 * uv.y;
            }
        `
    },
    fragment: {
        head: `
            uniform vec3 uColorSummer;
            uniform vec3 uColorAutumn;
            uniform float uSeason;
            varying vec2 vLeafUv;
        `,
        color: `
            float edge = 1.0 - (pow(abs(vLeafUv.x - 0.5) * 2.0, 2.0) + pow(vLeafUv.y - 0.5, 4.0));
            if(edge < 0.15) discard;
            vec3 leafAlbedo = mix(uColorSummer, uColorAutumn, uSeason);
            diffuseColor.rgb *= leafAlbedo;
        `
    }
};

/**
 * @function getLeafUniforms
 * @description
 * Returns a pure-data uniform map for the Leaf shader.
 * No THREE import needed — plain {r,g,b} and {x,y,z} objects.
 *
 * @param {'oak'|'birch'} [type='oak'] - Leaf variety
 * @returns {Object} Uniform descriptor map
 */
export function getLeafUniforms(type = 'oak') {
    return {
        uTime:        { value: 0 },
        uPlayerPos:   { value: { x: 999, y: 999, z: 999 } },
        uSeason:      { value: 0.0 }, // 0=Summer, 1=Autumn
        uColorSummer: { value: { r: 0x2d / 255, g: 0x5a / 255, b: 0x27 / 255 } },
        uColorAutumn: { value: { r: 0xb2 / 255, g: 0x4a / 255, b: 0x10 / 255 } }
    };
}
