
// B"H
/**
 * @file core.js
 * @description Capturing the physical truth of the observer's screen for the worker.
 */

export function heescheel(canvasElement) {
    console.group('B"H - 🌌 HEESCHEEL: Initiating Dimensional Transfer');
    
    const dpr = window.devicePixelRatio || 1;
    const width = window.innerWidth;
    const height = window.innerHeight;

    if (!canvasElement || !canvasElement.transferControlToOffscreen) {
        console.error('B"H - 🔥 CRITICAL: Transfer failed!');
        console.groupEnd();
        return null;
    }

    const offscreen = canvasElement.transferControlToOffscreen();
    
    const payload = {
        canvas: offscreen,
        dimensions: {
            width: width,
            height: height,
            pixelRatio: dpr
        }
    };

    // B"H: silent

    console.groupEnd();
    return payload; 
}
    