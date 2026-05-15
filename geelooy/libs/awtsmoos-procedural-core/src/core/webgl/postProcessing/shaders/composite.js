// B"H
/**
 * @file composite.js
 * @brief This scroll unites the LDR sRGB scene with its glowing aura and handles the
 *        divine mystery of the world beneath the waves.
 */
export const FS_COMPOSITE = `
    precision mediump float;
    varying vec2 vUv;
    
    uniform sampler2D uSceneTexture;
    uniform sampler2D uBloomTexture;
    
    uniform vec3 uCameraPos;
    uniform float uWaterLevel; 

    void main() {
        bool isUnderwater = uCameraPos.y < uWaterLevel; 

        vec4 sceneData = texture2D(uSceneTexture, vUv);
        vec3 sceneColor = sceneData.rgb;
        vec3 bloomColor = texture2D(uBloomTexture, vUv).rgb;
        
        // Additive bloom, softened to a gentle aura
        vec3 finalColor = sceneColor + bloomColor * 0.7; 

        if (isUnderwater) {
            float depth = max(0.0, uWaterLevel - uCameraPos.y);
            // A more vibrant, less murky cyan for the underwater fog, a true tropical hue
            vec3 waterTint = vec3(0.05, 0.35, 0.5);
            
            // A softer, more gradual fog falloff, allowing light to penetrate deeper
            float fogFactor = 1.0 - exp(-depth * 0.04);
            finalColor = mix(finalColor, waterTint, 0.3 + fogFactor * 0.65);
            
            // A softer, wider vignette for a less claustrophobic and more natural feel
            float vignette = 1.0 - smoothstep(0.2, 1.5, length(vUv - 0.5));
            finalColor *= (vignette * 0.5 + 0.5);
        } 

        // Clamp the final light to prevent it from shattering the vessel of the screen
        finalColor = clamp(finalColor, 0.0, 1.0);

        gl_FragColor = vec4(finalColor, sceneData.a);
    }
`;