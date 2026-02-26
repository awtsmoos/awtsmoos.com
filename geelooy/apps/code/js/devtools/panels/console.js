
// B"H
/**
 * @file console.js
 * @brief The Chief Orchestrator of the Console tab.
 */

import { HTML } from '../../html-generator.js';
import { LogRenderer } from './console/log-renderer.js';
import { ConsoleInput } from './console/input.js';

export const ConsolePanel = {
    init(container, state) {
        // Purge any lingering shadows
        container.innerHTML = '';
        
        const wrap = HTML({
            style: { display: 'flex', flexDirection: 'column', height: '100%', width: '100%' }
        });

        // 1. Establish the Output Array Manager
        const loggerCallback = LogRenderer.attach(wrap, state);

        // 2. Form the physical Command Input Layer
        ConsoleInput.attach(wrap, state, loggerCallback);

        container.appendChild(wrap);
    }
};
