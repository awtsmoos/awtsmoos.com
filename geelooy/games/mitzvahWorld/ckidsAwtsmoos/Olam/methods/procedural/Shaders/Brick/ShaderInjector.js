
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

        shader.vertexShader = `varying vec3 vAwtsmoosWorldPos;\n` + shader.vertexShader;
        shader.vertexShader = shader.vertexShader.replace(
            '#include <worldpos_vertex>',
            `#include <worldpos_vertex>\nvAwtsmoosWorldPos = (modelMatrix * vec4(transformed, 1.0)).xyz;`
        );

        shader.fragmentShader = `
            varying vec3 vAwtsmoosWorldPos;
            
            void applyAwtsmoosBricks(inout vec3 color, vec3 worldPos) {
                // Sacred Brick Scale
                vec2 brickSize = vec2(0.8, 0.4);
                float mortarWidth = 0.05;
                
                // Align to coordinate system
                vec2 coord = worldPos.xz + worldPos.xy; 
                if(abs(worldPos.x) > abs(worldPos.z)) coord = worldPos.zy;
                
                // Shift every other row for running bond pattern
                float row = floor(coord.y / (brickSize.y + mortarWidth));
                coord.x += step(1.0, mod(row, 2.0)) * (brickSize.x * 0.5);

                vec2 positionInBrick = mod(coord, brickSize + mortarWidth);
                
                float isMortar = step(brickSize.x, positionInBrick.x) + step(brickSize.y, positionInBrick.y);
                isMortar = clamp(isMortar, 0.0, 1.0);

                vec3 brickColor = color;
                vec3 mortarColor = vec3(0.8, 0.8, 0.8); // B"H: Lighter, more realistic mortar

                color = mix(brickColor, mortarColor, isMortar);
            }
        ` + shader.fragmentShader;

        shader.fragmentShader = shader.fragmentShader.replace(
            '#include <color_fragment>',
            `#include <color_fragment>\napplyAwtsmoosBricks(diffuseColor.rgb, vAwtsmoosWorldPos);`
        );
    }
}
