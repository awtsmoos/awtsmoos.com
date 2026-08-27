
// B"H
/**
 * @file brick.js
 * @brief High-fidelity procedural brick generator.
 * 
 * THE HYMN OF THE BRICK:
 * From the clay of the earth, the vessels are fired,
 * A testament to the strength that the Creator desired.
 * We lay them in rows, with mortar between,
 * A structure of logic, peaceful and clean.
 * When the overload failed and the shader was blind,
 * We returned to the pure noise, leaving errors behind!
 */
import { NOISE_GLSL } from '../utils/noise.js';

export const SHADER_BRICK = `
    #extension GL_OES_standard_derivatives : enable
    precision highp float;
    uniform vec2 uResolution;
    ${NOISE_GLSL}
    
    void main() {
        vec2 uv = gl_FragCoord.xy / uResolution;
        
        // Scale determines the number of bricks
        vec2 st = uv * vec2(10.0, 20.0); 
        
        // Offset alternate rows
        float row = floor(st.y);
        if (mod(row, 2.0) > 0.5) {
            st.x += 0.5;
        }
        
        vec2 f = fract(st);
        vec2 i = floor(st);
        
        // Anti-aliased mortar lines using fwidth
        vec2 fw = fwidth(st);
        float blurX = max(fw.x * 1.5, 0.005);
        float blurY = max(fw.y * 1.5, 0.01);
        
        float mortarWidthX = 0.05;
        float mortarWidthY = 0.10;
        
        float mx = smoothstep(0.0, blurX, f.x) - smoothstep(1.0 - mortarWidthX - blurX, 1.0 - mortarWidthX, f.x);
        float my = smoothstep(0.0, blurY, f.y) - smoothstep(1.0 - mortarWidthY - blurY, 1.0 - mortarWidthY, f.y);
        float brickMask = mx * my;
        
        // Edge damage (chip away the perfect rectangles)
        // B"H - Tikkun: Used pure 2D noise instead of snoise to ensure absolute cross-platform harmony
        float damage = noise(st * 4.0);
        brickMask -= smoothstep(0.3, 0.8, damage) * 0.5;
        brickMask = clamp(brickMask, 0.0, 1.0);
        
        // Color Palette
        float id = hash(i.x * 13.3 + i.y * 37.7);
        vec3 colA = vec3(0.65, 0.25, 0.15); // Red brick
        vec3 colB = vec3(0.50, 0.20, 0.12); // Dark brick
        vec3 colC = vec3(0.70, 0.35, 0.20); // Orange brick
        vec3 colD = vec3(0.40, 0.35, 0.35); // Burnt grey brick
        
        vec3 brickCol = mix(colA, colB, id);
        if (id > 0.6) brickCol = mix(brickCol, colC, (id - 0.6) * 2.5);
        if (id > 0.9) brickCol = colD;
        
        // Grain
        float grain = fbm(uv * 150.0);
        brickCol *= (0.8 + 0.4 * grain);
        
        // Rich Mortar
        vec3 mortarCol = vec3(0.6, 0.6, 0.55);
        mortarCol *= (0.7 + 0.6 * fbm(uv * 50.0));
        
        // Combine
        vec3 finalCol = mix(mortarCol, brickCol, brickMask);
        
        // Fake Ambient Occlusion / Bevel Depth
        float edgeShadow = smoothstep(0.0, 0.5, mx * my);
        finalCol *= mix(0.5, 1.0, edgeShadow);

        gl_FragColor = vec4(finalCol, 1.0);
    }
`;
