// B"H
/**
 * @file RockShader.js
 * @description
 * ╔══════════════════════════════════════════════════════════════════════════════════╗
 * ║  THE FOUNDATION OF THE EARTH — ULTRA-REALISTIC PROCEDURAL ROCK SHADER            ║
 * ║                                                                                  ║
 * ║  No THREE import — pure GLSL + pure plain-object uniform descriptors.            ║
 * ╚══════════════════════════════════════════════════════════════════════════════════╝
 *
 * @module RockShader
 */

const noiseFunctions = `
    vec3 hash33(vec3 p) {
        p = vec3(dot(p, vec3(127.1, 311.7, 74.7)),
                 dot(p, vec3(269.5, 183.3, 246.1)),
                 dot(p, vec3(113.5, 271.9, 124.6)));
        return fract(sin(p) * 43758.5453123);
    }
    
    float voronoi(vec3 x) {
        vec3 p = floor(x);
        vec3 f = fract(x);
        float res = 100.0;
        for(int k=-1; k<=1; k++)
        for(int j=-1; j<=1; j++)
        for(int i=-1; i<=1; i++) {
            vec3 b = vec3(float(i), float(j), float(k));
            vec3 r = vec3(b) - f + hash33(p + b);
            float d = dot(r, r);
            res = min(res, d);
        }
        return sqrt(res);
    }
`;

/**
 * @constant ROCK_SNIPPETS
 * @description
 * B"H: onBeforeCompile snippets for rocks.
 */
export const ROCK_SNIPPETS = {
    uniforms: {
        uColorBase: { value: { r: 0.5, g: 0.5, b: 0.5 } },
        uColorMoss: { value: { r: 0.2, g: 0.4, b: 0.1 } }
    },
    vertex: {
        head: noiseFunctions + `
            varying float vCracks;
        `,
        main: `
            vec4 rockWorldPos = modelMatrix * (instanceMatrix * vec4(transformed, 1.0));
            float cracks = voronoi(rockWorldPos.xyz * 1.5);
            float grit = fract(sin(dot(rockWorldPos.xyz, vec3(12.9898, 78.233, 45.164))) * 43758.5453);
            float bump = smoothstep(0.0, 0.4, cracks) * 0.2 + (grit * 0.02);
            transformed += normal * bump;
            vCracks = cracks;
        `
    },
    fragment: {
        head: `
            uniform vec3 uColorBase;
            uniform vec3 uColorMoss;
            varying float vCracks;
        `,
        color: `
            float strata = sin(vWorldPosition.y * 10.0 + sin(vWorldPosition.x * 5.0)) * 0.5 + 0.5;
            vec3 rockColor = mix(uColorBase * 0.5, uColorBase * 1.2, strata);
            rockColor *= smoothstep(0.0, 0.3, vCracks);
            
            // B"H: Multiply existing diffuse (texture) by rock color
            diffuseColor.rgb *= rockColor * 2.0;
            
            // Apply moss on top
            float upDot = max(dot(vNormal, vec3(0.0, 1.0, 0.0)), 0.0);
            float mossFactor = smoothstep(0.6, 0.9, upDot + vCracks * 0.2);
            diffuseColor.rgb = mix(diffuseColor.rgb, uColorMoss, mossFactor);
        `
    }
};

/**
 * @function getRockUniforms
 * @description Returns pure-data uniform map.
 */
export function getRockUniforms(type = 'granite') {
    const ROCK_COLOR_PRESETS = {
        granite:   { r: 0x77 / 255, g: 0x77 / 255, b: 0x77 / 255 },
        sandstone: { r: 0xd2 / 255, g: 0xb4 / 255, b: 0x8c / 255 },
        basalt:    { r: 0x33 / 255, g: 0x33 / 255, b: 0x36 / 255 }
    };

    return {
        uColorBase: { value: ROCK_COLOR_PRESETS[type] || ROCK_COLOR_PRESETS.granite },
        uColorMoss: { value: { r: 0x3a / 255, g: 0x5f / 255, b: 0x0b / 255 } }
    };
}
