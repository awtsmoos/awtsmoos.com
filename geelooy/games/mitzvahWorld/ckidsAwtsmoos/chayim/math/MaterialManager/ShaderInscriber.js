
/**
 * @file ShaderInscriber.js
 * @description
 * ✒️ CHAPTER 2: THE ENGRAVING OF THE LETTERS ✒️
 * 
 * "And the letters were engraved upon the stones." 
 * We find the specific hooks in the Three.js shader body 
 * and replace them with the Living Word of the snippets.
 */

export default class ShaderInscriber {
    /**
     * @method engrave
     * @param {Object} shader - The THREE shader object from onBeforeCompile.
     * @param {Object} snippets - The vertex/fragment snippets.
     */
    static engrave(shader, snippets) {
        console.log(`B"H - ✒️ [ShaderInscriber] Beginning injection...`);

        // 1. VERTEX INJECTION
        shader.vertexShader = shader.vertexShader.replace('#include <common>', `
            #include <common>
            varying vec3 vAwtsWorldPos;
            ${snippets.vertex?.head || ''}
        `);
        
        shader.vertexShader = shader.vertexShader.replace('#include <begin_vertex>', `
            #include <begin_vertex>
            vAwtsWorldPos = (modelMatrix * vec4(transformed, 1.0)).xyz;
            ${snippets.vertex?.main || ''}
        `);

        // 2. FRAGMENT INJECTION
        shader.fragmentShader = shader.fragmentShader.replace('#include <common>', `
            #include <common>
            varying vec3 vAwtsWorldPos;
            ${snippets.fragment?.head || ''}
        `);

        // B"H: We target dithering_fragment because it's the very last point
        // before the color is committed to the screen.
        const target = shader.fragmentShader.includes('#include <dithering_fragment>')
            ? '#include <dithering_fragment>'
            : '#include <color_fragment>';

        console.log(`B"H - ✒️ [ShaderInscriber] Target chunk: ${target}`);

        shader.fragmentShader = shader.fragmentShader.replace(target, `
            ${target}
            // B"H: The Awtsmoos Procedural Layer
            {
                vec4 diffuseColor = gl_FragColor; 
                ${snippets.fragment?.color || ''}
                gl_FragColor = diffuseColor;
            }
        `);
        
        console.log(`B"H - ✒️ [ShaderInscriber] Injection complete. Fragment size: ${shader.fragmentShader.length}`);
    }
}
