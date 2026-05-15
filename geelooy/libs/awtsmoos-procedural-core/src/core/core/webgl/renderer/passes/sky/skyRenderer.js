
// B"H
/**
 * @file skyRenderer.js
 * @brief High-precision celestial assembler with attribute safeguards.
 * 
 * THE HYMN OF THE PURIFIED SIGHT:
 * The sky is the background, the context of all,
 * It must not be clouded by the previous call!
 * We disable the attributes, we clear the way,
 * For the stars and the moon in their celestial play.
 * No lingering normal, no ghost of a bone,
 * Shall disturb the pure light of the Creator's throne!
 */
import { SkyProgram } from './skyProgram.js';
import { SkyBuffer } from './skyBuffer.js';
import { SkyMath } from './skyMath.js';
import { mat4_core } from '../../../../math/mat4/core.js';
import { CelestialSphere } from './celestialSphere.js';

export class SkyRenderer {
    constructor(gl) {
        this.gl = gl;
        this.program = null;
        this.buffer = null;
        this.stars = new CelestialSphere(gl);
    }

    init() {
        this.program = SkyProgram.init(this.gl);
        this.buffer = SkyBuffer.create(this.gl);
        this.stars.init();
    }

    /**
     * B"H - Draws the infinite firmament.
     */
    draw(viewMatrix, projectionMatrix, lightDir, globalVars, cameraPos) {
        const gl = this.gl;
        if (!this.program || !this.buffer) return;

        const rotView = [...viewMatrix];
        // B"H - Lock the sky to the camera position by removing translation
        rotView[12] = 0; rotView[13] = 0; rotView[14] = 0;
        
        const viewProj = mat4_core.identity();
        mat4_core.multiply(viewProj, projectionMatrix, rotView);

        // --- 1. ATMOSPHERE PASS ---
        gl.disable(gl.DEPTH_TEST); 
        gl.depthMask(false);
        gl.disable(gl.CULL_FACE);
        gl.disable(gl.BLEND); 

        gl.useProgram(this.program);
        
        // B"H - THE ATTRIBUTE CLEANUP: 
        // Force-disable all attributes except position (index 0) to avoid 
        // driver-level crashes during full-screen quad draws.
        for(let i = 1; i < 8; i++) {
            gl.disableVertexAttribArray(i);
        }

        const { invProj, invView } = SkyMath.getInverseMatrices(projectionMatrix, viewMatrix);
        
        gl.uniformMatrix4fv(gl.getUniformLocation(this.program, 'uInvProj'), false, invProj);
        gl.uniformMatrix4fv(gl.getUniformLocation(this.program, 'uInvView'), false, invView);
        gl.uniform3fv(gl.getUniformLocation(this.program, 'uSunDir'), lightDir);
        gl.uniform3fv(gl.getUniformLocation(this.program, 'uCameraPos'), cameraPos);
        gl.uniform3fv(gl.getUniformLocation(this.program, 'uMoonDir'), globalVars.uMoonDirection || [0,1,0]);
        gl.uniform1f(gl.getUniformLocation(this.program, 'uTime'), performance.now() / 1000);
        gl.uniform1f(gl.getUniformLocation(this.program, 'uCloudDensity'), globalVars.uCloudDensity ?? 0.2);

        SkyBuffer.bind(gl, this.buffer, this.program);
        gl.drawArrays(gl.TRIANGLES, 0, 3);

        // --- 2. CELESTIAL PASS (STARS) ---
        this.stars.draw(viewProj, lightDir[1], globalVars.uNinthSphereRot);

        // --- 3. RESTORE PHYSICAL LAWS ---
        gl.enable(gl.DEPTH_TEST);
        gl.depthMask(true);
        gl.enable(gl.CULL_FACE);
    }
}
