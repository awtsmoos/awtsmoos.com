
// B"H
/**
 * @file consoleInputEditor.js
 * @brief Manifests the syntax highlighter upon the bare textarea.
 */

import VirtualizedEditor from '/scripts/awtsmoos/coding/pnimi.js';
import { ConsoleDOMCache } from '../dom/domCache.js';

export const ConsoleInputEditor = {
    attach(inputEl) {
        try {
            ConsoleDOMCache.editorInstance = new VirtualizedEditor(inputEl, 'js');
            const wrapper = ConsoleDOMCache.editorInstance.wrapper;
            
            if (wrapper) {
                wrapper.style.position = 'relative';
                wrapper.style.height = 'auto';
                wrapper.style.minHeight = '24px';
            }
        } catch(err) {
            console.warn("B\"H - [ConsoleInput] Highlighter init failed", err);
            inputEl.style.color = 'var(--color-text-primary)';
        }
    }
};
