
// B"H
/**
 * @file colors.js
 * @brief Balanced aquatic optics for a natural sea appearance.
 */

export const FS_OCEAN_COLORS = `
vec3 getOceanColor(vec3 n, vec3 l, vec3 v, float h, float pu) {
    float d = length(uViewPos - vWP);

    // Deep spectral absorption
    vec3 absorption = vec3(0.95, 0.35, 0.08); 
    float virtualDepth = clamp(12.0 + (h * -3.0), 1.0, 120.0);
    vec3 transmission = exp(-absorption * virtualDepth * 0.1);

    vec3 deepNavy = vec3(0.002, 0.01, 0.035); 
    vec3 shallowCyan = vec3(0.005, 0.28, 0.35); 
    
    vec3 baseBody = mix(deepNavy, shallowCyan, transmission);
    
    // Sub-Surface Scattering - reduced to prevent neon glowing
    float backLit = max(0.0, dot(v, -l));
    float crestGlow = smoothstep(-1.0, 3.0, h);
    float scatterFade = 1.0 - smoothstep(10000.0, 20000.0, d);
    
    vec3 sssCol = vec3(0.02, 0.25, 0.22); 
    vec3 sss = sssCol * pow(backLit, 5.0) * crestGlow * scatterFade * max(uSunIntensity, 0.3);

    vec3 finalColor = baseBody + sss;
    
    // Ambient fill to ground the troughs
    float waveAO = mix(0.4, 1.0, smoothstep(-4.0, 1.0, h));

    return finalColor * waveAO;
}
`;
