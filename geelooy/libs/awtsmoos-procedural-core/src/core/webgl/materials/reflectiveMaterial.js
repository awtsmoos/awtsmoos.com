
// B"H
/**
 * @file reflectiveMaterial.js
 * @brief Orchestrates Reflective PBR logic with Shadow support.
 */
import { mat4_core } from '../../math/mat4/core.js';
import { Drawer } from '../renderer/utils/drawer.js';

export class ReflectiveMaterial {
    constructor(gl) {
        this.gl = gl;
        this.program = null;
        this.programInfo = null;
        this.drawer = new Drawer(this.gl, this.program);
    }
    
    setProgram(programInfo) {
        this.program = programInfo.program;
        this.programInfo = programInfo;
        this.drawer = new Drawer(this.gl, this.program);
    }

    _bind(matrices, cameraPos, lightVars, materialVars, shadowSystem, shadowsEnabled, globalVars = {}) {
        const gl = this.gl;
        gl.useProgram(this.program);
        
        gl.uniformMatrix4fv(gl.getUniformLocation(this.program, 'uProjectionMatrix'), false, matrices.projection);
        gl.uniformMatrix4fv(gl.getUniformLocation(this.program, 'uModelViewMatrix'), false, matrices.modelView);
        gl.uniformMatrix4fv(gl.getUniformLocation(this.program, 'uModelMatrix'), false, matrices.worldModel);
        gl.uniformMatrix4fv(gl.getUniformLocation(this.program, 'uNormalMatrix'), false, matrices.normal);
        
        gl.uniform3fv(gl.getUniformLocation(this.program, 'uViewPos'), cameraPos);
        gl.uniform3fv(gl.getUniformLocation(this.program, 'uLightDirection'), lightVars.uLightDirection ||[0.5, 1.0, 0.5]);
        gl.uniform3fv(gl.getUniformLocation(this.program, 'uDirectionalLightColor'), lightVars.uDirectionalLightColor || [1,1,1]);
        gl.uniform3fv(gl.getUniformLocation(this.program, 'uAmbientLightColor'), lightVars.uAmbientLightColor ||[0.1,0.1,0.1]);
        
        gl.uniform3fv(gl.getUniformLocation(this.program, 'uBaseColor'), materialVars.uBaseColor ||[1,1,1]);
        gl.uniform1f(gl.getUniformLocation(this.program, 'uMetallic'), materialVars.uMetallic ?? 0.0);
        gl.uniform1f(gl.getUniformLocation(this.program, 'uRoughness'), materialVars.uRoughness ?? 0.5);

        // B"H - THE SHADOW LINKAGE
        if (shadowSystem && shadowSystem.isReady) {
            gl.activeTexture(gl.TEXTURE0);
            gl.bindTexture(gl.TEXTURE_2D, shadowSystem.depthTexture);
            gl.uniform1i(gl.getUniformLocation(this.program, 'uShadowMap'), 0);
            gl.uniformMatrix4fv(gl.getUniformLocation(this.program, 'uLightSpaceMatrix'), false, shadowSystem.lightSpaceMatrix);
            gl.uniform2f(gl.getUniformLocation(this.program, 'uShadowMapSize'), shadowSystem.resolution, shadowSystem.resolution);
            gl.uniform1f(gl.getUniformLocation(this.program, 'uShadowsEnabled'), shadowsEnabled ? 1.0 : 0.0);
        } else {
            gl.uniform1f(gl.getUniformLocation(this.program, 'uShadowsEnabled'), 0.0);
        }

        gl.uniform1f(gl.getUniformLocation(this.program, 'uUseGrid'), materialVars.uUseGrid ? 1.0 : 0.0);
        gl.uniform1f(gl.getUniformLocation(this.program, 'uUseChecker'), materialVars.uUseChecker ? 1.0 : 0.0);
        gl.uniform1f(gl.getUniformLocation(this.program, 'uTextureScale'), materialVars.uTextureScale || 1.0);
    }

    draw(obj, context) {
        const { renderer, projectionMatrix, viewMatrix, worldModelMatrix, cameraPos, globalShaderVars } = context;
        let modelViewMatrix = mat4_core.identity();
        mat4_core.multiply(modelViewMatrix, viewMatrix, worldModelMatrix);
        let normalMatrix = mat4_core.identity();
        let invModel = mat4_core.identity();
        if (mat4_core.inverse(invModel, worldModelMatrix)) mat4_core.transpose(normalMatrix, invModel);
        
        const matVars = { ...globalShaderVars, ...obj.shaderVars };
        this._bind(
            { projection: projectionMatrix, modelView: modelViewMatrix, worldModel: worldModelMatrix, normal: normalMatrix },
            cameraPos, globalShaderVars, matVars, renderer.systemManager.shadowSystem, renderer.shadowsEnabled, globalShaderVars
        );
        this.drawer.draw(obj, this.programInfo.attribLocations);
    }
}
