
// B"H
import { NOISE_GLSL } from '../utils/noise.js';

export const SHADER_DIRT = `
    precision highp float;
    uniform vec2 uResolution;
    ${NOISE_GLSL}

    void main() {
        vec2 uv = gl_FragCoord.xy / uResolution;
        
        // 1. PURE SOIL BASE (No grass colors here!)
        float soilNoise = fbm(uv * 15.0);
        vec3 darkSoil = vec3(0.20, 0.14, 0.10);
        vec3 lightSoil = vec3(0.35, 0.28, 0.22);
        vec3 finalCol = mix(darkSoil, lightSoil, soilNoise);
        
        // 2. PEBBLES
        float pd = cellular(uv * 150.0);
        float pebbles = 1.0 - smoothstep(0.0, 0.12, pd);
        vec3 pebbleCol = vec3(0.50, 0.48, 0.45);
        finalCol = mix(finalCol, pebbleCol, pebbles);
        
        // 3. MOISTURE VARIATION (Adds rich, dark spots to the terrain)
        float moisture = fbm(uv * 2.5);
        finalCol *= mix(0.65, 1.0, moisture);

        // Output pure white alpha so the world shader can overlay grass dynamically
        gl_FragColor = vec4(finalCol, 1.0);
    }
`;
