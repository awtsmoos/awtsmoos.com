
// B"H
/**
 * @file input.js
 * @brief Orchestrates the receiving of the Divine Command (User Input).
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

        if (ConsoleDOMCache.inputArea) {
            parentContainer.appendChild(ConsoleDOMCache.inputArea);
            if (ConsoleDOMCache.editorInstance) {
                setTimeout(() => ConsoleDOMCache.editorInstance.refresh(), 50);
            }
            return;
        }

        const area = HTML(CONSOLE_INPUT_SCHEMA);
        parentContainer.appendChild(area);
        const inputEl = area.querySelector('#dt-console-text-entry');

        // B"H - Binding Logic
        inputEl.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                const code = e.target.value.trim();
                if (code) {
                    const logObj = { level: 'input', args:[{ type: 'string', value: code, forceCode: true }] };
                    EternalConsoleState.addLog(logObj);
                    logFn(logObj);
                    DevToolsBridge.sendEval(EternalConsoleState.getPreviewTabId(), code);
                    if (ConsoleDOMCache.editorInstance) {
                        ConsoleDOMCache.editorInstance.update("");
                    }
                    e.target.value = "";
                    inputEl.style.height = '24px';
                }
            }
        });

        inputEl.addEventListener('input', () => {
            inputEl.style.height = 'auto'; 
            const newHeight = inputEl.scrollHeight;
            inputEl.style.height = `${newHeight}px`;
            if (ConsoleDOMCache.editorInstance && ConsoleDOMCache.editorInstance.wrapper) {
                ConsoleDOMCache.editorInstance.wrapper.style.height = `${newHeight}px`;
                ConsoleDOMCache.editorInstance.refresh();
            }
        });

        try {
            const ve = new VirtualizedEditor(inputEl, 'js');
            ConsoleDOMCache.editorInstance = ve;
            if (ve.wrapper) {
                ve.wrapper.style.position = 'relative';
                ve.wrapper.style.height = '24px';
            }
        } catch(e) {
            inputEl.style.color = '#fff';
        }

        ConsoleDOMCache.inputArea = area;
        setTimeout(() => inputEl.focus(), 150);
    }
};
