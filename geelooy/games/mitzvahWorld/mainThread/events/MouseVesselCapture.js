
/**
 * B"H
 * THE SELECTIVE PERCEPTION OF THE CLICK
 * 
 * Not all clicks are meant for the World of Action (Olam HaAsiyah). 
 * Some are meant for the World of Thought (the UI). 
 * If we do not filter, the Chossid moves every time a button is pressed.
 * This is madness. We must check the Target.
 * 
 * @class MouseVesselCapture
 */
export class MouseVesselCapture {
    /**
     * B"H
     * Determines if an event should be sent into the 3D world.
     * 
     * @param {MouseEvent} e - The interaction event.
     * @param {HTMLCanvasElement} canvas - The physical world vessel.
     * @returns {boolean} True if the world should react.
     */
    static shouldPropagateToWorker(e, canvas) {
        // B"H - If the user is clicking exactly on the canvas, it's a world event.
        // If the user is clicking anything else (a button, a div), we IGNORE.
        const isOnCanvas = e.target === canvas;
        
        if (!isOnCanvas) {
            console.log(`B"H - 💡 UI interaction detected on <${e.target.tagName}>. Blocking world signal.`);
        }
        
        return isOnCanvas;
    }
}
