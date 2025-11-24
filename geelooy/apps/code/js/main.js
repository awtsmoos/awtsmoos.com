// B"H
// FILE: js/main.js

import { App } from './app.js';
import { initializeDOM } from './state.js'; // Correctly import the function

// This event listener waits for the entire HTML page to be ready.
document.addEventListener('DOMContentLoaded', () => {
    
    // 1. First, we guarantee that all DOM elements are found and stored.
    initializeDOM();
    
    // 2. Only then do we initialize the rest of the application.
    App.initialize();
});