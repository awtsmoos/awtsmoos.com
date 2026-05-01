
// B"H
/**
 * @module GlslFragmentEmerald
 */
export default class GlslFragment {
    static getHeader() {
        return "varying vec3 vAwtsmoosWorldPos;\n";
    }

    static getBody() {
        return `
            #include <color_fragment>
            
            vec2 uv = vAwtsmoosWorldPos.xz * 0.05;
            
            // Crystalline Pattern (Voronoi-ish)
            float n = awtsmoosNoise(uv);
            float n2 = awtsmoosNoise(uv * 2.5 + n);
            
            // Sharp edges for crystals
            float crystal = step(0.5, n2);
            
            vec3 emeraldBase = vec3(0.0, 0.4, 0.2);
            vec3 emeraldLight = vec3(0.1, 0.8, 0.4);
            vec3 sparkle = vec3(0.6, 1.0, 0.8);
            
            vec3 finalColor = mix(emeraldBase, emeraldLight, n);
            finalColor = mix(finalColor, sparkle, crystal * 0.3);
            
            // Add a geometric "facet" effect
            float facets = sin(vAwtsmoosWorldPos.x * 0.2) * cos(vAwtsmoosWorldPos.z * 0.2);
            finalColor += facets * 0.05;

            diffuseColor.rgb = finalColor;
        `;
    }
}
