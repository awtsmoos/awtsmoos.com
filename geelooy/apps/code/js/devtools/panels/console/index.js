
// B"H
/**
 * @file index.js (console panel)
 * @brief Entry point for the Console vessel.
 */

import { HTML } from '../../../../html-generator.js';
import { ConsoleInput } from './input.js';
import { ConsoleOutput } from './output.js';
import { EternalConsoleState } from './state/eternalState.js';

export const ConsolePanel = {
    attach(container, state = { logs: [] }) {
        const root = HTML({
            style: { display: 'flex', flexDirection: 'column', height: '100%', width: '100%', background: '#1e1e1e' }
        });

        const logFn = ConsoleOutput.attach(root, state);
        ConsoleInput.attach(root, state, logFn);

        container.appendChild(root);
        
        return {
            log: (logObj) => logFn(logObj)
        };
    },

    setPreviewTabId(id) {
        EternalConsoleState.setPreviewTabId(id);
    }
};
