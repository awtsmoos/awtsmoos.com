/*
    ב"ה
    B"H
*/
import { initDB, loadSettings } from './js_modules/storage.js';
import { initWorker } from './js_modules/worker_client.js';
import { attachEvents } from './js_modules/events.js';
import { updateUI } from './js_modules/ui.js';
import { AppState } from './js_modules/state.js';

document.addEventListener('DOMContentLoaded', async () => {
    console.log("Ein Sof Engine V5.1 Booting...");
    
    // 1. Load Data
    await initDB(AppState);
    await loadSettings(AppState);
    
    // 2. Attach Listeners
    attachEvents();
    
    // 3. Init Engine
    initWorker();
    
    // 4. Initial UI State
    updateUI(AppState);
});