
// B"H
import { NOISE_GLSL } from '../utils/noise.js';

export const SHADER_LEAF_ASH = `
    precision mediump float;
    uniform vec2 uResolution;
    ${NOISE_GLSL}
    
    // B"H - Draw a single leaflet shape
    float leaflet(vec2 p, vec2 offset, float scale, float rot) {
        // Transform to local space
        vec2 local = p - offset;
        float c = cos(rot), s = sin(rot);
        local = mat2(c, -s, s, c) * local;
        local /= scale;
        
        // Shape (Lanceolate)
        float w = 0.35 * (1.0 - abs(local.y)) * smoothstep(-1.0, -0.2, local.y);
        float d = length(local * vec2(2.0, 1.0)); // Fatter shape
        
        return 1.0 - smoothstep(0.4, 0.45, d);
    }

    // B"H - Draw a connecting stem to a leaflet
    float connection(vec2 p, vec2 start, vec2 end, float thickness) {
        vec2 pa = p - start;
        vec2 ba = end - start;
        float h = clamp(dot(pa, ba) / dot(ba, ba), 0.0, 1.0);
        float d = length(pa - ba * h);
        return 1.0 - smoothstep(thickness, thickness + 0.01, d);
    }

    void main() {
        vec2 uv = gl_FragCoord.xy / uResolution;
        vec2 p = (uv - 0.5) * 2.0; // -1 to 1 space
        
        float mask = 0.0;
        
        // 1. Central Rachis (Main Stem) - THICKER and extends to bottom
        float stemWidth = 0.035; 
        float stem = 1.0 - smoothstep(stemWidth, stemWidth + 0.01, abs(p.x));
        // B"H - Removed bottom crop to ensure it connects to the branch
        mask = max(mask, stem);
        
        // 2. Leaflets
        // Top one
        mask = max(mask, leaflet(p, vec2(0.0, 0.85), 0.35, 0.0));
        
        // Side pairs
        for(int i=0; i<3; i++) {
            float y = 0.45 - float(i) * 0.55;
            
            // Left Leaflet
            vec2 lPos = vec2(-0.5, y);
            mask = max(mask, leaflet(p, lPos, 0.3, -0.6));
            // Connect Left to Center
            mask = max(mask, connection(p, vec2(0.0, y - 0.1), lPos, 0.015));

            // Right Leaflet
            vec2 rPos = vec2(0.5, y);
            mask = max(mask, leaflet(p, rPos, 0.3, 0.6));
            // Connect Right to Center
            mask = max(mask, connection(p, vec2(0.0, y - 0.1), rPos, 0.015));
        }
        
        if (mask < 0.2) discard;
        
        // B"H - Natural Ash Green (Forest tones, not neon)
        vec3 cFresh = vec3(0.18, 0.45, 0.12); // Deeper green
        vec3 cDark = vec3(0.08, 0.25, 0.05);
        vec3 cStem = vec3(0.45, 0.5, 0.3); // Woodier stem
        
        float n = fbm(uv * 10.0);
        vec3 col = mix(cDark, cFresh, n + 0.3);
        
        // Tint stem area
        if (abs(p.x) < 0.04) col = mix(col, cStem, 0.8);
        
        gl_FragColor = vec4(col, 1.0);
    }
`;
