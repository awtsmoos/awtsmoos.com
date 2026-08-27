
// B"H
/**
 * @file skinMaterial.js
 * @brief Skin shader with subsurface scattering logic, now equipped with its own draw command.
 */
import { mat4_core } from '../../math/mat4/core.js';

export class SkinMaterial {
    constructor(gl) { this.gl = gl; }
    setProgram(programInfo) { 
        this.program = programInfo.program; 
        this.programInfo = programInfo;
    }

    draw(obj, context) {
        const { projectionMatrix, viewMatrix, worldModelMatrix, cameraPos, globalShaderVars } = context;
        const gl = this.gl;

        if (!this.program) return;

        let modelViewMatrix = mat4_core.identity();
        mat4_core.multiply(modelViewMatrix, viewMatrix, worldModelMatrix);

        let normalMatrix = mat4_core.identity();
        let invModel = mat4_core.identity();
        if (mat4_core.inverse(invModel, worldModelMatrix)) {
            mat4_core.transpose(normalMatrix, invModel);
        }

        gl.useProgram(this.program);
        gl.uniformMatrix4fv(gl.getUniformLocation(this.program, 'uProjectionMatrix'), false, projectionMatrix);
        gl.uniformMatrix4fv(gl.getUniformLocation(this.program, 'uModelViewMatrix'), false, modelViewMatrix);
        gl.uniformMatrix4fv(gl.getUniformLocation(this.program, 'uModelMatrix'), false, worldModelMatrix);
        gl.uniformMatrix4fv(gl.getUniformLocation(this.program, 'uNormalMatrix'), false, normalMatrix);
        
        gl.uniform3fv(gl.getUniformLocation(this.program, 'uViewPos'), cameraPos);
        gl.uniform3fv(gl.getUniformLocation(this.program, 'uLightDirection'), globalShaderVars.uLightDirection ||[0.5, 1.0, 0.5]);
        gl.uniform3fv(gl.getUniformLocation(this.program, 'uDirectionalLightColor'), globalShaderVars.uDirectionalLightColor ||[1,1,1]);
        gl.uniform3fv(gl.getUniformLocation(this.program, 'uAmbientLightColor'), globalShaderVars.uAmbientLightColor || [0.1,0.1,0.1]);
        
        const matVars = { ...globalShaderVars, ...obj.shaderVars };
        gl.uniform3fv(gl.getUniformLocation(this.program, 'uBaseColor'), matVars.uBaseColor ||[0.94, 0.76, 0.64]);

        const posLoc = gl.getAttribLocation(this.program, 'aVertexPosition');
        const normLoc = gl.getAttribLocation(this.program, 'aVertexNormal');
        const colorLoc = gl.getAttribLocation(this.program, 'aVertexColor');
         
        gl.bindBuffer(gl.ARRAY_BUFFER, obj.buffers.position);
        gl.vertexAttribPointer(posLoc, 3, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(posLoc);

        if (normLoc !== -1) {
            gl.bindBuffer(gl.ARRAY_BUFFER, obj.buffers.normal);
            gl.vertexAttribPointer(normLoc, 3, gl.FLOAT, false, 0, 0);
            gl.enableVertexAttribArray(normLoc);
        }
         
        if (colorLoc !== -1) {
            gl.bindBuffer(gl.ARRAY_BUFFER, obj.buffers.color);
            gl.vertexAttribPointer(colorLoc, 4, gl.FLOAT, false, 0, 0);
            gl.enableVertexAttribArray(colorLoc);
        }

        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, obj.buffers.indices);
        const indexType = obj.buffers.indexType || gl.UNSIGNED_SHORT;
        gl.drawElements(gl.TRIANGLES, obj.indicesCount, indexType, 0);
    }
}
