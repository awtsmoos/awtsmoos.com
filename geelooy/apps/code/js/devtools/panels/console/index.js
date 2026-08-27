
// B"H
/**
 * @file index.js (console panel)
 * @brief THE MASTER ARCHITECT OF THE ECHO CHAMBER.
 */

import { HTML } from '../../../../html-generator.js';
import { ConsoleLogManager } from './log-manager.js';
import { ConsoleInput } from './input.js';

export const ConsolePanel = {
    /**
     * B"H - Manifests the Console View into a container.
     */
    init(container, state) {
        const id = String(state.previewTabId);
        console.log(`%cB"H [ConsolePanel] init() Vision: ${id}`, "color: #ff00ff; font-weight: bold;");

        let wrapper = container.querySelector('.dt-console-wrapper-sacred');
        let logManager;
        
        if (!wrapper) {
            container.innerHTML = '';
            wrapper = HTML({
                className: 'dt-console-wrapper-sacred',
                style: { display: 'flex', flexDirection: 'column', height: '100%', width: '100%', background: 'var(--color-bg-deep)', position: 'relative', overflow: 'hidden' },
                children: [
                    { id: 'dt-console-output', className: 'dt-console-output', style: { flexGrow: '1', overflowY: 'auto', width: '100%', background: '#000', padding: '10px' } }
                ]
            });
            container.appendChild(wrapper);

            const outputEl = wrapper.querySelector('#dt-console-output');
            logManager = new ConsoleLogManager(outputEl);
            wrapper._logManager = logManager;

            // Load existing history immediately
            logManager.hydrate(state.logs, state);
            
            // Attach the pen (Input)
            ConsoleInput.attach(wrapper, state, (inputLog) => {
                logManager.append(inputLog, state);
            });
        } else {
            logManager = wrapper._logManager;
        }

        // B"H - THE SACRED REGISTRATION (MULTICAST)
        // We register our specific append function to the state's listener set.
        const listener = (log) => logManager.append(log, state);
        
        if (state.logListeners) {
            // Purge any old listeners that might be stale
            state.logListeners.clear(); 
            state.logListeners.add(listener);
            console.log(`[ConsolePanel] B"H - Physical Ear (Listener) registered for Vision: ${id}`);
        }

        state.onDomUpdate = () => { /* Refresh console-specific DOM state if needed */ };
    }
};
