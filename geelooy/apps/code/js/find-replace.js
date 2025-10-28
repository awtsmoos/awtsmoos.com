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
	isFindSelectionActive: false, 
    // B"H - IN: js/find-replace.js

	show(prefillText = '') {
	    if (!this.panel) return; // Safety check
	
	    // B"H - If text was passed in, populate the input field with it.
	    if (prefillText) {
	        this.findInput.value = prefillText;
	    }
	
	    this.panel.style.display = 'grid';
	    this.findInput.focus();
	    this.findInput.select(); // This will now select the pre-filled text for easy editing.
	},

    hide() {
	    if (!this.panel) return;
	    this.panel.style.display = 'none';
	    this.isFindSelectionActive = false; // B"H - Reset state on hide
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
	    const body = caseSensitive ? editor.value : editor.value.toLowerCase();
	    const query = caseSensitive ? originalQuery : originalQuery.toLowerCase();
	    
	    let index = -1;
	
	    if (reverse) {
	        let from = editor.selectionStart - 1;
	        index = body.lastIndexOf(query, from);
	        if (index === -1) {
	            UI.showToast("Searching from bottom...", "info");
	            index = body.lastIndexOf(query);
	        }
	    } else {
	        let from = editor.selectionEnd;
	        index = body.indexOf(query, from);
	        if (index === -1) {
	            UI.showToast("Searching from top...", "info");
	            index = body.indexOf(query, 0);
	        }
	    }
	
	    if (index !== -1) {
	        // --- B"H - THE KEY CHANGE IS HERE ---
	        // 1. Select the text AND focus the editor to make the highlight active (e.g., blue)
	        editor.setSelectionRange(index, index + originalQuery.length);
	        editor.focus();
	
	        // 2. Activate our special "find mode"
	        this.isFindSelectionActive = true;
	
	        // --- Scroll logic remains the same ---
	        const textBefore = editor.value.substring(0, index);
	        const lineNumber = (textBefore.match(/\n/g) || []).length;
	        const style = window.getComputedStyle(editor);
	        const lineHeight = parseFloat(style.lineHeight) || 24;
	        const editorRect = editor.getBoundingClientRect();
	        const scrollY = (lineNumber * lineHeight) - (editorRect.height / 2);
	        
	        editor.scrollTo({ top: scrollY, left: editor.scrollLeft, behavior: 'smooth' });
	
	    } else {
	        // If no matches are found, make sure to reset the state and focus the input
	        this.isFindSelectionActive = false;
	        this.findInput.focus();
	        this.findInput.select();
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
    
    if (!this.panel) return;

    this.panel.querySelector('#find-next-btn').onclick = () => this.find();
    this.panel.querySelector('#find-prev-btn').onclick = () => this.find(true);
    this.panel.querySelector('#find-close-btn').onclick = () => this.hide();
    this.panel.querySelector('#replace-btn').onclick = () => this.replace();
    this.panel.querySelector('#replace-all-btn').onclick = () => this.replaceAll();
    
    // This listener on the FIND INPUT still works the same
    this.findInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            this.find(e.shiftKey);
        }
    });

    // --- B"H - ADD NEW LISTENERS TO THE EDITOR ---

    // 1. The main logic: Intercept 'Enter' on the editor ONLY when in our special mode
    DOM.editor.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && this.isFindSelectionActive) {
            // Prevent the default action (which would delete the selected text)
            e.preventDefault();
            // Trigger the next search and keep the special mode active
            this.find(e.shiftKey);
        } else {
            // If any OTHER key is pressed, deactivate the special mode
            this.isFindSelectionActive = false;
        }
    });

    // 2. If the user clicks in the editor, deactivate the special mode
    DOM.editor.addEventListener('mousedown', () => {
        this.isFindSelectionActive = false;
    });
}
};