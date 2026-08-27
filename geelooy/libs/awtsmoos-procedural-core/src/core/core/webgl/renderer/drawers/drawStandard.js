
// B"H
/**
 * @file drawStandard.js
 * @brief The manifestation of Form and Framework.
 * 
 * THE HYMN OF THE TWO PASSES:
 * First the Body, solid and deep,
 * Where the shadows of Tzimtzum quietly sleep.
 * Then the Spirit, the lines of the Quad,
 * Traced on the surface by the finger of God.
 * No diagonal line shall the vision confuse,
 * When the Quad-aware buffer is the one that we use.
 */
import { mat4_core } from '../../../math/mat4/core.js';

export function drawStandardObject(context, obj) {
    const { renderer, projectionMatrix, viewMatrix, worldModelMatrix, lightDir, globalShaderVars, isWireframePass } = context;
    const { gl, programInfo: p, shadowSystem: shadowSys } = renderer;

    if (!p || !p.program) return;
    gl.useProgram(p.program);

    // --- B"H - Matrix Preparation ---
    let modelViewMatrix = mat4_core.identity();
    mat4_core.multiply(modelViewMatrix, viewMatrix, worldModelMatrix);
    
    let invMV = mat4_core.identity();
    let normalMatrix = mat4_core.identity();
    if (mat4_core.inverse(invMV, modelViewMatrix)) {
        mat4_core.transpose(normalMatrix, invMV);
    }
    
    // --- B"H - Uniform Assignment ---
    gl.uniformMatrix4fv(p.uniformLocations.projectionMatrix, false, projectionMatrix);
    gl.uniformMatrix4fv(p.uniformLocations.modelViewMatrix, false, modelViewMatrix);
    gl.uniformMatrix4fv(p.uniformLocations.normalMatrix, false, normalMatrix);
    gl.uniformMatrix4fv(gl.getUniformLocation(p.program, 'uModelMatrix'), false, worldModelMatrix);
    
    // Pass the wireframe override to the shader to handle pure color vs lighting
    const uIsWireframeLoc = gl.getUniformLocation(p.program, 'uIsWireframe');
    if (uIsWireframeLoc) gl.uniform1f(uIsWireframeLoc, isWireframePass ? 1.0 : 0.0);

    // --- B"H - Lighting & Texture (Only for Solid Pass) ---
    if (!isWireframePass) {
        const objShaderVars = { ...globalShaderVars, ...obj.shaderVars };
        gl.uniform3fv(p.uniformLocations.ambientLightColor, objShaderVars.uAmbientLightColor || [0.2, 0.2, 0.2]);
        gl.uniform3fv(p.uniformLocations.directionalLightColor, objShaderVars.uDirectionalLightColor || [1, 1, 1]);
        gl.uniform3fv(p.uniformLocations.lightDirection, lightDir);
        
        const texName = objShaderVars.uTexture;
        if (texName && renderer.textures[texName]) {
            gl.activeTexture(gl.TEXTURE1);
            gl.bindTexture(gl.TEXTURE_2D, renderer.textures[texName]);
            gl.uniform1i(gl.getUniformLocation(p.program, 'uAlbedoMap'), 1);
            gl.uniform1f(gl.getUniformLocation(p.program, 'uUseTexture'), 1.0);
            gl.uniform1f(gl.getUniformLocation(p.program, 'uTextureScale'), objShaderVars.uTextureScale || 1.0);
        } else {
            gl.uniform1f(gl.getUniformLocation(p.program, 'uUseTexture'), 0.0);
        }
        
        if (renderer.shadowsEnabled && shadowSys) {
            gl.activeTexture(gl.TEXTURE0);
            gl.bindTexture(gl.TEXTURE_2D, shadowSys.depthTexture || null);
            gl.uniform1i(gl.getUniformLocation(p.program, 'uShadowMap'), 0);
            gl.uniformMatrix4fv(gl.getUniformLocation(p.program, 'uLightSpaceMatrix'), false, shadowSys.lightSpaceMatrix);
            gl.uniform1f(gl.getUniformLocation(p.program, 'uShadowsEnabled'), 1.0);
        }
    }

    // --- B"H - Attribute Binding ---
    gl.bindBuffer(gl.ARRAY_BUFFER, obj.buffers.position);
    gl.vertexAttribPointer(p.attribLocations.vertexPosition, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(p.attribLocations.vertexPosition);

    if (!isWireframePass) {
        gl.bindBuffer(gl.ARRAY_BUFFER, obj.buffers.color);
        gl.vertexAttribPointer(p.attribLocations.vertexColor, 4, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(p.attribLocations.vertexColor);

        gl.bindBuffer(gl.ARRAY_BUFFER, obj.buffers.normal);
        gl.vertexAttribPointer(p.attribLocations.vertexNormal, 3, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(p.attribLocations.vertexNormal);
    }

    // --- B"H - The Sacred Draw Call ---
    const indexType = obj.buffers.indexType || gl.UNSIGNED_SHORT;
    
    if (isWireframePass) {
        // Use the specialized Quad-aware wireframe indices
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, obj.buffers.wireframeIndices);
        gl.drawElements(gl.LINES, obj.buffers.wireframeIndicesCount, indexType, 0);
    } else {
        // Use the standard triangulation indices
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, obj.buffers.indices);
        gl.drawElements(gl.TRIANGLES, obj.indicesCount, indexType, 0);
    }
}
