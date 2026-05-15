
// B"H
import { NOISE_GLSL } from '../utils/noise.js';

export const SHADER_LEAF = `
    precision mediump float;
    uniform vec2 uResolution;
    ${NOISE_GLSL}
    
    // Signed Distance Field for a leaf shape (approx)
    float sdVesica(vec2 p, float r, float d) {
        p = abs(p);
        float b = sqrt(r*r-d*d);
        return ((p.y-b)*d>p.x*b) ? length(p-vec2(0.0,b))
                                 : length(p-vec2(-d,0.0))-r;
    }

    void main() {
        vec2 uv = gl_FragCoord.xy / uResolution;
        // Center at 0.5, 0.0 (stem at bottom)
        vec2 p = uv; 
        p.x = (p.x - 0.5) * 2.0; // -1 to 1
        p.y = p.y * 1.2;         // 0 to 1.2
        
        // Oak leaf has lobes. Let's do a simple serrated oval first.
        float r = length(p - vec2(0.0, 0.5));
        float angle = atan(p.x, p.y - 0.5);
        
        // Base shape width varies with height
        float width = 0.5 * sin(p.y * 3.1415);
        
        // Lobes
        float lobes = 0.15 * abs(sin(p.y * 20.0));
        float maskDist = abs(p.x) - (width + lobes);
        
        // Stem
        float stem = 1.0 - smoothstep(0.0, 0.02, abs(p.x));
        if (p.y < 0.1 && abs(p.x) < 0.02) maskDist = -1.0; // Keep stem
        
        if (maskDist > 0.0) {
            gl_FragColor = vec4(0.0, 0.0, 0.0, 0.0);
            return;
        }
        
        // Veins
        float veinMain = 1.0 - smoothstep(0.0, 0.015, abs(p.x));
        // Angled side veins
        float vY = fract(p.y * 5.0); // repeating
        float veinSide = 0.0;
        // Simple lines
        float veinCoords = abs(p.x * 2.0 - mod(p.y * 8.0, 1.0));
        // Better:
        float diagonal = abs(p.x) - (p.y * 0.5); // Slanted line?
        // Let's use noise for subtle veins
        float cell = cellular(uv * 20.0);
        float veins = 1.0 - smoothstep(0.0, 0.1, cell);
        
        veins = max(veins, veinMain);
        
        vec3 darkGreen = vec3(0.05, 0.25, 0.05);
        vec3 lightGreen = vec3(0.2, 0.5, 0.1);
        vec3 veinCol = vec3(0.3, 0.6, 0.2);
        
        vec3 col = mix(darkGreen, lightGreen, p.y + fbm(uv*10.0)*0.2);
        col = mix(col, veinCol, veins * 0.5);
        
        // Add autumn variation noise
        float decay = fbm(uv * 3.0 + 5.0);
        if (decay > 0.7) {
            col = mix(col, vec3(0.6, 0.4, 0.1), (decay-0.7)*3.0);
        }

        gl_FragColor = vec4(col, 1.0);
    }
`;
