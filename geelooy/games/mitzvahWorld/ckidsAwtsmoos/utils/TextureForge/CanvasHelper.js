
/**
 * B"H
 * @module CanvasHelper
 * @description
 * The Holy Canvas. Bridging the gap between the Main Thread (where DOM lives) 
 * and the Angelic Worker Thread (where OffscreenCanvas lives).
 * Guarantees a stable drawing surface for procedural generation.
 */
export default class CanvasHelper {
    /**
     * @function create
     * @description Summons a canvas from the current reality context.
     * @param {number} width 
     * @param {number} height 
     * @returns {HTMLCanvasElement|OffscreenCanvas}
     */
    static create(width, height) {
        if (typeof OffscreenCanvas !== 'undefined') {
            return new OffscreenCanvas(width, height);
        } else if (typeof document !== 'undefined') {
            const canvas = document.createElement('canvas');
            canvas.width = width;
            canvas.height = height;
            return canvas;
        } else {
            throw new Error("B\"H: No canvas support in this realm.");
        }
    }

    /**
     * @async
     * @function toBlob
     * @description Condenses the infinite canvas drawing into a physical Blob.
     * @param {HTMLCanvasElement|OffscreenCanvas} canvas 
     * @returns {Promise<Blob>}
     */
    static async toBlob(canvas) {
        if (canvas.convertToBlob) {
            return await canvas.convertToBlob({ type: 'image/png' });
        } else {
            return new Promise(resolve => canvas.toBlob(resolve, 'image/png'));
        }
    }
}
