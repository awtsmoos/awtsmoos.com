
/**
 * B"H
 * @module GlslFragment
 * @description
 * The pixel's final destiny. Wires the noise measurements into the light and 
 * color that our eyes perceive as "grass". 
 */
import Constants from "./Constants.js?compact=true&v=full-chain-cache-bust-20260708-bh10";

export default class GlslFragment {
    static getHeader() {
        return "varying vec3 vAwtsmoosWorldPos;\n";
    }

    static getBody() {
        const { COLORS, SCALES } = Constants;
        return `
            #include <color_fragment>
            
            // Map World position to sampling UVs
            vec2 posUV = vAwtsmoosWorldPos.xz * ${SCALES.noise};
            
            // Generate basic FBM pattern
            float n = awtsmoosFbm(posUV);
            
            // Base Mix
            vec3 finalColor = mix(${COLORS.dark}, ${COLORS.bright}, n);
            
            // Add dry patches
            float patches = awtsmoosNoise(posUV * ${SCALES.patchy});
            if (patches > 0.78) {
                finalColor = mix(finalColor, ${COLORS.earth}, (patches - 0.78) * 4.54);
            }

            diffuseColor.rgb = finalColor;
        `;
    }
}
