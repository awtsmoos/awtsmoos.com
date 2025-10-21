// B"H
// FILE: js/find-replace.js

import { DOM } from './state.js';
import { UI } from './ui.js';
import { Editor } from './editor.js';

/**
 * FindReplace Module: Controls the find/replace panel in the editor.
 * 
 * B"H: THE FLAWLESS PATTERN
 * The object is defined with functions, but references to DOM elements are NOT
 * assigned here. They are "lazily" assigned inside the init() function, which
 * we know is only called AFTER the DOM is fully loaded and initialized.
 */
export const FindReplace = {
    // These are intentionally left null initially.
    panel: null,
    findInput: null,
    replaceInput: null,
    
    show() {
        if (!this.panel) return; // Safety check
        this.panel.style.display = 'grid';
        this.findInput.focus();
        this.findInput.select();
    },

    hide() {
        if (!this.panel) return;
        this.panel.style.display = 'none';
        Editor.focus();
    },

    find(reverse = false) {
        const query = this.findInput.value;
        if (!query) return;
        const body = DOM.editor.value;
        let from = DOM.editor.selectionEnd;
        let index = -1;

        if (reverse) {
            from = DOM.editor.selectionStart - 1;
            index = body.lastIndexOf(query, from);
        } else {
            index = body.indexOf(query, from);
        }

        if (index !== -1) {
            DOM.editor.setSelectionRange(index, index + query.length);
            DOM.editor.focus();
            const { top } = DOM.editor.getBoundingClientRect();
            const scrollY = (index / body.length) * DOM.editor.scrollHeight - top;
            DOM.editor.scrollTo(0, scrollY);
        } else {
            UI.showToast('No more occurrences found.', 'info');
        }
    },

    replace() {
        const query = this.findInput.value;
        const replacement = this.replaceInput.value;
        if (!query) return;
        const selectedText = DOM.editor.value.substring(DOM.editor.selectionStart, DOM.editor.selectionEnd);
        if (selectedText.toLowerCase() === query.toLowerCase()) {
            DOM.editor.setRangeText(replacement, DOM.editor.selectionStart, DOM.editor.selectionEnd, 'end');
            this.find();
        } else {
            this.find();
        }
    },

    replaceAll() {
        const query = this.findInput.value;
        const replacement = this.replaceInput.value;
        if (!query) return;
        const originalValue = DOM.editor.value;
        const newValue = originalValue.replaceAll(query, replacement);
        if (originalValue !== newValue) {
            DOM.editor.value = newValue;
            UI.showToast(`Replaced all occurrences.`, 'success');
            DOM.editor.dispatchEvent(new Event('input'));
        } else {
            UI.showToast(`No occurrences of "${query}" found.`, 'info');
        }
    },

    init() {
        // --- B"H: THE FIX IS HERE ---
        // We now look up the DOM elements inside init(), guaranteeing that
        // initializeDOM() has already run and DOM.findReplacePanel is a valid element.
        this.panel = DOM.findReplacePanel;
        this.findInput = this.panel.querySelector('#find-input');
        this.replaceInput = this.panel.querySelector('#replace-input');
        // --- END FIX ---

        this.panel.querySelector('#find-next-btn').onclick = () => this.find();
        this.panel.querySelector('#find-prev-btn').onclick = () => this.find(true);
        this.panel.querySelector('#find-close-btn').onclick = () => this.hide();
        this.panel.querySelector('#replace-btn').onclick = () => this.replace();
        this.panel.querySelector('#replace-all-btn').onclick = () => this.replaceAll();
    }
};



    
