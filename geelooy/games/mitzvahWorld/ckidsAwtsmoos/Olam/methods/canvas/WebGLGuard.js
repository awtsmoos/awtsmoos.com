
/**
 * B"H
 * @module WebGLGuard
 * @description
 * 
 * THE GUARDIAN AT THE THRESHOLD
 * 
 * "He stood at the threshold and looked..."
 * Before the Tzimtzum can occur and a World (Olam) can be formed,
 * the space itself must be inspected. Is the GPU ready? Does the browser possess
 * the strength to draw down the light?
 */

export default class WebGLGuard {
    /**
     * @function verify
     * @description
     * Probes the fabric of the current dimension for WebGL support.
     * 
     * @param {HTMLCanvasElement|OffscreenCanvas} canvas - The material vessel.
     * @returns {Object} { success: boolean, reason?: string, type?: string }
     */
    static verify(canvas) {
        if (!canvas) {
            return { success: false, reason: "The vessel (canvas) is non-existent." };
        }

        const contexts = ['webgl2', 'webgl', 'experimental-webgl'];
        
        for (const ctxType of contexts) {
            try {
                const gl = canvas.getContext(ctxType);
                if (gl) {
                    return { 
                        success: true, 
                        type: ctxType,
                        version: ctxType === 'webgl2' ? 2 : 1
                    };
                }
            } catch (e) {
                // This context attempt was swallowed by the void
            }
        }

        return { 
            success: false, 
            reason: "WebGL is unavailable. Ensure hardware acceleration is enabled." 
        };
    }
}
