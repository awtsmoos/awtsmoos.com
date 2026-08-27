
// B"H
/**
 * @file index.js (PostProcessing)
 * @brief Manages the chain of FBO effects with strict attribute cleanup and integer quantization.
 */
import { compileShaderProgram } from '../shaderCompiler.js';
import { createFBO } from './fbo.js';
import { VS_COMMON, FS_BRIGHT_PASS, FS_BLUR, FS_COMPOSITE, FS_FXAA } from './shaders/index.js';

export class PostProcessingSystem {
    constructor(gl) {
        this.gl = gl;
    }

    init() {
        const gl = this.gl;
        
        const link = (vs, fs, name) => {
            const p = compileShaderProgram(gl, vs, fs);
            if (!p) console.error(`B"H - PostProcessor: Failed to link ${name} program.`);
            return p ? p.program : null;
        };

        this.brightPassProgram = link(VS_COMMON, FS_BRIGHT_PASS, 'BrightPass');
        this.blurProgram = link(VS_COMMON, FS_BLUR, 'Blur');
        this.compositeProgram = link(VS_COMMON, FS_COMPOSITE, 'Composite');
        this.fxaaProgram = link(VS_COMMON, FS_FXAA, 'FXAA');
        
        this.quadBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, this.quadBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1, 1,-1, -1,1, 1,1]), gl.STATIC_DRAW);

        this.onResize(gl.canvas.width, gl.canvas.height);
    }

    onResize(width, height) {
        const gl = this.gl;
        const cleanup = (fbo) => { 
            if(fbo) { 
                gl.deleteFramebuffer(fbo.framebuffer); 
                gl.deleteTexture(fbo.texture); 
                if(fbo.depthBuffer) gl.deleteRenderbuffer(fbo.depthBuffer); 
            }
        };
        
        cleanup(this.sceneFBO);
        cleanup(this.compositeFBO);
        if (this.blurFBOs) this.blurFBOs.forEach(cleanup);
        
        // B"H - Standard Byte buffers ensure visibility on all hardware
        this.sceneFBO = createFBO(gl, width, height, true, false);
        this.compositeFBO = createFBO(gl, width, height, false, false);
        
        const bloomDownsample = 4;
        // B"H - THE TIKKUN: Absolute integer quantization prevents silent WebGL failure
        const bw = Math.max(1, Math.floor(width / bloomDownsample));
        const bh = Math.max(1, Math.floor(height / bloomDownsample));

        this.blurFBOs =[ 
            createFBO(gl, bw, bh, false, false), 
            createFBO(gl, bw, bh, false, false) 
        ];
    }

    beginFrame() { 
        this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, this.sceneFBO.framebuffer); 
        this.gl.viewport(0, 0, this.sceneFBO.width, this.sceneFBO.height); 
    }
    
    getSceneFBO() { return this.sceneFBO; }

    applyEffectsAndComposite(cameraPos, dynamicWaterLevel) {
        const gl = this.gl;
        
        // Save state
        const prevDepthTest = gl.isEnabled(gl.DEPTH_TEST);
        gl.disable(gl.DEPTH_TEST);
        
        this._runBrightPass();
        this._runBloomPass();
        this._runCompositePass(cameraPos, dynamicWaterLevel); 
        this._runFXAAPass();
        
        // Restore state
        if (prevDepthTest) gl.enable(gl.DEPTH_TEST);
    }
    
    _runBrightPass() {
        const gl = this.gl;
        if (!this.brightPassProgram) return;
        gl.bindFramebuffer(gl.FRAMEBUFFER, this.blurFBOs[0].framebuffer);
        gl.viewport(0, 0, this.blurFBOs[0].width, this.blurFBOs[0].height);
        gl.useProgram(this.brightPassProgram);
        gl.uniform1f(gl.getUniformLocation(this.brightPassProgram, 'uThreshold'), 0.85);
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, this.sceneFBO.texture);
        gl.uniform1i(gl.getUniformLocation(this.brightPassProgram, 'uSceneTexture'), 0);
        this.drawQuad(this.brightPassProgram);
    }

    _runBloomPass() {
        const gl = this.gl;
        if (!this.blurProgram) return;
        gl.useProgram(this.blurProgram);
        for (let i = 0; i < 5; i++) {
            gl.bindFramebuffer(gl.FRAMEBUFFER, this.blurFBOs[1].framebuffer);
            gl.uniform2f(gl.getUniformLocation(this.blurProgram, 'uDirection'), 1, 0);
            gl.bindTexture(gl.TEXTURE_2D, this.blurFBOs[0].texture);
            gl.uniform1i(gl.getUniformLocation(this.blurProgram, 'uInputTexture'), 0);
            gl.uniform2f(gl.getUniformLocation(this.blurProgram, 'uResolution'), this.blurFBOs[0].width, this.blurFBOs[0].height);
            this.drawQuad(this.blurProgram);

            gl.bindFramebuffer(gl.FRAMEBUFFER, this.blurFBOs[0].framebuffer);
            gl.uniform2f(gl.getUniformLocation(this.blurProgram, 'uDirection'), 0, 1);
            gl.bindTexture(gl.TEXTURE_2D, this.blurFBOs[1].texture);
            gl.uniform1i(gl.getUniformLocation(this.blurProgram, 'uInputTexture'), 0);
            gl.uniform2f(gl.getUniformLocation(this.blurProgram, 'uResolution'), this.blurFBOs[1].width, this.blurFBOs[1].height);
            this.drawQuad(this.blurProgram);
        }
    }

    _runCompositePass(cameraPos, dynamicWaterLevel) {
        const gl = this.gl;
        if (!this.compositeProgram) return;
        gl.bindFramebuffer(gl.FRAMEBUFFER, this.compositeFBO.framebuffer);
        gl.viewport(0, 0, this.compositeFBO.width, this.compositeFBO.height);
        gl.clear(gl.COLOR_BUFFER_BIT);
        gl.useProgram(this.compositeProgram);
        
        gl.uniform3fv(gl.getUniformLocation(this.compositeProgram, 'uCameraPos'), cameraPos ||[0,0,0]);
        gl.uniform1f(gl.getUniformLocation(this.compositeProgram, 'uWaterLevel'), dynamicWaterLevel);

        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, this.sceneFBO.texture);
        gl.uniform1i(gl.getUniformLocation(this.compositeProgram, 'uSceneTexture'), 0);
        gl.activeTexture(gl.TEXTURE1);
        gl.bindTexture(gl.TEXTURE_2D, this.blurFBOs[0].texture);
        gl.uniform1i(gl.getUniformLocation(this.compositeProgram, 'uBloomTexture'), 1);
        this.drawQuad(this.compositeProgram);
    }

    _runFXAAPass() {
        const gl = this.gl;
        if (!this.fxaaProgram) return;
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
        gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
        gl.clear(gl.COLOR_BUFFER_BIT);
        gl.useProgram(this.fxaaProgram);
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, this.compositeFBO.texture);
        gl.uniform1i(gl.getUniformLocation(this.fxaaProgram, 'uInputTexture'), 0);
        gl.uniform2f(gl.getUniformLocation(this.fxaaProgram, 'uResolution'), gl.canvas.width, gl.canvas.height);
        this.drawQuad(this.fxaaProgram);
    }
    
    drawQuad(program) {
        const gl = this.gl;
        const posLoc = gl.getAttribLocation(program, 'aVertexPosition');
        
        // B"H - ATTRIBUTE CLEANUP: 
        // Force-disable all attributes except position (index 0)
        for(let i = 1; i < 8; i++) gl.disableVertexAttribArray(i);

        gl.bindBuffer(gl.ARRAY_BUFFER, this.quadBuffer);
        gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(posLoc);
        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    }
}
