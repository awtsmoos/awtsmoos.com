
// B"H
import { NOISE_GLSL } from '../utils/noise.js';

export const SHADER_BARK = `
    precision mediump float;
    uniform vec2 uResolution;
    ${NOISE_GLSL}
    
    // B"H - Height Map Generation Function
    float getHeight(vec2 uv) {
        // 1. Domain Warping for Organic Flow
        vec2 warp = vec2(
            fbm(uv * 2.0),
            fbm(uv * 2.0 + vec2(5.2, 1.3))
        );
        vec2 st = uv + warp * 0.25; 
        
        // 2. Anisotropy - Stretched vertical wood grain
        st.y *= 0.3; 
        st.x *= 4.0; 

        // 3. Voronoi Ridges (F2-F1) for Deep Cracks
        vec2 v = voronoi(st * 3.5);
        float ridges = v.y - v.x; 
        // Sharpen the cracks
        ridges = smoothstep(0.05, 0.35, ridges); 
        ridges = pow(ridges, 0.4); 
        
        // 4. Layered Noise for Surface Roughness
        float detail = fbmHigh(uv * 30.0);
        float micro = noise(uv * 120.0);
        
        // 5. Knotholes
        float gnarl = noise(uv * 1.0 + warp);
        gnarl = smoothstep(0.4, 0.6, gnarl);
        
        // Combine
        float height = ridges * 0.65 + detail * 0.25 + micro * 0.05 + gnarl * 0.05;
        return clamp(height, 0.0, 1.0);
    }

    void main() {
        vec2 uv = gl_FragCoord.xy / uResolution;
        
        float h = getHeight(uv);
        
        // Normal Map Calc
        vec2 e = vec2(2.0 / uResolution.x, 0.0);
        float hx = getHeight(uv + e.xy) - getHeight(uv - e.xy);
        float hy = getHeight(uv + e.yx) - getHeight(uv - e.yx);
        float normalStrength = 12.0; 
        vec3 normal = normalize(vec3(-hx * normalStrength, -hy * normalStrength, 1.0));
        
        // --- 2. COLOR PALETTE (Realistic Oak/Ash) ---
        vec3 colFissure = vec3(0.05, 0.04, 0.03); 
        vec3 colBase    = vec3(0.28, 0.24, 0.20); 
        vec3 colRidge   = vec3(0.45, 0.42, 0.38); 
        vec3 colLichen  = vec3(0.5, 0.55, 0.45); 
        vec3 colMoss    = vec3(0.15, 0.30, 0.05); 
        
        // Base gradient
        vec3 albedo = mix(colFissure, colBase, smoothstep(0.0, 0.3, h));
        albedo = mix(albedo, colRidge, smoothstep(0.3, 0.8, h));
        
        // Lichen spots (Light greenish grey)
        float lichenNoise = fbm(uv * 5.0);
        float lichenMask = smoothstep(0.55, 0.7, lichenNoise) * smoothstep(0.2, 0.9, h);
        albedo = mix(albedo, colLichen, lichenMask * 0.8);
        
        // Moss in crevices (Low height, high AO areas)
        float mossNoise = fbm(uv * 8.0);
        float mossMask = smoothstep(0.4, 0.7, mossNoise) * (1.0 - smoothstep(0.1, 0.5, h));
        albedo = mix(albedo, colMoss, mossMask * 0.9);

        // AO
        float ao = smoothstep(0.0, 0.4, h);
        albedo *= (0.2 + 0.8 * ao);
        
        // Pre-baked lighting for texture
        vec3 lightDir = normalize(vec3(0.8, 1.0, 0.5));
        float diff = max(dot(normal, lightDir), 0.0);
        vec3 lighting = vec3(0.15) + vec3(0.85) * diff;
        
        gl_FragColor = vec4(albedo * lighting, 1.0);
    }
`;
