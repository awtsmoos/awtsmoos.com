/*
ב"ה
B"H
*/

// --- Orchestrator ---

// 1. Export Scope
self.exports = {};

// 2. Import Sequence
// We load files one by one to isolate syntax errors.
const loadModule = (path) => {
    try {
        importScripts(path);
    } catch (e) {
        console.error(`FAILED to load module: ${path}`, e);
        // Throwing here stops execution so we don't get cascading undefined errors
        throw new Error(`Module Load Failed [${path}]: ${e.message}`);
    }
};

try {
    // A. External Library
    loadModule('/scripts/awtsmoos/video/mediabunny-library.js');

    // B. Internal Modules (Strict Order)
    loadModule('modules/polyfills.js');           // Shims
    loadModule('modules/utils.js');               // Helpers
    loadModule('modules/renderer_core.js');       // Setup
    loadModule('modules/renderer_background.js'); // BG & Portals
    loadModule('modules/renderer_particles.js');  // Particles
    loadModule('modules/renderer_components.js'); // HUD Elements
    loadModule('modules/renderer_text.js');       // Text & Glitch
    loadModule('modules/renderer_fx.js');         // Post-Processing
    loadModule('modules/tasks.js');               // Main Logic

} catch (e) {
    self.postMessage({
        type: 'FATAL_ERROR',
        payload: { message: e.message }
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
        
        // Safety check to ensure modules loaded before processing
        if (!self.taskHandlers) {
            throw new Error("Worker modules failed to initialize correctly.");
        }

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