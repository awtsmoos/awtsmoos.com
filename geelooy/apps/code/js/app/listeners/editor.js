
// B"H
// FILE: js/app/listeners/editor.js

import { State, DOM } from '../../state.js';
import { UI } from '../../ui.js';
import { Effects } from '../../effects.js';
import { VisualEngine } from '../../visuals/index.js';
import { ASTEngine } from '../../tools/ast-engine.js';
import { App } from '../../app.js';
import { Editor } from '../../editor.js';
import { StatusBar } from '../../statusbar.js';
import { FindReplace } from '../../find-replace.js';

/**
 * @function setupEditorListeners
 * @description This vessel contains the sacred bindings for the Editor itself.
 * It listens for the very breath of creation (input), the shifting of perspective (scroll),
 * and the specific incantations (keydown) uttered within its holy bounds.
 */
export function setupEditorListeners() {
    DOM.editor.addEventListener('input', (e) => {
        Effects.spawnParticles();
        Effects.resetEntropy();
        VisualEngine.onInput(DOM.editor.value, e.inputType === 'deleteContentBackward');
        
        const activeTab = State.tabs.find(t => t.id === State.activeTabId);
        if (activeTab && !State.isRestoring) {
            if (!activeTab.isDirty) {
                activeTab.isDirty = true;
                import('../../tabs/index.js').then(m => m.Tabs.render());
            }
            activeTab.content = DOM.editor.value;
            App.saveSessionDebounced();
        }
        UI.updateLineNumbers();
    });

    DOM.editor.addEventListener('scroll', () => {
        UI.syncScroll();
        VisualEngine.onScroll();
        const activeTab = State.tabs.find(t => t.id === State.activeTabId);
        if (activeTab && !State.isRestoring && !DOM.editorWrapper.classList.contains('hidden')) {
            activeTab.scrollPos = DOM.editor.scrollTop;
            App.saveSessionDebounced();
        }
    });

    DOM.editor.addEventListener('keyup', () => { StatusBar.update(); VisualEngine.onCaretMove(); });
    DOM.editor.addEventListener('click', () => { StatusBar.update(); VisualEngine.onCaretMove(); });

    new ResizeObserver(UI.updateLineNumbers).observe(DOM.editor);

    const handleTabInInputs = (e) => {
        if (e.key === 'Tab') {
            e.preventDefault();
            e.target.setRangeText(App.getTabString(), e.target.selectionStart, e.target.selectionEnd, 'end');
        }
    };
    if (DOM.findInput) DOM.findInput.addEventListener('keydown', handleTabInInputs);
    if (DOM.replaceInput) DOM.replaceInput.addEventListener('keydown', handleTabInInputs);

    if(DOM.keyboardHelper) {
        DOM.keyboardHelper.addEventListener('click', (e) => {
            const btn = e.target.closest('button.kh-btn');
            if (!btn) return;
            const pair = btn.dataset.pair;
            const start = DOM.editor.selectionStart, end = DOM.editor.selectionEnd;
            if (pair) {
                const [pStart, pEnd] = pair;
                DOM.editor.setRangeText(pStart + DOM.editor.value.substring(start, end) + pEnd, start, end, 'select');
            }
        });
    }
}
