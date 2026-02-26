
// B"H
/**
 * @file input.js
 * @brief The receptor for the Developer's Commands.
 */

import { HTML } from '../../../html-generator.js';
import { DevToolsBridge } from '../../bridge.js';
import VirtualizedEditor from '/scripts/awtsmoos/coding/pnimi.js';

export const ConsoleInput = {
    attach(parentContainer, state, logFn) {
        let inputEl;
        let editorInstance = null;

        const area = HTML({
            className: 'dt-console-input-area',
            style: { 
                display: 'flex', 
                padding: '10px', 
                borderTop: '1px solid var(--color-border)', 
                background: 'var(--color-bg-secondary)', 
                alignItems: 'flex-start', 
                flexShrink: '0', 
                width: '100%' 
            },
            children:[
                { tag: 'span', style: { color: 'var(--neon-cyan)', fontWeight: 'bold', marginRight: '12px', marginTop: '4px', fontFamily: 'var(--font-code)' }, text: '>' },
                { 
                    className: 'dt-console-editor-wrap',
                    style: { position: 'relative', flexGrow: '1', minHeight: '24px', display: 'flex', flexDirection: 'column' },
                    children:[
                        {
                            tag: 'textarea',
                            id: 'dt-console-text-entry',
                            rows: 1,
                            placeholder: 'Execute JavaScript... (Shift+Enter for multi-line)',
                            spellcheck: false,
                            style: { 
                                width: '100%', 
                                minHeight: '24px', 
                                height: 'auto',
                                background: 'transparent', 
                                border: 'none', 
                                outline: 'none', 
                                fontFamily: 'var(--font-code)', 
                                fontSize: '14px', 
                                resize: 'none', 
                                overflow: 'hidden', 
                                lineHeight: '1.5', 
                                padding: '0', 
                                margin: '0', 
                                position: 'relative', 
                                zIndex: '50', 
                                display: 'block', 
                                whiteSpace: 'pre',
                                color: 'transparent', 
                                caretColor: 'white'
                            },
                            onInput: (e) => {
                                // Auto-resize logic
                                e.target.style.height = 'auto';
                                e.target.style.height = e.target.scrollHeight + 'px';
                                if (editorInstance) {
                                    editorInstance.wrapper.style.height = e.target.style.height;
                                    editorInstance.refresh();
                                }
                            },
                            onKeyDown: (e) => {
                                if (e.key === 'Enter' && !e.shiftKey) {
                                    e.preventDefault();
                                    const code = e.target.value.trim();
                                    if (code) {
                                        // 1. Log Input
                                        logFn({ level: 'input', args:[{ type: 'string', value: code, forceCode: true }] });
                                        // 2. Send Eval
                                        DevToolsBridge.sendEval(state.previewTabId, code);
                                        // 3. Reset
                                        e.target.value = '';
                                        e.target.style.height = 'auto';
                                        if (editorInstance) {
                                            editorInstance.update("");
                                            editorInstance.wrapper.style.height = '24px';
                                        }
                                    }
                                }
                            }
                        }
                    ]
                }
            ]
        });

        parentContainer.appendChild(area);
        inputEl = area.querySelector('#dt-console-text-entry');

        // B"H - Initialize Pnimi
        try {
            editorInstance = new VirtualizedEditor(inputEl, 'js');
            // Ensure wrapper matches input height
            editorInstance.wrapper.style.minHeight = '24px';
            editorInstance.wrapper.style.height = 'auto';
            // Force Pnimi overlay to background
            setTimeout(() => {
                if (editorInstance.overlay) {
                    editorInstance.overlay.style.zIndex = '1';
                    editorInstance.overlay.style.pointerEvents = 'none';
                }
            }, 50);
        } catch(e) {
            console.warn("[ConsoleInput] Highlighter failed, falling back to plain text", e);
            inputEl.style.color = 'var(--color-text-primary)';
        }

        setTimeout(() => inputEl.focus(), 150);
    }
};
