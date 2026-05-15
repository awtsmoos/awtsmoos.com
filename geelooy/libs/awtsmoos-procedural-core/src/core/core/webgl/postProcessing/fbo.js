
// B"H
/**
 * @file fbo.js
 * @brief A pure function for the sacred act of creating a Framebuffer Object.
 *        Refined with absolute integer enforcement for cross-platform robustness.
 */

export function createFBO(gl, rawWidth, rawHeight, useDepth = false, useFloat = false) {
    // B"H - THE TIKKUN OF QUANTIZATION
    // We enforce absolute integers, preventing silent WebGL destruction on strict mobile GPU drivers.
    const width = Math.max(1, Math.floor(rawWidth));
    const height = Math.max(1, Math.floor(rawHeight));

    const framebuffer = gl.createFramebuffer();
    gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);

    const texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);
    
    // B"H - THE TIKKUN OF VISIBILITY:
    // Some GPUs support Half-Float textures but NOT linear filtering for them.
    // If we use LINEAR without the linear extension, the texture returns black.
    const floatLinear = gl.getExtension('OES_texture_half_float_linear');
    const canUseFloat = useFloat && gl.halfFloatExt && floatLinear;
    
    const type = canUseFloat ? gl.halfFloatExt.HALF_FLOAT_OES : gl.UNSIGNED_BYTE;
    const filter = gl.LINEAR; // We prioritize smoothness for the sea and sky
    
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, width, height, 0, gl.RGBA, type, null);
    
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, filter);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, filter);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0);

    let depthBuffer = null;
    if (useDepth) {
        depthBuffer = gl.createRenderbuffer();
        gl.bindRenderbuffer(gl.RENDERBUFFER, depthBuffer);
        // Using 16-bit depth for maximum mobile compatibility
        gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT16, width, height);
        gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, depthBuffer);
    }

    const status = gl.checkFramebufferStatus(gl.FRAMEBUFFER);
    if (status !== gl.FRAMEBUFFER_COMPLETE) {
        console.error(`B"H - FBO Error: Incomplete! Status: ${status}`);
    }

    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    
    return { 
        framebuffer, 
        texture, 
        depthBuffer, 
        width, height, 
        isFloat: canUseFloat 
    };
}
