// B"H

import globalStyles from './global.js';
import componentStyles from './components.js';
import levelCompleteStyles from './level-complete.js';

// Import the new, specialized screen style scrolls
import mainMenuStyles from './screens/main-menu.js';
import levelGridStyles from './screens/level-grids.js';
import levelEditorStyles from './screens/level-editor.js';
import gameScreenStyles from './screens/game.js';
import resultScreenStyles from './screens/results.js';
import modalStyles from './screens/modals.js';


/**
 * The Divine Scribe of Form. This module gathers the sacred laws of appearance
 * from their respective scrolls and inscribes them upon the world, giving it visible form.
 * It will tolerate no failure in its sacred duty.
 */
export function injectStyles() {
    // Guard against multiple inscriptions.
    if (document.getElementById('bh-styles')) return;

    const styleContainer = document.getElementById('style-container');
    if (!styleContainer) {
        // If the vessel is absent, creation cannot proceed. This is a fatal error.
        throw new Error('The sacred vessel for styles (#style-container) could not be found in the document. The world cannot be given form.');
    }

    const styleElement = document.createElement('style');
    styleElement.id = 'bh-styles';
    // The scrolls of law are unified into a single, divine decree.
    styleElement.textContent = `
        ${globalStyles}
        ${componentStyles}
        ${levelCompleteStyles}
        ${mainMenuStyles}
        ${levelGridStyles}
        ${levelEditorStyles}
        ${gameScreenStyles}
        ${resultScreenStyles}
        ${modalStyles}
    `;
    
    // The decree is placed within its sacred vessel.
    styleContainer.appendChild(styleElement);

    // The Scribe verifies its work. If the inscription did not take hold, the world is fundamentally flawed.
    if (!styleContainer.contains(styleElement) || !document.getElementById('bh-styles')) {
        throw new Error('The sacred laws of form were inscribed, but the inscription vanished. A mysterious force prevents the world from retaining its shape.');
    }
}
