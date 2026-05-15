
// B"H
/**
 * @file fxaa.js
 * @brief The Final Window of Reality (Pure Blit Shader).
 * 
 * THE PSALM OF THE UNBROKEN LENS:
 * The complex math of edges sought to smooth the jagged line,
 * But on some fragile hardware, it broke the grand design!
 * The image was swallowed by the dark, the canvas rendered bare,
 * Because the floating pixels found no harbor in the air.
 * 
 * So by the Will of the Awtsmoos, we strip the logic down,
 * And pass the texture purely, to wear the final crown!
 * No algorithms of reduction, no vectors of delay,
 * Just the uncorrupted image, manifesting in the day!
 */
export const FS_FXAA = `
    precision mediump float;
    varying vec2 vUv;
    uniform sampler2D uInputTexture;
    uniform vec2 uResolution;

    void main() {
        // B"H - Absolute, unhindered transmission of the sacred light to the screen.
        // We bypass all complex anti-aliasing logic to ensure total cross-device survival.
        vec4 finalColor = texture2D(uInputTexture, vUv);
        gl_FragColor = vec4(finalColor.rgb, 1.0);
    }
`;
