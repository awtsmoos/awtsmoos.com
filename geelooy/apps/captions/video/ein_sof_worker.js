/*
ב"ה
B"H
*/

// --- Orchestrator ---

// 1. Export Scope
self.exports = {};

// 2. Import Sequence (Critical for "Buddy" Encoding)
try {
    // A. External Library
    importScripts('/scripts/awtsmoos/video/mediabunny-library.js');

    // B. Internal Modules (Strict Order)
    importScripts(
        'modules/polyfills.js',           // Shims
        'modules/utils.js',               // Helpers
        'modules/renderer_core.js',       // Setup
        'modules/renderer_background.js', // BG & Portals
        'modules/renderer_particles.js',  // Particles
        'modules/renderer_components.js', // HUD Elements (New Features)
        'modules/renderer_text.js',       // Text & Glitch
        'modules/renderer_fx.js',         // Post-Processing
        'modules/tasks.js'                // Main Logic
    );

} catch (e) {
    console.error("Import Error:", e);
    self.postMessage({
        type: 'FATAL_ERROR',
        payload: { message: `Script Load Failed: ${e.message}` }
    });
}

// 3. Init
const mediabunny = self.exports;
self.segmentCounter = 0;

// 4. Message Router
self.onmessage = async (event) => {
    /* ב"ה B"H */
    try {
        const { type, payload } = event.data;
        if (type === 'START_RENDER') {
            await self.taskHandlers.handleRender(payload);
        } else if (type === 'GENERATE_PREVIEW') {
            await self.taskHandlers.handlePreview(payload);
        }
    } catch (err) {
        self.postMessage({
            type: 'FATAL_ERROR',
            payload: { message: err.message, stack: err.stack }
        });
    }
};

self.postMessage({ type: 'WORKER_READY' });