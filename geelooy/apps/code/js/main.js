
// B"H
// FILE: js/main.js

import { App } from './app/index.js'; // B"H - Rectified Import Path
import { initializeDOM } from './state.js'; 
import { FileCommander } from './file-commander.js';
import { loadIcons } from './app/icon-loader.js';
import { SearchSystem } from './search-system.js';
import { CommandPalette } from './command-palette.js'; 
import { Linter } from './tools/linter.js'; 
import { Effects } from './effects.js'; 
import { VisualEngine } from './visuals/index.js';

/**
 * --- THE PRIMORDIAL SPARK ---
 * This is the Nekudah Rishonah, the first point of light. When the browser has
 * prepared the physical vessel of the DOM, this script is the first to be called.
 * It does not contain complex logic, but rather speaks the first command: "Initialize,"
 * setting in motion the entire chain of creation.
 */
document.addEventListener('DOMContentLoaded', async () => {
     
    // Manifest the unseen icons and bind the DOM vessels to their spiritual names
    loadIcons();
    initializeDOM();
    
    // Awaken the individual systems in their proper order
    SearchSystem.init();
    CommandPalette.init(); 
    Linter.init(); 
    Effects.init(); 
    VisualEngine.init(); 
    
    // Command the Merkava (chariot) to begin its great work of initialization
    await App.initialize();
});
