// B"H
// FILE: js/main.js

import { App } from './app.js';
import { initializeDOM } from './state.js'; 
import { FileCommander } from './file-commander.js';
import { loadIcons } from './app/icon-loader.js';
import { SearchSystem } from './search-system.js';
import { CommandPalette } from './command-palette.js'; 
import { Linter } from './tools/linter.js'; 
import { Effects } from './effects.js'; 
import { VisualEngine } from './visuals/index.js'; // B"H

document.addEventListener('DOMContentLoaded', async () => {
     
    loadIcons();
    initializeDOM();
    
    FileCommander.init();
    SearchSystem.init();
    CommandPalette.init(); 
    Linter.init(); 
    Effects.init(); 
    VisualEngine.init(); // B"H - Ignite the Engine
    
    await App.initialize();
});