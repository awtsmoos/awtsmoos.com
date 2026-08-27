
// B"H
/**
 * @file VibeLayout.js
 * @brief The Architectural Root of the Vibe Editor View.
 * 
 * CHAPTER LIX: THE REORGANIZED HEAVENS
 * To grant better perception, the controls of the chat (Tokens, Halt) 
 * have descended from the heights of the screen to rest just above the 
 * input area, ensuring they are always within the user's immediate reach.
 * We rely on specialized builder modules to construct the left and right pillars.
 */

import { HTML } from '../../../html-generator.js';
import { ChatPanelLayout } from './components/ChatPanelLayout.js';
import { SidePanelLayout } from './components/SidePanelLayout.js';

export const VibeLayout = {
    /**
     * B"H - Constructs the complete Vibe workspace envelope.
     * @returns {HTMLElement}
     */
    build() {
        return HTML({
            className: 'vibe-container',
            style: { '--input-panel-height': '180px' },
            children:[
                ChatPanelLayout.build(),
                { className: 'vibe-resizer', id: 'vibe-resizer-vertical' },
                SidePanelLayout.build()
            ]
        });
    }
};
