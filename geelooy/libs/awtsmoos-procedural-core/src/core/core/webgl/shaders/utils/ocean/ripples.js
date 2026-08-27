
// B"H
export const FS_OCEAN_RIPPLES = `
/**
 * @function applyRipples
 * @brief Smooth, glassy wind-ripples that do not cause jagged white blowouts.
 */
vec3 applyRipples(vec3 baseN, vec2 p, float d) {
    float detailFade = 1.0 - smoothstep(5000.0, 15000.0, d);
    if (detailFade <= 0.001) return baseN; 
    
    float t = uTime * 0.4;
    
    // B"H - Utilizing pure, smooth simplex noise without absolute inversions
    vec2 st1 = p * 0.03 + vec2(t * 0.4, t * 0.2);
    float n1 = snoise(vec3(st1, t * 0.15)); 
    
    vec2 st2 = p * 0.12 - vec2(t * 0.15, t * 0.5);
    float n2 = snoise(vec3(st2, t * 0.3));
    
    float microFade = 1.0 - smoothstep(500.0, 2500.0, d);
    vec2 st3 = p * 0.4 + vec2(t, -t);
    float n3 = snoise(vec3(st3, t * 0.8)) * microFade;

    // B"H - Extremely gentle bumpiness
    float bumpiness = 0.05; 
    vec3 microNormal = normalize(vec3(
        (n1 + n2 * 0.6 + n3 * 0.3) * bumpiness,
        1.0, 
        (n2 - n1 * 0.4 - n3 * 0.3) * bumpiness
    ));
    
    vec3 finalNormal = normalize(mix(baseN, baseN + microNormal, detailFade));
    if(!gl_FrontFacing) finalNormal = -finalNormal;
    
    return finalNormal;
}
`;
