
// B"H
/**
 * @file blur.js
 * @brief This scroll contains the fragment shader for a separable Gaussian blur,
 *        used to create the soft halo of the bloom effect.
 */
export const FS_BLUR = `
    precision mediump float;
    varying vec2 vUv;
    uniform sampler2D uInputTexture;
    uniform vec2 uDirection;
    uniform vec2 uResolution;

    void main() {
        vec2 texelSize = 1.0 / uResolution;
        vec4 result = vec4(0.0);
        float weights[3];
        weights[0] = 0.227027; weights[1] = 0.1945946; weights[2] = 0.1216216;

        result += texture2D(uInputTexture, vUv) * weights[0];
        for (int i = 1; i < 3; i++) {
            float w = weights[i];
            vec2 offset = float(i) * texelSize * uDirection;
            result += texture2D(uInputTexture, vUv + offset) * w;
            result += texture2D(uInputTexture, vUv - offset) * w;
        }
        gl_FragColor = result;
    }
`;
