
// B"H
/**
 * @file input.js
 * @brief THE SCRIBE OF COMMAND (ASIYAH).
 */

import { HTML } from '../../../../html-generator.js';
import { EternalConsoleState } from './state/eternalState.js';
import { ConsoleDOMCache } from './dom/domCache.js';
import { CONSOLE_INPUT_SCHEMA } from './input/inputSchema.js';
import { DevToolsBridge } from '../../bridge.js';
import { State } from '../../../state.js';
import VirtualizedEditor from '/scripts/awtsmoos/coding/pnimi.js';

export const ConsoleInput = {
    /**
     * B"H - Attaches the input vessel to the console.
     */
    attach(parentContainer, state, logFn) {
        // Force the input to understand where its evaluating.
        const targetId = String(state.previewTabId);
        
        EternalConsoleState.sync(state);

        let area = parentContainer.querySelector('.dt-console-input-area');
        if (!area) {
            area = HTML(CONSOLE_INPUT_SCHEMA);
            parentContainer.appendChild(area);
        }

        this._bind(area, state, logFn);
        
        const inputEl = area.querySelector('#dt-console-text-entry');
        if (inputEl && !inputEl._highlighterBound) {
            try {
                const ve = new VirtualizedEditor(inputEl, 'js');
                ConsoleDOMCache.editorInstance = ve;
                inputEl._highlighterBound = true;
                
                inputEl.addEventListener('input', () => {
                    inputEl.style.height = 'auto';
                    const h = inputEl.scrollHeight;
                    inputEl.style.height = h + 'px';
                    if (ve.wrapper) {
                        ve.wrapper.style.height = h + 'px';
                        ve.refresh();
                    }
                });
            } catch(e) { inputEl.style.color = '#fff'; }
        }

        setTimeout(() => inputEl && inputEl.focus(), 150);
    },

    /**
     * @private
     */
    _bind(area, state, logFn) {
        const inputEl = area.querySelector('#dt-console-text-entry');
        let historyIndex = -1;

        const sendCommand = () => {
            const code = inputEl.value.trim();
            if (!code) return;

            // B"H - ABSOLUTE IDENTITY RECTIFICATION
            // We use the ID explicitly passed through the state tree.
            let targetId = String(state.previewTabId);
            
            // IF state is still void, we reach through the heavens and the earth
            if (targetId === "undefined" || targetId === "null" || !targetId) {
                 console.log("[ConsoleInput] B\"H - Search for Lost Vision initiated.");
                 const devToolsTab = State.tabs.find(t => t.id === State.activeTabId && t.fileType === 'devtools');
                 
                 if (devToolsTab && devToolsTab.item.previewTabId) {
                     targetId = String(devToolsTab.item.previewTabId);
                 } else {
                     // The Earthly Search: Scrape the DOM for the iframe
                     const iframes = document.querySelectorAll('iframe.browser-iframe');
                     if (iframes.length > 0) {
                         // Get the most recently manifested iframe
                         const latestFrame = iframes[iframes.length - 1];
                         if (latestFrame.dataset.tabId) {
                             targetId = latestFrame.dataset.tabId;
                             console.log(`[ConsoleInput] B"H - Seized Vision ID from physical iframe: ${targetId}`);
                         }
                     }
                 }
                 state.previewTabId = targetId; // Anchor the found ID back to the state
            }

            const logObj = { 
                level: 'input', 
                args: [{ type: 'string', value: code, forceCode: true }], 
                timestamp: Date.now() 
            };

            // Inscribe into the eternal scroll
            EternalConsoleState.addLog(logObj);
            state.logs.push(logObj);
            
            EternalConsoleState.addToHistory(code);
            historyIndex = -1;
            
            // Draw onto the physical floor
            logFn(logObj);
            
            console.log(`%cB"H [ConsoleInput] -> Final Target Vision [${targetId}] | Transmitting Eval: ${code}`, "color: #00f6ff; font-weight: bold;");
            
            // Transmit the decree
            DevToolsBridge.sendEval(targetId, code);

            // Clean the pen
            inputEl.value = "";
            if (ConsoleDOMCache.editorInstance) {
                ConsoleDOMCache.editorInstance.update(""); 
                ConsoleDOMCache.editorInstance.refresh();
            }
            
            inputEl.dispatchEvent(new Event('input', { bubbles: true }));
            inputEl.style.height = '24px';
        };

        area.querySelector('#dt-btn-send').onclick = sendCommand;
        inputEl.onkeydown = (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                sendCommand();
            } else if (e.key === 'ArrowUp' && inputEl.selectionStart === 0) {
                 e.preventDefault();
                 const hist = EternalConsoleState.getHistory();
                 if (hist.length > 0) {
                     historyIndex = historyIndex === -1 ? hist.length - 1 : Math.max(0, historyIndex - 1);
                     inputEl.value = hist[historyIndex];
                     if(ConsoleDOMCache.editorInstance) ConsoleDOMCache.editorInstance.update(inputEl.value);
                     inputEl.dispatchEvent(new Event('input', { bubbles: true }));
                 }
            }
        };
    }
};
