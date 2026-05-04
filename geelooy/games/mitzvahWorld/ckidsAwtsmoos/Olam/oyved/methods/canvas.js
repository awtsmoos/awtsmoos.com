
// B"H
/**
 * @module WorkerCanvasHub
 * @description
 * 📐 CHAPTER 36: THE TRANSMISSION OF MEASURE 📐
 * 
 * Chapter 360: Expanding to Fill the Bounds.
 * 
 * When the human eye (the browser window) changes its shape, the main thread 
 * sends a new measurement into the Worker. This module intercepts that message 
 * and forcefully expands the OffscreenCanvas, ensuring the Light (Renderer) 
 * continues to occupy every single available pixel.
 */
export default function(me) {
    return {
        /**
         * @function takeInCanvas
         * @description The actual moment the physical vessel crosses the abyss 
         * and enters the Laborer's thread.
         */
        async takeInCanvas({ canvas, devicePixelRatio, width, height }) {
            console.group('B"H - 🏗️ WORKER: [CANVAS ACQUIRED]');
            // B"H: silent

            
            // 1. Establish the internal vessel parameters
            me.olam.takeInCanvas(canvas, devicePixelRatio);
            
            // 2. EXPLICIT ENFORCEMENT OF DIMENSIONS
            // Ensuring the world matches the screen exactly before genesis.
            await me.olam.setSize(width, height);
            
            // B"H: silent

            console.groupEnd();

            // Ignite the eternal cycle of recreation (Heartbeat)
            await me.olam.heesHawvoos();
        },

        /**
         * @function getOlam
         * @description Returns the pure spiritual data representation of the world state.
         */
        async getOlam() {
            if (me.olam !== null && typeof me.olam.serialize === 'function') {
                return { tawchlees: me.olam.serialize() };
            }
        }
    };
}
