
// B"H
import { NOISE_GLSL } from '../utils/noise.js';

export const SHADER_BARK_BIRCH = `
    precision mediump float;
    uniform vec2 uResolution;
    ${NOISE_GLSL}
    
    void main() {
        vec2 uv = gl_FragCoord.xy / uResolution;
        
        // Base white paper look
        float paper = fbm(uv * 100.0);
        vec3 white = vec3(0.9, 0.9, 0.85);
        vec3 grey = vec3(0.7, 0.7, 0.65);
        vec3 col = mix(white, grey, paper * 0.3);
        
        // Horizontal Striations (Lenticels)
        vec2 st = uv * vec2(1.0, 50.0); // Stretched X
        float strips = noise(st);
        strips = smoothstep(0.6, 0.8, strips);
        
        // Limit striation length
        float patch = noise(uv * 10.0);
        strips *= step(0.4, patch);
        
        // Black Knots
        float knots = cellular(uv * 4.0);
        float knotMask = 1.0 - smoothstep(0.0, 0.15, knots);
        
        vec3 dark = vec3(0.1, 0.08, 0.05);
        
        col = mix(col, dark, strips);
        col = mix(col, dark, knotMask);
        
        gl_FragColor = vec4(col, 1.0);
    }
`;
