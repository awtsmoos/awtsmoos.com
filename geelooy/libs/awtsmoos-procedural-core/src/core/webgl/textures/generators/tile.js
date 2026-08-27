
// B"H
import { NOISE_GLSL } from '../utils/noise.js';

export const SHADER_TILE = `
    precision mediump float;
    uniform vec2 uResolution;
    ${NOISE_GLSL}
    
    void main() {
        vec2 uv = gl_FragCoord.xy / uResolution;
        vec2 st = uv * vec2(8.0, 8.0);
        
        vec2 f = fract(st);
        
        // Border for grout
        float border = smoothstep(0.02, 0.05, f.x) * smoothstep(0.98, 0.95, f.x) *
                       smoothstep(0.02, 0.05, f.y) * smoothstep(0.98, 0.95, f.y);
        
        // Tile gradient (subtle curve)
        float shine = sin(f.x * 3.14) * sin(f.y * 3.14);
        
        vec3 tileCol = vec3(0.9, 0.95, 1.0); // White ceramic
        tileCol -= 0.1 * (1.0 - shine); // Darker edges
        
        vec3 groutCol = vec3(0.4, 0.4, 0.45);
        
        vec3 col = mix(groutCol, tileCol, border);
        
        gl_FragColor = vec4(col, 1.0);
    }
`;
