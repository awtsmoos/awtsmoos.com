
// B"H
/**
 * @file ResultGate.js
 * @brief THE ECHO OF THE WORD.
 */

import { HTML } from '../../../../html-generator.js';

export const ResultGate = {
    /**
     * B"H - Prepends a glowing return symbol to the manifested fragments.
     */
    wrap(children) {
        const arrow = HTML({
            tag: 'span',
            style: { 
                color: 'var(--neon-magenta)', 
                fontWeight: 'bold', 
                marginRight: '15px', 
                userSelect: 'none',
                fontSize: '1.2em',
                filter: 'drop-shadow(0 0 8px rgba(255, 0, 255, 0.6))'
            },
            text: '«' // Use a heavier recursive marker
        });
        
        return [arrow, ...children];
    }
};
