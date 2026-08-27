
// B"H
/**
 * @file pbr.js
 * @brief Physicall-Based Reflections for the great mirror of creation.
 */

export const FS_OCEAN_PBR = `
float getFresnel(vec3 n, vec3 v) {
    float nv = max(dot(n, v), 0.0);
    float f0 = 0.02;
    return f0 + (1.0 - f0) * pow(1.0 - nv, 5.0);
}

vec3 getSpecular(vec3 n, vec3 v, vec3 l, vec3 r) {
    vec3 h = normalize(l + v);
    float nh = max(dot(n, h), 0.0);
    
    // Core Solar Reflection
    float sCore = pow(nh, 2048.0) * 2.0; // Tamed
    
    // Wide Specular Spread
    float sSpread = pow(nh, 128.0) * 0.2;  // Tamed
    
    // Micro-Glints
    float glint = pow(max(0.0, dot(r, l)), 4096.0) * 2.0; // Tamed
    
    float occ = smoothstep(-0.2, 0.2, dot(n, l));
    float totalSpec = clamp(sCore + sSpread + glint, 0.0, 5.0) * max(uSunIntensity, 0.0);
    
    return uDirectionalLightColor * totalSpec * occ;
}
`;
