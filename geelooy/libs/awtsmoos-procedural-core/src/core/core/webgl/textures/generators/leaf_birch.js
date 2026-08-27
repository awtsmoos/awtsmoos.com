
// B"H
import { NOISE_GLSL } from '../utils/noise.js';

export const SHADER_LEAF_BIRCH = `
    precision mediump float;
    uniform vec2 uResolution;
    ${NOISE_GLSL}

    void main() {
        vec2 uv = gl_FragCoord.xy / uResolution;
        vec2 p = (uv - vec2(0.5, 0.1)) * vec2(2.0, 1.2);
        
        float a = atan(p.x, p.y);
        
        // Wider base width
        float w = 0.55 * (1.0 - p.y) * smoothstep(0.0, 0.15, p.y);
        
        // Reduced serration frequency for visibility
        float serration = abs(sin(p.y * 40.0)) * 0.015;
        
        float dist = abs(p.x) - (w + serration);
        float mask = 1.0 - smoothstep(0.0, 0.02, dist);
        
        // Stem (Extend to bottom)
        if (p.y < 0.0 && abs(p.x) < 0.025) mask = 1.0;
        
        if (mask < 0.2) discard;
        
        // B"H - Golden-Green (Birch realism)
        vec3 cGreen = vec3(0.25, 0.55, 0.15);
        vec3 cYellow = vec3(0.55, 0.65, 0.1); 
        vec3 cVein = vec3(0.4, 0.7, 0.2);

        float vStripes = abs(sin(p.y * 25.0 + abs(p.x) * 8.0));
        float veinMask = smoothstep(0.92, 1.0, vStripes);
        
        float noiseVal = fbm(uv * 12.0);
        vec3 col = mix(cGreen, cYellow, noiseVal * 0.3);
        col = mix(col, cVein, veinMask * 0.4);
        
        gl_FragColor = vec4(col, 1.0);
    }
`;
