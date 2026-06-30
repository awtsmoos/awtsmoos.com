// B"H
/**
 * @file main.js
 * @brief Awakens Code, then binds the Geelooy OS embed covenant.
 */

import { App } from './app/index.js';
import { initializeDOM } from './state.js';
import { loadIcons } from './app/icon-loader.js';
import { SearchSystem } from './search-system.js';
import { CommandPalette } from './command-palette.js';
import { Linter } from './tools/linter.js';
import { Effects } from './effects.js';
import { VisualEngine } from './visuals/index.js';
import { ActionDispatcher } from './actions/dispatcher.js';
import { LiveSuggestions } from './ai-studio/live-suggestions.js';
import { initOsEmbedBridge } from './os-embed-bridge.js';

document.addEventListener('DOMContentLoaded', async () => {
  loadIcons(); initializeDOM();
  ActionDispatcher.init(); SearchSystem.init(); CommandPalette.init(); Linter.init();
  Effects.init(); VisualEngine.init(); LiveSuggestions.init();
  await App.initialize();
  initOsEmbedBridge();
});

/** B"H: Code finishes becoming itself, then receives files from the OS. */
