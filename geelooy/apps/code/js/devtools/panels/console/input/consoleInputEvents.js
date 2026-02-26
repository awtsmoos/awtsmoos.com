
// B"H
/**
 * @file consoleInputEvents.js
 * @brief Handles the sacred keystrokes that command reality.
 */

import { EternalConsoleState } from '../state/eternalState.js';
import { ConsoleDOMCache } from '../dom/domCache.js';
import { DevToolsBridge } from '../../../bridge.js';

export const ConsoleInputEvents = {
    bind(inputEl, logFn) {
        inputEl.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                const code = e.target.value.trim();
                
                if (code) {
                    const logObj = { level: 'input', args:[{ type: 'string', value: code, forceCode: true }] };
                    
                    // Manifest into Eternal Memory
                    EternalConsoleState.addLog(logObj);
                    
                    // Render to the physical screen
                    if (typeof logFn === 'function') {
                        logFn(logObj);
                    }
                    
                    // Dispatch to the Bridge
                    if (EternalConsoleState.previewTabId) {
                        DevToolsBridge.sendEval(EternalConsoleState.previewTabId, code);
                    }
                    
                    // Clear the physical input
                    if (ConsoleDOMCache.editorInstance) {
                        ConsoleDOMCache.editorInstance.update("");
                        if (ConsoleDOMCache.editorInstance.wrapper) {
                            ConsoleDOMCache.editorInstance.wrapper.style.height = '24px'; 
                        }
                    }
                    e.target.value = "";
                }
            }
        });

        // Auto-resize logic for the underlying textarea
        inputEl.addEventListener('input', () => {
            inputEl.style.height = 'auto'; 
            const newHeight = inputEl.scrollHeight;
            inputEl.style.height = `${newHeight}px`;
            
            if (ConsoleDOMCache.editorInstance && ConsoleDOMCache.editorInstance.wrapper) {
                ConsoleDOMCache.editorInstance.wrapper.style.height = `${newHeight}px`;
                ConsoleDOMCache.editorInstance.refresh();
            }
        });
    }
};
