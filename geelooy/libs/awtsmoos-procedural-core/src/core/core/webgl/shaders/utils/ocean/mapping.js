
// B"H
export const VS_OCEAN_MAPPING = `
// B"H - Transforms standard grid vertices into infinite projected horizons.
void applyDualZoneMapping(vec2 vertexXZ, vec3 cameraPos, out vec3 outPos, out float outDetailFade) {
    float r = length(vertexXZ);
    
    // Bounds for blending from high-fidelity localized grid to expansive infinite horizon.
    float innerR = 0.18; 
    float outerR = 0.55;
    
    float scaleLinear = r * 150.0;
    float scaleExp = 150.0 + pow(max(0.0, r - innerR), 3.0) * 160000.0;
    
    float mixT = smoothstep(innerR, outerR, r);
    float dist = mix(scaleLinear, scaleExp, mixT);

    vec2 dir = (r > 0.0001) ? (vertexXZ / r) : vec2(0.0, 1.0);
    outPos = vec3(dir.x * dist, 0.0, dir.y * dist);
    
    outPos.xz += cameraPos.xz;
    outDetailFade = 1.0 - mixT;
}
`;
