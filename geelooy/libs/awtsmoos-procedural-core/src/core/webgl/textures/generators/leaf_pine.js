
// B"H
import { NOISE_GLSL } from '../utils/noise.js';

export const SHADER_LEAF_PINE = `
    precision mediump float;
    uniform vec2 uResolution;
    ${NOISE_GLSL}

    void main() {
        vec2 uv = gl_FragCoord.xy / uResolution;
        vec2 p = (uv - 0.5) * 2.0; // -1 to 1
        
        float r = length(p);
        float a = atan(p.y, p.x);
        
        // B"H - Reduced frequency (25.0 instead of 40.0) for thicker needles that survive mipmaps
        float needleFreq = 25.0;
        float needleBase = sin(a * needleFreq + r * 5.0 + fbm(p * 2.0) * 3.0);
        
        // Thicker needles (smoothstep range moved)
        float needleMask = smoothstep(0.4, 0.6, needleBase);
        
        // Length variation
        float lenNoise = hash(floor(a * needleFreq / 6.28) * 10.0);
        float limit = 0.7 + 0.3 * lenNoise;
        
        float lengthMask = 1.0 - smoothstep(limit - 0.15, limit, r);
        
        // Solid Center Tuft
        float centerGlow = 1.0 - smoothstep(0.0, 0.35, r);
        
        float finalMask = max(needleMask * lengthMask, centerGlow);
        
        if (finalMask < 0.2) discard;
        
        // B"H - Deep Evergreen Colors (No neon)
        vec3 colTip = vec3(0.15, 0.35, 0.12);
        vec3 colBase = vec3(0.02, 0.10, 0.03); // Very dark base
        vec3 brown = vec3(0.20, 0.12, 0.08);
        
        vec3 col = mix(colBase, colTip, r);
        // Add brown woody center
        col = mix(col, brown, centerGlow * 0.8);
        
        // Fake AO
        col *= (0.6 + 0.4 * finalMask);

        gl_FragColor = vec4(col, 1.0);
    }
`;
