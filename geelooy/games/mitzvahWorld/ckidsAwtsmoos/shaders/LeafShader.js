
// B"H
/**
 * @file LeafShader.js
 * @module LeafShader
 */

export const LEAF_SNIPPETS = {
    uniforms: {
        uTime:         { value: 0 },
        uPlayerPos:    { value: { x: 999, y: 999, z: 999 } },
        uSeason:       { value: 0.0 },
        uColorSummer:  { value: { r: 0.1, g: 0.4, b: 0.1 } }, // B"H: Vivid Summer
        uColorAutumn:  { value: { r: 0.7, g: 0.3, b: 0.05 } } // B"H: Golden Autumn
    },
    vertex: {
        head: `
            uniform float uTime;
            uniform vec3 uPlayerPos;
            varying vec2 vLeafUv;
            varying vec3 vLeafWorldPos;
        `,
        main: `
            vLeafUv = uv;
            vec4 leafWPos = modelMatrix * vec4(transformed, 1.0);
            vLeafWorldPos = leafWPos.xyz;

            // B"H: Complex Fluttering Wind
            float windBase = sin(leafWPos.x * 0.5 + uTime * 2.0) * cos(leafWPos.z * 0.5 + uTime * 1.5);
            float windDetail = sin(leafWPos.y * 2.0 + uTime * 5.0) * 0.5;
            float totalWind = (windBase + windDetail) * 0.5;
            
            // Leaves flutter more at their tips
            transformed.y += totalWind * 0.15 * uv.x;
            transformed.z += windBase * 0.2 * uv.x;
            transformed.x += windDetail * 0.1 * uv.x;

            // B"H: Chossid Interaction
            vec3 pushDir = leafWPos.xyz - uPlayerPos;
            float d = length(pushDir);
            if(d < 4.0 && d > 0.001) {
                float strength = smoothstep(4.0, 0.0, d);
                transformed += normalize(normal) * strength * 1.5 * uv.x;
            }
        `
    },
    fragment: {
        head: `
            uniform vec3 uColorSummer;
            uniform vec3 uColorAutumn;
            uniform float uSeason;
            varying vec2 vLeafUv;
        `,
        color: `
            // B"H: A deeply organic, multi-layered leaf essence
            vec2 centeredUv = vLeafUv - 0.5;
            
            // 1. Structural Shape: More natural, curved, teardrop
            // We bend the y-axis to give it a sweeping curve
            float bend = sin(centeredUv.x * 3.14) * 0.2;
            vec2 shapedUv = vec2(centeredUv.x, centeredUv.y + bend);
            
            float angle = atan(shapedUv.y, shapedUv.x);
            float radius = length(shapedUv);
            
            // The organic teardrop math
            float baseShape = 1.0 + 0.3 * sin(angle * 2.0);
            float taper = smoothstep(0.5, -0.5, shapedUv.x); // Fatter at base, pointy at tip
            float r = radius * (1.2 + 0.5 * abs(sin(angle))) * (1.0 + 0.2 * taper);
            
            float leafShape = smoothstep(0.45, 0.4, r);
            
            // B"H: Discard the void outside the leaf
            if(leafShape < 0.05) discard;

            // 2. The Living Chlorophyll
            vec3 seasonalColor = mix(uColorSummer, uColorAutumn, uSeason);
            
            // 3. Intricate Vein Network
            // Center primary vein
            float primaryVein = smoothstep(0.02, 0.0, abs(shapedUv.y)) * smoothstep(0.5, -0.2, shapedUv.x);
            // Secondary branching veins
            float branchFreq = 20.0;
            float secondaryVeins = abs(sin(shapedUv.x * branchFreq + abs(shapedUv.y) * branchFreq * 1.5));
            secondaryVeins = smoothstep(0.85, 0.95, secondaryVeins) * 0.3;
            
            float totalVeins = max(primaryVein * 0.6, secondaryVeins);

            // 4. Cellular Sub-surface details (Voronoi/Noise approximation)
            float cellular = sin(vLeafUv.x * 50.0) * cos(vLeafUv.y * 50.0);
            cellular = smoothstep(0.2, 0.8, cellular) * 0.15;

            // 5. Synthesis
            // Combine seasonal color with the underlying texture (diffuseColor.rgb)
            // If the texture is pure white (fallback), diffuseColor is just lighting * white.
            vec3 livingColor = diffuseColor.rgb * seasonalColor; 
            
            // Apply cellular variations
            livingColor += seasonalColor * cellular;
            
            // Subtract veins to make them darker/deeper
            livingColor = mix(livingColor, livingColor * 0.4, totalVeins);
            
            // Golden Rim Light (Edge Highlight)
            float rim = smoothstep(0.35, 0.45, r);
            vec3 rimColor = mix(vec3(0.4, 0.6, 0.2), vec3(0.8, 0.5, 0.1), uSeason);
            livingColor += rimColor * rim * 0.4;

            // 6. Final Manifestation
            // Increase saturation and brightness slightly for a vibrant, sun-kissed look
            diffuseColor.rgb = livingColor * 1.5; 
            diffuseColor.a = min(diffuseColor.a, leafShape);
        `

    }
};

export function getLeafUniforms(type = 'oak') {
    return {
        uTime:        { value: 0 },
        uPlayerPos:   { value: { x: 999, y: 999, z: 999 } },
        uSeason:      { value: 0.0 },
        uColorSummer: { value: { r: 0.1, g: 0.4, b: 0.1 } },
        uColorAutumn: { value: { r: 0.7, g: 0.3, b: 0.05 } }
    };
}
