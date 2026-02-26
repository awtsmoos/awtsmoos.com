
// B"H
// FILE: js/main.js

import { App } from './app/index.js'; 
import { initializeDOM } from './state.js'; 
import { loadIcons } from './app/icon-loader.js';
import { SearchSystem } from './search-system.js';
import { CommandPalette } from './command-palette.js'; 
import { Linter } from './tools/linter.js'; 
import { Effects } from './effects.js'; 
import { VisualEngine } from './visuals/index.js';
import { ActionDispatcher } from './actions/dispatcher.js';

/**
 * --- THE PRIMORDIAL SPARK ---
 */
document.addEventListener('DOMContentLoaded', async () => {
    // 1. Physical preparation
    loadIcons();
    initializeDOM();
    
    // 2. Awakening the Senses
    ActionDispatcher.init(); // B"H - Initialize the shield before App.initialize
    SearchSystem.init();
    CommandPalette.init(); 
    Linter.init(); 
    Effects.init(); 
    VisualEngine.init(); 
    
    // 3. Manifesting Reality
    await App.initialize();
});
