// B"H
// FILE: js/app.js

import { State } from './state.js';

/**
 * @file app.js
 * @description
 * B"H. The old mirror used `export *` to reflect `./app/index.js`. In the
 * compact runtime that mirror could become a frozen fragment inside circular
 * leaf modules, so callers touched `App.saveSessionDebounced` and found only
 * void. This facade is born immediately, a small candle before the palace; it
 * keeps the public App covenant while each heavy chamber is imported only when
 * its light is actually needed.
 */

/**
 * B"H. Opens a chamber only at the instant of need and records any shevirah.
 * @param {Promise<Function>} taskPromise The deferred action.
 * @param {string} label Human-readable chamber name.
 * @returns {Promise<*>} The invoked chamber result.
 */
function guard(taskPromise, label) {
    return taskPromise.catch(error => {
        console.warn(`B"H - App facade could not reveal ${label}:`, error);
    });
}

/**
 * B"H. A stable public vessel for legacy modules.
 * Its shape exists before app/index.js evaluates, breaking the cycle:
 * app/index -> listeners -> app.js -> app/index.
 */
export const App = {
    getTabString: () => State.useTabs ? '\t' : '    ',

    initialize: () => guard(
        import('./app/index.js').then(m => m.App.initialize()),
        'initialize'
    ),

    commitAllChanges: () => guard(
        import('./app/git-orchestrator.js').then(m => m.GitOrchestrator.commitCurrentFocus()),
        'git commit orchestration'
    ),

    saveSettings: () => guard(
        import('./app/storage-orchestrator.js').then(m => m.StorageOrchestrator.preserveMoment()),
        'settings preservation'
    ),

    loadSettings: () => guard(
        import('./app/bootstrapper.js').then(m => m.Bootstrapper.ignite()),
        'settings ignition'
    ),

    toggleFullscreen: () => guard(
        import('./app/fullscreen-manager.js').then(m => m.FullscreenManager.toggleApp()),
        'fullscreen toggle'
    ),

    showSettings: () => guard(
        import('./app/settings.js').then(m => m.SettingsManager.show()),
        'settings dialog'
    ),

    saveSessionDebounced: () => guard(
        import('./session.js').then(m => m.Session.saveDebounced()),
        'debounced session save'
    ),

    saveSession: () => guard(
        import('./session.js').then(m => m.Session.save()),
        'session save'
    )
};

export default App;
