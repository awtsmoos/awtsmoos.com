
// B"H
/**
 * @file LeafShader.js
 * @module LeafShader
 */

export const LEAF_SNIPPETS = {
    uniforms: {
        uTime:         { value: 0 },
        uPlayerPos:    { value: { x: 999, y: 999, z: 999 } },
        uSeason:       { value: 0.0 },
        uColorSummer:  { value: { r: 0.1, g: 0.4, b: 0.1 } }, // B"H: Vivid Summer
        uColorAutumn:  { value: { r: 0.7, g: 0.3, b: 0.05 } } // B"H: Golden Autumn
    },
    vertex: {
        head: `
            uniform float uTime;
            uniform vec3 uPlayerPos;
            varying vec2 vLeafUv;
            varying vec3 vLeafWorldPos;
        `,
        main: `
            vLeafUv = uv;
            vec4 leafWPos = modelMatrix * vec4(transformed, 1.0);
            vLeafWorldPos = leafWPos.xyz;

            // B"H: Gentle Wind
            float wind = sin(leafWPos.x * 0.2 + uTime) * cos(leafWPos.z * 0.2 + uTime);
            transformed.xz += wind * 0.3 * uv.y;

            // B"H: Chossid Interaction
            vec3 pushDir = leafWPos.xyz - uPlayerPos;
            float d = length(pushDir);
            if(d < 4.0 && d > 0.001) {
                float strength = smoothstep(4.0, 0.0, d);
                transformed += normalize(normal) * strength * 1.5 * uv.y;
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
            // B"H: Create a leaf shape from the quad UV
            float distToCenter = length(vLeafUv - 0.5);
            float leafShape = smoothstep(0.5, 0.45, distToCenter);
            
            if(leafShape < 0.1) discard;

            vec3 leafColor = mix(uColorSummer, uColorAutumn, uSeason);
            
            // Add a little procedural detail
            leafColor *= 0.8 + 0.4 * sin(vLeafUv.x * 20.0) * cos(vLeafUv.y * 20.0);
            
            diffuseColor.rgb = leafColor;
            diffuseColor.a = leafShape;
        `
    }
};

export function getLeafUniforms(type = 'oak') {
    return {
        uTime:        { value: 0 },
        uPlayerPos:   { value: { x: 999, y: 999, z: 999 } },
        uSeason:      { value: 0.0 },
        uColorSummer: { value: { r: 0.1, g: 0.4, b: 0.1 } },
        uColorAutumn: { value: { r: 0.7, g: 0.3, b: 0.05 } }
    };
}
