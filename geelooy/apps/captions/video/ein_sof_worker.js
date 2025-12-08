/*
ב"ה
B"H
*/

self.exports = {};

const loadModule = (path) => {
    try { importScripts(path); } 
    catch (e) { throw new Error(`Load Failed [${path}]: ${e.message}`); }
};

try {
    loadModule('/scripts/awtsmoos/video/mediabunny-library.js');

    // Core
    loadModule('modules/polyfills.js');
    loadModule('modules/utils.js');
    loadModule('modules/renderer_core.js');

    // Background Sub-Modules
    loadModule('modules/bg_deepspace.js');
    loadModule('modules/bg_nebula.js');
    loadModule('modules/bg_portals.js');
    loadModule('modules/bg_orchestrator.js'); // Must come after sub-modules

    // Elements
    loadModule('modules/renderer_particles.js');
    loadModule('modules/renderer_components.js');
    loadModule('modules/renderer_text.js');

    // FX Sub-Modules
    loadModule('modules/fx_analog.js');
    loadModule('modules/fx_optics.js');
    loadModule('modules/fx_artistic.js');
    loadModule('modules/fx_orchestrator.js'); // Must come after sub-modules

    // Logic
    loadModule('modules/tasks.js');

} catch (e) {
    self.postMessage({ type: 'FATAL_ERROR', payload: { message: e.message } });
}

self.onmessage = async (event) => {
    /* ב"ה B"H */
    try {
        const { type, payload } = event.data;
        if (!self.taskHandlers) throw new Error("Worker not initialized");

        if (type === 'START_RENDER') await self.taskHandlers.handleRender(payload);
        else if (type === 'GENERATE_PREVIEW') await self.taskHandlers.handlePreview(payload);
    } catch (err) {
        self.postMessage({ type: 'FATAL_ERROR', payload: { message: err.message } });
    }
};

self.postMessage({ type: 'WORKER_READY' });