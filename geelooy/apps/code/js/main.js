// B"H
// FILE: js/main.js

import { App } from './app.js';
import { initializeDOM } from './state.js'; // Correctly import the function
import { FileCommander } from './file-commander.js';
import { loadIcons } from './app/icon-loader.js';

// This event listener waits for the entire HTML page to be ready.
document.addEventListener('DOMContentLoaded', async () => {
     
    // 0. Load Icons (Async but starts immediately)
    loadIcons();

    // 1. First, we guarantee that all DOM elements are found and stored.
    initializeDOM();
    
    // 2. Initialize secondary UI components
    FileCommander.init();
    
    // 3. Only then do we initialize the rest of the application.
    await App.initialize();
});