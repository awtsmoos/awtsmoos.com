
// B"H
export const FS_OCEAN_NORMALS = `
vec3 applyRipples(vec3 baseN, vec2 p, float d) {
    // Fade out noise entirely at a distance for a perfect horizon
    float fd = 1.0 - smoothstep(50.0, 800.0, d);
    if (fd <= 0.0) return baseN; 
    
    vec2 st = p * 0.15;
    float t = uTime * 0.5;
    
    // Very subtle, sleek noise values
    float n1 = snoise(vec3(st, t)) * 0.03;
    float n2 = snoise(vec3(st * 1.8 + vec2(10.0), t * 1.2)) * 0.03;

    vec3 mc = normalize(vec3(n1, 1.0, n2));
    vec3 cl = normalize(mix(baseN, mc, fd));
    
    if(!gl_FrontFacing) cl = -cl;
    return cl;
}
`;
