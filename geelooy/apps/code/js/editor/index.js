
// B"H
/**
 * @file index.js
 * @brief The Master Coordinator of the Text Vessel.
 */

import { State, DOM } from '../state.js';
import { UI } from '../ui.js';
import { StatusBar } from '../statusbar.js';
import { Linter } from '../tools/linter.js';
import { ASTEngine } from '../tools/ast-engine.js';
import { LineLogic } from './line-logic.js';
import pnimi from '/scripts/awtsmoos/coding/pnimi.js';

/**
 * @class Editor
 * @description The chariot for the revealed word.
 */
export const Editor = {
    currentHighlighter: null,
    lintDebounce: null,

    init() {
        Linter.init().catch(e => console.warn("Linter deferred."));
        ASTEngine.setEditor(this);
        DOM.editor.addEventListener('input', () => this.handleInput());
    },

    handleInput() {
        if (State.foldedRegistry.size > 0) {
            if (ASTEngine.unfoldAll()) {
                if (this.currentHighlighter) this.currentHighlighter.setText(DOM.editor.value);
            }
        }
    },

    setCurrentContent(txt) {
        if (!this.currentHighlighter) return;
        const editorEl = DOM.editor;
        const isNearBottom = (editorEl.scrollHeight - editorEl.scrollTop - editorEl.clientHeight) < 50;
        this.currentHighlighter.setText(txt);
        if (isNearBottom) editorEl.scrollTop = editorEl.scrollHeight;
    },

    duplicateLine() {
        const { content, pos } = LineLogic.duplicate(DOM.editor.value, DOM.editor.selectionStart, DOM.editor.selectionEnd);
        DOM.editor.setRangeText(content, pos, pos, 'end');
    },

    toggleComment() {
        const { newText } = LineLogic.toggleComment(DOM.editor.value, DOM.editor.selectionStart, DOM.editor.selectionEnd);
        DOM.editor.value = newText;
        DOM.editor.dispatchEvent(new Event('input'));
    },

    async showTextEditor(content = "", filename = "", scrollPos = 0) {
        UI.switchView("editor");
        State.isRestoring = true;
        DOM.editor.value = content;
        UI.updateLineNumbers();
        StatusBar.updateLanguage(filename);

        if (this.currentHighlighter) this.currentHighlighter.destroy();
        const ext = filename.substring(filename.lastIndexOf("."));
        const langMap = { ".js": "js", ".css": "css", ".html": "html", ".json": "json" };
        this.currentHighlighter = new pnimi(DOM.editor, langMap[ext] || "js");
        
        requestAnimationFrame(() => {
            DOM.editor.scrollTop = scrollPos;
            UI.syncScroll();
            State.isRestoring = false;
        });
    },

    getContent: () => DOM.editor.value,
    getCursorInfo: () => {
        const lines = (DOM.editor.value.substring(0, DOM.editor.selectionStart)).split("\n");
        return { line: lines.length, col: lines[lines.length - 1].length + 1 };
    },
    focus: () => DOM.editor.focus()
};
