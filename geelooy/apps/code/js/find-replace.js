// B"H
// FILE: js/find-replace.js
// REPLACE your entire FindReplace object with this one.

import { DOM } from './state.js';
import { UI } from './ui.js';
import { Editor } from './editor.js';

export const FindReplace = {
    panel: null,
    findInput: null,
    replaceInput: null,
    caseSensitiveCheckbox: null,

    show() {
        if (!this.panel) return;
        this.panel.style.display = 'grid';
        this.findInput.focus();
        this.findInput.select();
    },

    hide() {
        if (!this.panel) return;
        this.panel.style.display = 'none';
        Editor.focus();
    },

    /**
     * B"H - NEW, ROBUST FIND FUNCTION
     * This version performs the search directly and includes wrap-around logic.
     * It does NOT depend on a highlight layer or a pre-populated 'matches' array.
     */
    find(reverse = false) {
        const originalQuery = this.findInput.value;
        if (!originalQuery) return;

        const caseSensitive = this.caseSensitiveCheckbox.checked;
        const editor = DOM.editor;
        
        // Use temporary, lowercased strings for searching if not case sensitive
        const body = caseSensitive ? editor.value : editor.value.toLowerCase();
        const query = caseSensitive ? originalQuery : originalQuery.toLowerCase();
        
        let index = -1;

        if (reverse) {
            // --- REVERSE SEARCH ---
            let from = editor.selectionStart - 1;
            index = body.lastIndexOf(query, from);
            
            // If not found, wrap around and search from the very end of the file
            if (index === -1) {
                UI.showToast("Searching from bottom...", "info");
                index = body.lastIndexOf(query);
            }
        } else {
            // --- FORWARD SEARCH ---
            let from = editor.selectionEnd;
            index = body.indexOf(query, from);
            
            // If not found, wrap around and search from the very beginning
            if (index === -1) {
                UI.showToast("Searching from top...", "info");
                index = body.indexOf(query, 0);
            }
        }

        // If a match was found (either normally or after wrapping around)
        if (index !== -1) {
            editor.setSelectionRange(index, index + originalQuery.length);

            // Keep focus on the find input so the user can keep pressing Enter
            this.findInput.focus();
            this.findInput.select();

            // --- Scroll into view logic (remains the same) ---
            const textBefore = editor.value.substring(0, index);
            const lineNumber = (textBefore.match(/\n/g) || []).length;
            const style = window.getComputedStyle(editor);
            const lineHeight = parseFloat(style.lineHeight) || 24; // Use a fallback
            const editorRect = editor.getBoundingClientRect();
            const scrollY = (lineNumber * lineHeight) - (editorRect.height / 2);
            
            editor.scrollTo({ top: scrollY, left: editor.scrollLeft, behavior: 'smooth' });

        } else {
            UI.showToast('No occurrences found.', 'info');
        }
    },

    replace() {
        const query = this.findInput.value;
        const replacement = this.replaceInput.value;
        if (!query) return;

        // B"H - Improved logic to respect case-sensitivity on replace
        const caseSensitive = this.caseSensitiveCheckbox.checked;
        const selectedText = DOM.editor.value.substring(DOM.editor.selectionStart, DOM.editor.selectionEnd);
        
        const selectionMatchesQuery = caseSensitive
            ? selectedText === query
            : selectedText.toLowerCase() === query.toLowerCase();

        if (selectionMatchesQuery) {
            DOM.editor.setRangeText(replacement, DOM.editor.selectionStart, DOM.editor.selectionEnd, 'end');
            this.find(); // Find the next occurrence after replacing
        } else {
            this.find(); // If no text is selected, just find the first occurrence
        }
    },
    
    replaceAll() {
        const query = this.findInput.value;
        const replacement = this.replaceInput.value;
        if (!query) return;

        const originalValue = DOM.editor.value;
        const caseSensitive = this.caseSensitiveCheckbox.checked;

        const escapeRegExp = (string) => string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const escapedQuery = escapeRegExp(query);

        const flags = caseSensitive ? 'g' : 'gi';
        const regex = new RegExp(escapedQuery, flags);
        
        const newValue = originalValue.replace(regex, replacement);

        if (originalValue !== newValue) {
            DOM.editor.value = newValue;
            const matches = originalValue.match(regex) || [];
            UI.showToast(`Replaced ${matches.length} occurrences.`, 'success');
            DOM.editor.dispatchEvent(new Event('input'));
        } else {
            UI.showToast(`No occurrences of "${query}" found.`, 'info');
        }
    },
    
    init() {
        this.panel = DOM.findReplacePanel;
        this.findInput = this.panel.querySelector('#find-input');
        this.replaceInput = this.panel.querySelector('#replace-input');
        this.caseSensitiveCheckbox = this.panel.querySelector('#fr-case-sensitive');
        
        // Ensure panel exists before adding listeners
        if (!this.panel) return;

        this.panel.querySelector('#find-next-btn').onclick = () => this.find();
        this.panel.querySelector('#find-prev-btn').onclick = () => this.find(true);
        this.panel.querySelector('#find-close-btn').onclick = () => this.hide();
        this.panel.querySelector('#replace-btn').onclick = () => this.replace();
        this.panel.querySelector('#replace-all-btn').onclick = () => this.replaceAll();
        
        this.findInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                this.find(e.shiftKey); 
            }
        });
    }
};