
// B"H
/**
 * @file input.js
 * @brief Console input with smart keyboard and mobile-friendly controls.
 */

import { HTML } from '../../../../html-generator.js';
import { EternalConsoleState } from './state/eternalState.js';
import { ConsoleDOMCache } from './dom/domCache.js';
import { CONSOLE_INPUT_SCHEMA } from './input/inputSchema.js';
import { DevToolsBridge } from '../../bridge.js';
import VirtualizedEditor from '/scripts/awtsmoos/coding/pnimi.js';

export const ConsoleInput = {
    attach(parentContainer, state, logFn) {
        EternalConsoleState.sync(state);

        if (ConsoleDOMCache.inputArea && ConsoleDOMCache.inputArea.parentNode === parentContainer) {
            this._bind(ConsoleDOMCache.inputArea, state, logFn);
            return;
        }

        const area = HTML(CONSOLE_INPUT_SCHEMA);
        parentContainer.appendChild(area);
        ConsoleDOMCache.inputArea = area;
        
        this._bind(area, state, logFn);
        
        const inputEl = area.querySelector('#dt-console-text-entry');
        try {
            ConsoleDOMCache.editorInstance = new VirtualizedEditor(inputEl, 'js');
        } catch(e) { 
            inputEl.style.color = '#fff'; 
        }

        setTimeout(() => inputEl.focus(), 150);
    },

    _bind(area, state, logFn) {
        const inputEl = area.querySelector('#dt-console-text-entry');
        let historyIndex = -1;

        const sendCommand = () => {
            const code = inputEl.value.trim();
            if (!code) return;

            const logObj = { 
                level: 'input', 
                args: [{ type: 'string', value: code, forceCode: true }], 
                timestamp: Date.now() 
            };

            EternalConsoleState.addLog(logObj);
            EternalConsoleState.addToHistory(code);
            historyIndex = -1;
            logFn(logObj);
            
            DevToolsBridge.sendEval(state.previewTabId, code);

            // B"H - THE FLAWLESS CLEARING RITUAL
            inputEl.value = "";
            if (ConsoleDOMCache.editorInstance) {
                ConsoleDOMCache.editorInstance.update(""); // Tell the highglighter to clear
                ConsoleDOMCache.editorInstance.refresh();
            }
            
            // Dispatch event to satisfy any other listeners
            inputEl.dispatchEvent(new Event('input', { bubbles: true }));
            inputEl.style.height = '24px';
        };

        const insertTab = () => {
            const start = inputEl.selectionStart;
            const end = inputEl.selectionEnd;
            inputEl.value = inputEl.value.substring(0, start) + "\t" + inputEl.value.substring(end);
            inputEl.selectionStart = inputEl.selectionEnd = start + 1;
            if (ConsoleDOMCache.editorInstance) {
                ConsoleDOMCache.editorInstance.update(inputEl.value);
                ConsoleDOMCache.editorInstance.refresh();
            }
            inputEl.dispatchEvent(new Event('input', { bubbles: true }));
        };

        const attemptAutocomplete = () => {
            console.log("B\"H - Autocomplete requested for:", inputEl.value);
        };

        const prevCmd = () => {
            const hist = EternalConsoleState.getHistory();
            if (hist.length === 0) return;
            historyIndex = historyIndex === -1 ? hist.length - 1 : Math.max(0, historyIndex - 1);
            const val = hist[historyIndex];
            inputEl.value = val;
            if (ConsoleDOMCache.editorInstance) {
                ConsoleDOMCache.editorInstance.update(val);
                ConsoleDOMCache.editorInstance.refresh();
            }
            inputEl.dispatchEvent(new Event('input', { bubbles: true }));
        };

        inputEl.onkeydown = (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                sendCommand();
            } else if (e.key === 'Tab') {
                e.preventDefault();
                if (e.shiftKey) insertTab(); 
                else attemptAutocomplete();   
            } else if (e.key === 'ArrowUp') {
                if (inputEl.selectionStart === 0) {
                    e.preventDefault();
                    prevCmd();
                }
            }
        };

        const btnSend = area.querySelector('#dt-btn-send');
        const btnUp = area.querySelector('#dt-btn-up');
        const btnTab = area.querySelector('#dt-btn-tab');
        
        if (btnSend) btnSend.onclick = sendCommand;
        if (btnUp) btnUp.onclick = prevCmd;
        if (btnTab) btnTab.onclick = attemptAutocomplete;
    }
};
