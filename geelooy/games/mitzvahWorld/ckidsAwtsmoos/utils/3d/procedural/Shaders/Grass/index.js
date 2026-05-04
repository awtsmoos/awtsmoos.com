
// B"H
/**
 * @file index.js
 * @module GrassShader
 * @description
 * 🌿 CHAPTER 9: THE BREATH ON THE GRASS 🌿
 * 
 * "Let the earth put forth grass."
 * 
 * This module is the ultimate expression of Yesh me-Ayin (Something from Nothing) 
 * in the visual realm. It intercepts the rendering of a standard material and 
 * forcefully injects pure GLSL noise functions. It calculates the world-position 
 * of every pixel on the floor and assigns a vibrant, multi-layered green color to it.
 */

export default class GrassShader {
    /**
     * @function apply
     * @description Applies the intense procedural grass effect to a material.
     * @param {THREE.Material} material - The material to be blessed with grass.
     */
    static apply(material) {
        if (!material) return;
        
        try {
            const originalOnBeforeCompile = material.onBeforeCompile;

            material.onBeforeCompile = (shader) => {
                // 1. Weave the Varying Vector
                shader.vertexShader = `varying vec3 vAwtsmoosWorldPos;\n` + shader.vertexShader;
                shader.vertexShader = shader.vertexShader.replace(
                    '#include <worldpos_vertex>',
                    `
                    #include <worldpos_vertex>
                    vAwtsmoosWorldPos = (modelMatrix * vec4(transformed, 1.0)).xyz;
                    `
                );

                // 2. Weave the Divine Noise Functions
                shader.fragmentShader = `
                    varying vec3 vAwtsmoosWorldPos;
                    
                    float awtsmoosHash(vec2 p) { 
                        return fract(1e4 * sin(17.0 * p.x + p.y * 0.1) * (0.1 + abs(sin(p.y * 13.0 + p.x)))); 
                    }
                    
                    float awtsmoosNoise(vec2 x) {
                        vec2 i = floor(x);
                        vec2 f = fract(x);
                        float a = awtsmoosHash(i);
                        float b = awtsmoosHash(i + vec2(1.0, 0.0));
                        float c = awtsmoosHash(i + vec2(0.0, 1.0));
                        float d = awtsmoosHash(i + vec2(1.0, 1.0));
                        vec2 u = f * f * (3.0 - 2.0 * f);
                        return mix(a, b, u.x) + (c - a) * u.y * (1.0 - u.x) + (d - b) * u.x * u.y;
                    }

                    float awtsmoosFbm(vec2 p) {
                        float v = 0.0;
                        v += awtsmoosNoise(p * 10.0) * 0.500;
                        v += awtsmoosNoise(p * 20.0) * 0.250;
                        v += awtsmoosNoise(p * 40.0) * 0.125;
                        return v;
                    }
                ` + shader.fragmentShader;
                
                // 3. Apply the Mathematical Emerald Pigment
                shader.fragmentShader = shader.fragmentShader.replace(
                    '#include <color_fragment>',
                    `
                    #include <color_fragment>
                    
                    vec2 posUV = vAwtsmoosWorldPos.xz * 1.5;
                    float n = awtsmoosFbm(posUV);
                    
                    vec3 darkGreen = vec3(0.01, 0.25, 0.01);
                    vec3 brightGreen = vec3(0.12, 0.65, 0.08);
                    vec3 patchyEarth = vec3(0.35, 0.45, 0.12); 
                    
                    vec3 finalGrassColor = mix(darkGreen, brightGreen, n);
                    
                    float n2 = awtsmoosNoise(posUV * 6.0);
                    if (n2 > 0.7) {
                        finalGrassColor = mix(finalGrassColor, patchyEarth, (n2 - 0.7) * 3.33);
                    }

                    diffuseColor.rgb = finalGrassColor;
                    `
                );

                if (originalOnBeforeCompile) {
                    originalOnBeforeCompile(shader);
                }
            };
            // B"H: silent

        } catch (e) {
            console.error("B\"H - ⚡ Failed to enliven material with grass.", e);
        }
    }
}
