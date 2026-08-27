
// B"H
// FILE: js/app/event-listeners.js

import { setupCoreListeners } from './listeners/core.js';
import { setupEditorListeners } from './listeners/editor.js';
import { setupShortcutListeners } from './listeners/shortcuts.js';

/**
 * @function setupEventListeners
 * @description This is the Keter (Crown) of the event system. It does not perform bindings
 * itself, but calls upon its subordinate vessels (Core, Editor, Shortcuts) to each perform
 * their sacred ritual of binding, thus animating the entire application in a structured,
 * hierarchical flow of Divine creative energy.
 */
export function setupEventListeners() {
    setupCoreListeners();
    setupEditorListeners();
    setupShortcutListeners();
}
