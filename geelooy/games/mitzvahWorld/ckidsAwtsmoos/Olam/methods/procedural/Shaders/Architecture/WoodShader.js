
/**
 * B"H
 * @module WoodShader
 * @description
 * "He carves out the vessels... the cedar of Lebanon."
 * This module generates organic wood patterns (Kash) by measuring the distance
 * from the world center to create ring patterns, layered with linear noise 
 * for the fine grain.
 */
export default class WoodShader {
    static inject(shader) {
        if (!shader.uniforms || shader.uniforms.diffuse === undefined) return;

        shader.vertexShader = `varying vec3 vWoodPos;\n` + shader.vertexShader;
        shader.vertexShader = shader.vertexShader.replace(
            '#include <worldpos_vertex>',
            `#include <worldpos_vertex>\nvWoodPos = (modelMatrix * vec4(transformed, 1.0)).xyz;`
        );

        shader.fragmentShader = `
            varying vec3 vWoodPos;
            
            float woodNoise(vec2 p) {
                return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453);
            }

            void applyAwtsmoosWood(inout vec3 color, vec3 worldPos) {
                // B"H: The Ring Decree
                vec3 p = worldPos;
                float r = length(p.xz) * 5.0; // Radial frequency
                
                // Add some jitter to the rings
                r += woodNoise(p.xy * 0.1) * 2.0; 
                
                float rings = fract(r);
                rings = smoothstep(0.0, 0.2, rings) - smoothstep(0.8, 1.0, rings);
                
                // Grain: Fine vertical lines
                float grain = woodNoise(p.xy * vec2(100.0, 2.0));
                
                vec3 lightWood = color; // Base color
                vec3 darkWood = color * 0.5; // Darker variant
                
                vec3 finalColor = mix(darkWood, lightWood, rings);
                finalColor = mix(finalColor, darkWood, grain * 0.3);

                color = finalColor;
            }
        ` + shader.fragmentShader;
        
        // B"H: Inject seamlessly into the Three.js compilation flow
        shader.fragmentShader = shader.fragmentShader.replace(
            '#include <color_fragment>',
            `#include <color_fragment>\napplyAwtsmoosWood(diffuseColor.rgb, vWoodPos);`
        );
    }
}
