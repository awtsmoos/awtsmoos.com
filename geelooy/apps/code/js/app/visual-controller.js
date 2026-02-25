
// B"H
// FILE: js/app/visual-controller.js

/**
 * --- THE FORMER VESSEL OF EXPANSION ---
 * This logic has been elevated and expanded into the dedicated FullscreenManager,
 * which now supports both App-wide and Tab-specific expansions.
 * This file serves only to redirect lost sparks.
 */
import { FullscreenManager } from './fullscreen-manager.js';

export const VisualController = {
    toggleDimension: () => FullscreenManager.toggleApp()
};
