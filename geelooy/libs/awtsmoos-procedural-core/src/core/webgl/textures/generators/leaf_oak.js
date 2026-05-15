
// B"H
import { NOISE_GLSL } from '../utils/noise.js';

export const SHADER_LEAF_OAK = `
    precision mediump float;
    uniform vec2 uResolution;
    ${NOISE_GLSL}

    void main() {
        vec2 uv = gl_FragCoord.xy / uResolution;
        vec2 p = (uv - vec2(0.5, 0.0)) * vec2(2.0, 1.2); 
        p.y -= 0.15; 
        
        float r = length(p);
        float a = atan(p.x, p.y);
        
        // Lobes - defined lobes
        float lobes = cos(a * 5.0 + sin(a * 8.0) * 0.5);
        // B"H - Wider body to prevent disappearance
        float shapeDist = r - (0.45 + 0.15 * lobes * (1.0 - p.y * 0.5)); 
        
        // Thicker Stem
        float stem = abs(p.x) - 0.025 * (1.0 - p.y);
        
        float mask = 1.0 - smoothstep(0.0, 0.03, shapeDist);
        float stemMask = 1.0 - smoothstep(0.0, 0.01, stem);
        
        // B"H - Removed bottom clipping that was creating floating leaves
        if (p.y < 0.1 && abs(p.x) < 0.04) mask = 1.0; 
        
        // Ensure stem is part of mask
        mask = max(mask, stemMask * step(p.y, 0.8));

        if (mask < 0.2) discard;
        
        // B"H - Vein Logic
        vec2 veinUV = uv * 8.0;
        veinUV.x += abs(uv.x - 0.5) * 0.5; 
        float vNoise = voronoi(veinUV).y - voronoi(veinUV).x;
        float mainVein = 1.0 - smoothstep(0.0, 0.03, abs(p.x));
        
        float veins = smoothstep(0.08, 0.02, vNoise) + mainVein;
        
        // Rich Hunter Green (Realistic)
        vec3 cDark = vec3(0.05, 0.22, 0.02);
        vec3 cLight = vec3(0.25, 0.45, 0.10);
        vec3 cVein = vec3(0.35, 0.55, 0.15); // Lighter veins
        
        // Subtle variation
        float n = fbm(uv * 4.0);
        vec3 col = mix(cDark, cLight, p.y + n * 0.3);
        col = mix(col, cVein, clamp(veins, 0.0, 0.5));
        
        gl_FragColor = vec4(col, 1.0);
    }
`;
