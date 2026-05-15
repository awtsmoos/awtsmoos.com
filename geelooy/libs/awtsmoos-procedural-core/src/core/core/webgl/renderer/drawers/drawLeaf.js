
// B"H
import { mat4_core } from '../../../math/mat4/core.js';

export function drawLeafObject(context, obj, leafMaterialInstance) {
    const { renderer, projectionMatrix, viewMatrix, worldModelMatrix, cameraPos, globalShaderVars } = context;
    const { gl } = renderer;

    if (!leafMaterialInstance) return;

    let modelViewMatrix = mat4_core.identity();
    mat4_core.multiply(modelViewMatrix, viewMatrix, worldModelMatrix);

    let normalMatrix = mat4_core.identity();
    mat4_core.transpose(normalMatrix, mat4_core.inverse(mat4_core.identity(), worldModelMatrix));
    
    const matVars = { ...globalShaderVars, ...obj.shaderVars };
    const texName = matVars.uTexture;
    const texture = (texName && renderer.textures[texName]) ? renderer.textures[texName] : null;

    leafMaterialInstance.bind(
        { projection: projectionMatrix, modelView: modelViewMatrix, worldModel: worldModelMatrix, normal: normalMatrix },
        cameraPos,
        globalShaderVars,
        matVars,
        texture
    );

    const prog = leafMaterialInstance.program;
    const posLoc = gl.getAttribLocation(prog, 'aVertexPosition');
    const normLoc = gl.getAttribLocation(prog, 'aVertexNormal');
    const colLoc = gl.getAttribLocation(prog, 'aVertexColor'); // Contains UVs in RG
     
    gl.bindBuffer(gl.ARRAY_BUFFER, obj.buffers.position);
    gl.vertexAttribPointer(posLoc, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(posLoc);

    gl.bindBuffer(gl.ARRAY_BUFFER, obj.buffers.normal);
    gl.vertexAttribPointer(normLoc, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(normLoc);
     
    gl.bindBuffer(gl.ARRAY_BUFFER, obj.buffers.color);
    gl.vertexAttribPointer(colLoc, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(colLoc);

    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, obj.buffers.indices);
    const indexType = obj.buffers.indexType || gl.UNSIGNED_SHORT;
    gl.drawElements(gl.TRIANGLES, obj.indicesCount, indexType, 0);
}
