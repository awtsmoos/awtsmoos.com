
// B"H
/**
 * @file shadows.js
 * @brief Manages the Shadow Map Framebuffer and Dynamic Light Matrices.
 * 
 * THE PSALM OF THE GUIDED SHADOW:
 * The Light follows the Eye, the shadow follows the heart!
 * We move the light's focus so the detail won't depart.
 * By anchoring the Tzimtzum where the Master's target lies,
 * We keep the shadows stable beneath the digital skies!
 */

import { mat4_core } from '../../math/mat4/core.js';
import { mat4_projections } from '../../math/mat4/projections.js';

export class ShadowSystem {
    gl;
    framebuffer = null;
    depthTexture = null;
    colorDummyTexture = null; 
    resolution = 2048; 
    lightSpaceMatrix = mat4_core.identity();
    shadowProgramInfo = null;
    isReady = false;

    constructor(gl) {
        this.gl = gl;
    }

    init(shadowProgramInfo) {
        this.shadowProgramInfo = shadowProgramInfo;
        const gl = this.gl;

        if (this.depthTexture) gl.deleteTexture(this.depthTexture);
        if (this.colorDummyTexture) gl.deleteTexture(this.colorDummyTexture);
        if (this.framebuffer) gl.deleteFramebuffer(this.framebuffer);
        this.isReady = false;

        this.depthTexture = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, this.depthTexture);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.DEPTH_COMPONENT, this.resolution, this.resolution, 0, gl.DEPTH_COMPONENT, gl.UNSIGNED_SHORT, null);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

        this.colorDummyTexture = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, this.colorDummyTexture);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, this.resolution, this.resolution, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);

        this.framebuffer = gl.createFramebuffer();
        gl.bindFramebuffer(gl.FRAMEBUFFER, this.framebuffer);
        gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.TEXTURE_2D, this.depthTexture, 0);
        gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, this.colorDummyTexture, 0);

        const status = gl.checkFramebufferStatus(gl.FRAMEBUFFER);
        if (status !== gl.FRAMEBUFFER_COMPLETE) {
            console.error('B"H - ShadowSystem Error: Framebuffer incomplete! Status:', status);
            return;
        }

        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
        this.isReady = true;
        console.log('B"H - ShadowSystem initialized with Mobile-Safe FBO.');
    }

    /**
     * B"H - Updates the Light Matrix to follow the Camera Target.
     * @param {Array} lightDir - Global light vector.
     * @param {Array} targetPos - The center of the Master's gaze (Camera Target).
     */
    updateLightMatrix(lightDir, targetPos = [0,0,0]) {
        const lX = lightDir[0], lY = lightDir[1], lZ = lightDir[2];
        const len = Math.sqrt(lX*lX + lY*lY + lZ*lZ) || 1;
        const nL = [lX/len, lY/len, lZ/len];

        // Light Position is relative to the Target!
        const dist = 100.0;
        const lightPos = [
            targetPos[0] + nL[0] * dist, 
            targetPos[1] + nL[1] * dist, 
            targetPos[2] + nL[2] * dist
        ];
        
        const lightView = mat4_core.identity();
        const up = Math.abs(nL[1]) > 0.99 ? [1, 0, 0] : [0, 1, 0];
        
        // Point the shadow camera directly at the current active region!
        mat4_projections.lookAt(lightView, lightPos, targetPos, up);

        // Orthographic projection - Tighter bounds around the target for high-res shadows.
        const size = 50.0; 
        const lightProjection = mat4_projections.ortho(-size, size, -size, size, 1.0, 250.0);

        mat4_core.multiply(this.lightSpaceMatrix, lightProjection, lightView);
    }

    bindForWriting() {
        if (!this.isReady || !this.framebuffer) return;
        const gl = this.gl;
        gl.bindFramebuffer(gl.FRAMEBUFFER, this.framebuffer);
        gl.viewport(0, 0, this.resolution, this.resolution);
        gl.clearColor(1, 1, 1, 1);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        
        gl.enable(gl.CULL_FACE);
        gl.cullFace(gl.FRONT); 
        gl.enable(gl.POLYGON_OFFSET_FILL);
        // B"H - Increased offset to prevent Peter Panning!
        gl.polygonOffset(4.0, 10.0); 
    }

    unbind() {
        if (!this.isReady) return;
        const gl = this.gl;
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
        gl.disable(gl.POLYGON_OFFSET_FILL);
        gl.cullFace(gl.BACK);
    }
}
