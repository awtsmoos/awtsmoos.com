
// B"H
import { NOISE_GLSL } from '../utils/noise.js';

export const SHADER_CLOTH = `
    precision mediump float;
    uniform vec2 uResolution;
    ${NOISE_GLSL}
    
    void main() {
        vec2 uv = gl_FragCoord.xy / uResolution;
        
        // High frequency weave
        vec2 weaveUV = uv * 150.0;
        
        // Cross-hatch pattern
        float v1 = sin(weaveUV.x);
        float v2 = sin(weaveUV.y);
        
        float weave = (v1 + v2) * 0.5;
        
        vec3 threadCol = vec3(0.2, 0.4, 0.8); // Blue denim-ish
        vec3 shadowCol = vec3(0.1, 0.2, 0.5);
        
        vec3 col = mix(shadowCol, threadCol, weave * 0.5 + 0.5);
        
        // Macro variations (folds/dirt)
        float macro = fbm(uv * 5.0);
        col *= (0.8 + 0.4 * macro);
        
        gl_FragColor = vec4(col, 1.0);
    }
`;
