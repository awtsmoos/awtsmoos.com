
// B"H
/**
 * @file index.js
 * @brief Class orchestrator for pure, uncorrupted diffuse reflection.
 * 
 * THE PSALM OF THE RECLAIMED BRUSH:
 * The Texture Manager was called from its sleep,
 * To weave the patterns of the earth and the deep.
 * It took the active shader, the brush of the mind,
 * But left the Lambert material stumbling behind!
 * Now we speak the command, we reclaim the light,
 * And the uniforms flow to the canvas so bright!
 */
import { mat4_core } from '../../../math/mat4/core.js';
import { Drawer } from '../../renderer/utils/drawer.js';
import { GLHelpers } from '../../renderer/utils/glHelpers.js';

export { VS_SOURCE_LAMBERT } from './vertex.js';
export { FS_SOURCE_LAMBERT } from './fragment.js';

export class LambertMaterial {
    constructor(gl) {
        this.gl = gl;
        this.program = null;
        this.programInfo = null;
        this.drawer = null;
    }

    /**
     * B"H - Accepts the full program info and initializes the drawer.
     */
    setProgram(programInfo) {
        this.program = programInfo.program;
        this.programInfo = programInfo;
        this.drawer = new Drawer(this.gl, this.program);
    }

    /**
     * B"H - Performs the sacred drawing of a Lambertian vessel.
     */
    draw(obj, context) {
        const { renderer, projectionMatrix, viewMatrix, worldModelMatrix, globalShaderVars } = context;
        const gl = this.gl;

        gl.useProgram(this.program);

        // 1. Matrix Preparation
        const modelViewMatrix = mat4_core.identity();
        mat4_core.multiply(modelViewMatrix, viewMatrix, worldModelMatrix);

        const normalMatrix = mat4_core.identity();
        const invM = mat4_core.identity();
        if (mat4_core.inverse(invM, worldModelMatrix)) {
            mat4_core.transpose(normalMatrix, invM);
        }

        // 2. Uniform Assignment
        const u = this.programInfo.uniformLocations;
        gl.uniformMatrix4fv(u.projectionMatrix, false, projectionMatrix);
        gl.uniformMatrix4fv(u.modelViewMatrix, false, modelViewMatrix);
        gl.uniformMatrix4fv(gl.getUniformLocation(this.program, 'uModelMatrix'), false, worldModelMatrix);
        gl.uniformMatrix4fv(u.normalMatrix, false, normalMatrix);
        
        const uIsWire = gl.getUniformLocation(this.program, 'uIsWireframe');
        if (uIsWire) gl.uniform1f(uIsWire, 0.0);

        const matVars = { ...globalShaderVars, ...obj.shaderVars };
        gl.uniform3fv(u.ambientLightColor, matVars.uAmbientLightColor || [0.2, 0.2, 0.2]);
        gl.uniform3fv(u.directionalLightColor, matVars.uDirectionalLightColor || [1, 1, 1]);
        gl.uniform3fv(u.lightDirection, globalShaderVars.uLightDirection || [0.5, 1, 0.5]);
        gl.uniform3fv(gl.getUniformLocation(this.program, 'uBaseColor'), matVars.uBaseColor || [1, 1, 1]);

        // 3. Texture Binding & STATE RESTORATION
        const texName = matVars.uTexture;
        const texture = (texName && renderer.systemManager.textureManager.getTexture(texName));
        
        // B"H - THE TIKKUN! The texture generator alters the active program. We MUST re-assert our own!
        gl.useProgram(this.program);
        
        if (texture) {
            gl.activeTexture(gl.TEXTURE0);
            gl.bindTexture(gl.TEXTURE_2D, texture);
            gl.uniform1i(gl.getUniformLocation(this.program, 'uAlbedoMap'), 0);
            gl.uniform1f(gl.getUniformLocation(this.program, 'uUseTexture'), 1.0);
            gl.uniform1f(gl.getUniformLocation(this.program, 'uTextureScale'), matVars.uTextureScale || 1.0);
        } else {
            gl.uniform1f(gl.getUniformLocation(this.program, 'uUseTexture'), 0.0);
        }

        // 4. Execution
        GLHelpers.prepareState(gl, obj);
        this.drawer.draw(obj, this.programInfo.attribLocations);
        GLHelpers.resetState(gl);
    }
}
