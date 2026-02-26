
// B"H
/**
 * @file index.js (console panel)
 * @brief The True Entry Point for the Console vessel.
 * This has been rectified to use the modular, robust rendering and input systems.
 */

import { HTML } from '../../../../html-generator.js';
import { LogRenderer } from './log-renderer.js';
import { ConsoleInput } from './input.js';
import { EternalConsoleState } from './state/eternalState.js';

export const ConsolePanel = {
    init(container, state) {
        // Purge any lingering shadows from previous manifestations
        container.innerHTML = '';
        
        const wrap = HTML({
            className: 'dt-panel',
            style: { display: 'flex', flexDirection: 'column', height: '100%', width: '100%' }
        });

        // 1. Establish the Output Array Manager (this returns the logging function)
        const loggerCallback = LogRenderer.attach(wrap, state);

        // 2. Form the physical Command Input Layer, passing the logging function to it
        ConsoleInput.attach(wrap, state, loggerCallback);

        container.appendChild(wrap);
    },

    setPreviewTabId(id) {
        EternalConsoleState.setPreviewTabId(id);
    }
};
