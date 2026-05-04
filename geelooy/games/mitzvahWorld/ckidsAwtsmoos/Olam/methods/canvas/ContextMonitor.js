
/**
 * B"H
 * @module ContextMonitor
 * @description
 * 
 * THE WATCHER OF THE COVENANT
 * 
 * "I was asleep, but my heart was awake..." (Shir HaShirim 5:2)
 * Sometimes the physical laws (WebGL) are suspended by the Operating System.
 * This module binds the listeners that wait for the Light to return.
 */

export default class ContextMonitor {
    /**
     * @function bind
     * @param {HTMLCanvasElement|OffscreenCanvas} canvas 
     * @param {Object} olam - The Olam instance for event dispatching.
     */
    static bind(canvas, olam) {
        if (!canvas || !olam) return;

        const handleLoss = (event) => {
            event.preventDefault();
            console.warn("B\"H - ⚡ WebGL Context Lost! The vessel has entered slumber.");
            olam.ayshPeula("error", {
                code: "CONTEXT_LOST",
                message: "Graphics context lost. Return to the window to wake the Olam."
            });
        };

        const handleRestore = () => {
            // B"H: silent

            // Regeneration logic would typically be triggered by a re-init event
            olam.ayshPeula("contextRestored");
        };

        canvas.addEventListener("webglcontextlost", handleLoss, false);
        canvas.addEventListener("webglcontextrestored", handleRestore, false);
    }
}
