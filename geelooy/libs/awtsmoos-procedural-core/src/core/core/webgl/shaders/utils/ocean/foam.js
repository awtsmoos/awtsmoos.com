
// B"H
/**
 * @file foam.js
 * @brief The Lace of the Breakers.
 */

export const FS_OCEAN_FOAM = `
vec3 getFoam(float h, float jacobian, vec2 p, float d) {
    float distFade = 1.0 - smoothstep(15000.0, 25000.0, d);
    if (distFade <= 0.001) return vec3(0.0);
    
    vec2 st = p * 0.12 + vec2(uTime * 0.25, uTime * 0.15);
    
    float n1 = snoise(vec3(st, uTime * 0.08));
    float n2 = snoise(vec3(st * 3.5, uTime * 0.12));
    float lace = smoothstep(0.0, 0.7, abs(n1 * 0.7 + n2 * 0.5));
    
    // B"H - STRICTER MASKS
    float foldMask = 1.0 - smoothstep(0.1, 0.4, jacobian); 
    // Only foam on the most massive waves (25+ units high!)
    float peakMask = smoothstep(25.0, 40.0, h); 
    
    float foamMask = max(foldMask, peakMask) * lace * distFade;
    
    vec3 foamColor = vec3(0.7, 0.85, 0.95) * max(uSunIntensity, 0.5);
    
    return foamColor * foamMask;
}
`;
