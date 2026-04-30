
/**
 * B"H
 * @module FragmentBody
 * @description
 * The physical execution of the grass pattern. 
 * Converts numerical noise into the actual colors of the emerald plane.
 */
export default class FragmentBody {
    static get() {
        return `
            // Scale World Position for density
            vec2 posUV = vAwtsmoosWorldPos.xz * 0.15;
            
            float n = awtsmoosFbm(posUV);
            
            vec3 darkGreen = vec3(0.01, 0.15, 0.01);
            vec3 brightGreen = vec3(0.12, 0.45, 0.08);
            vec3 patchyEarth = vec3(0.25, 0.35, 0.12); 
            
            vec3 finalGrassColor = mix(darkGreen, brightGreen, n);
            
            float n2 = awtsmoosNoise(posUV * 4.0);
            if (n2 > 0.75) {
                finalGrassColor = mix(finalGrassColor, patchyEarth, (n2 - 0.75) * 4.0);
            }

            diffuseColor.rgb = finalGrassColor;
        `;
    }
}
