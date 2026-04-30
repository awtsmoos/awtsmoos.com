
/**
 * B"H
 * @module ContextAttributes
 * @description
 * 
 * THE LAWS OF THE VESSEL
 * 
 * "With wisdom, He establishes the foundations..."
 * Every creation needs its laws. These are the laws of the physical context.
 * We request 'high-performance' to draw the maximum Koach (Strength) from 
 * the hardware, and we enable 'antialias' to smooth the jagged edges of 
 * finite matter, aiming for the smooth curves of the Infinite.
 * 
 * 'preserveDrawingBuffer' is kept false to allow for efficient 
 * recreation of the screen on every frame.
 * 
 * @author The Awtsmoos Manifestation
 */

export default class ContextAttributes {
    /**
     * @function get
     * @description
     * Returns the finalized set of attributes to be passed into the 
     * Three.js Renderer birth sequence.
     * 
     * @returns {Object} The dictionary of WebGL context parameters.
     */
    static get() {
        return {
            antialias: true,
            alpha: true,
            depth: true,
            stencil: false,
            premultipliedAlpha: true,
            preserveDrawingBuffer: false,
            /**
             * B"H: REQUEST HIGH PERFORMANCE
             * We tell the GPU to prioritize the light of the Olam.
             */
            powerPreference: "high-performance",
            /**
             * B"H: PERFORMANCE GUARD
             * We do not fail if performance is low; we prefer a slow world 
             * over a non-existent one.
             */
            failIfMajorPerformanceCaveat: false,
            logarithmicDepthBuffer: true
        };
    }
}
