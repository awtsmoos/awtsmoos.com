
// B"H
/**
 * @file brightpass.js
 * @brief This scroll contains the fragment shader for the bright-pass filter,
 *        which isolates the most luminous parts of the creation for blooming.
 */
export const FS_BRIGHT_PASS = `
    precision mediump float;
    varying vec2 vUv;
    uniform sampler2D uSceneTexture;
    uniform float uThreshold;

    void main() {
        vec4 color = texture2D(uSceneTexture, vUv);
        float brightness = dot(color.rgb, vec3(0.2126, 0.7152, 0.0722));
        vec3 brightColor = max(color.rgb - uThreshold, vec3(0.0));
        gl_FragColor = vec4(brightColor / (1.0 + brightness), 1.0);
    }
`;
