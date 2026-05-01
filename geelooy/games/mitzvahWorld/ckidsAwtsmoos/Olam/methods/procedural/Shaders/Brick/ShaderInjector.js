
/**
 * B"H
 * @module BrickShaderInjector
 * @description
 * Wires the mathematical laws of the "Brick" into the GPU. 
 * Uses a modulus-based coordinate system to draw perfectly repeating bricks and mortar 
 * without requiring a single external image file.
 */
export default class BrickShaderInjector {
    static inject(shader) {
        if (!shader || !shader.uniforms || shader.uniforms.diffuse === undefined) return;

        shader.vertexShader = `varying vec3 vAwtsmoosWorldPos;\nvarying vec3 vAwtsmoosNormal;\n` + shader.vertexShader;
        shader.vertexShader = shader.vertexShader.replace(
            '#include <worldpos_vertex>',
            `#include <worldpos_vertex>\n` +
            `vAwtsmoosWorldPos = (modelMatrix * vec4(transformed, 1.0)).xyz;\n` +
            `vAwtsmoosNormal = normalize((modelMatrix * vec4(objectNormal, 0.0)).xyz);`
        );

        shader.fragmentShader = `
            varying vec3 vAwtsmoosWorldPos;
            varying vec3 vAwtsmoosNormal;
            
            void applyAwtsmoosBricks(inout vec3 color, vec3 worldPos, vec3 normal) {
                // Sacred Brick Scale
                vec2 brickSize = vec2(0.8, 0.4);
                float mortarWidth = 0.05;
                
                // Box projection (Tri-planar)
                vec3 blendWeights = abs(normal);
                blendWeights = (blendWeights - 0.2) * 7.0;  
                blendWeights = max(blendWeights, 0.0);
                blendWeights /= (blendWeights.x + blendWeights.y + blendWeights.z);

                // Coordinates for each plane
                vec2 coordX = worldPos.zy;
                vec2 coordY = worldPos.xz;
                vec2 coordZ = worldPos.xy;

                // Function to get mortar for a 2D coordinate
                float mortarX = step(brickSize.x, mod(coordX.x + step(1.0, mod(floor(coordX.y / (brickSize.y + mortarWidth)), 2.0)) * (brickSize.x * 0.5), brickSize.x + mortarWidth)) + step(brickSize.y, mod(coordX.y, brickSize.y + mortarWidth));
                float mortarY = step(brickSize.x, mod(coordY.x + step(1.0, mod(floor(coordY.y / (brickSize.y + mortarWidth)), 2.0)) * (brickSize.x * 0.5), brickSize.x + mortarWidth)) + step(brickSize.y, mod(coordY.y, brickSize.y + mortarWidth));
                float mortarZ = step(brickSize.x, mod(coordZ.x + step(1.0, mod(floor(coordZ.y / (brickSize.y + mortarWidth)), 2.0)) * (brickSize.x * 0.5), brickSize.x + mortarWidth)) + step(brickSize.y, mod(coordZ.y, brickSize.y + mortarWidth));

                float isMortar = mortarX * blendWeights.x + mortarY * blendWeights.y + mortarZ * blendWeights.z;
                isMortar = clamp(isMortar, 0.0, 1.0);

                vec3 brickColor = color;
                vec3 mortarColor = vec3(0.8, 0.8, 0.8); // B"H: Lighter, more realistic mortar

                color = mix(brickColor, mortarColor, isMortar);
            }
        ` + shader.fragmentShader;

        shader.fragmentShader = shader.fragmentShader.replace(
            '#include <color_fragment>',
            `#include <color_fragment>\napplyAwtsmoosBricks(diffuseColor.rgb, vAwtsmoosWorldPos, normalize(vAwtsmoosNormal));`
        );
    }
}
