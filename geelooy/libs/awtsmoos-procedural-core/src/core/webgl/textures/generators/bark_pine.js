
// B"H
import { NOISE_GLSL } from '../utils/noise.js';

export const SHADER_BARK_PINE = `
    #extension GL_OES_standard_derivatives : enable
    precision mediump float;
    uniform vec2 uResolution;
    ${NOISE_GLSL}
    
    void main() {
        vec2 uv = gl_FragCoord.xy / uResolution;
        
        // Large scale plates (Voronoi)
        vec2 st = uv * vec2(4.0, 8.0);
        vec2 v = voronoi(st);
        float plates = v.y - v.x; // Edges
        plates = smoothstep(0.0, 0.2, plates);
        
        // Micro detail
        float grain = fbm(uv * 40.0);
        
        // Color Palette
        vec3 darkRed = vec3(0.35, 0.15, 0.1);
        vec3 greyBrown = vec3(0.4, 0.35, 0.3);
        vec3 deepCrack = vec3(0.05, 0.02, 0.0);
        
        vec3 col = mix(deepCrack, darkRed, plates);
        col = mix(col, greyBrown, grain * 0.3 * plates);
        
        // Lighting bake (Fake Normal using derivatives)
        float h = plates * (0.5 + 0.5 * grain);
        vec3 normal = normalize(vec3(dFdx(h), dFdy(h), 0.1)); 
        float light = dot(normal, normalize(vec3(1.0, 1.0, 1.0)));
        
        gl_FragColor = vec4(col * (0.5 + 0.5 * light), 1.0);
    }
`;
