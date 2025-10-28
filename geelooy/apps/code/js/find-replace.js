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
    
    // B"H - IN: js/find-replace.js

	// Keep the `show()` and `hide()` functions as they are.
	// Replace the `find()` function:
	
	find(reverse = false) {
	    const originalQuery = this.findInput.value;
	    if (!originalQuery) return;
	
	    const editor = DOM.editor;
	    const caseSensitive = this.caseSensitiveCheckbox.checked;
	
	    // Use temporary, lowercased strings for searching if not case sensitive
	    const body = caseSensitive ? editor.value : editor.value.toLowerCase();
	    const query = caseSensitive ? originalQuery : originalQuery.toLowerCase();
	    
	    let index = -1;
	
	    // Determine the starting point for the search
	    const selectionStart = editor.selectionStart;
	    const from = reverse ? selectionStart - 1 : selectionStart + 1;
	
	    // Perform the search
	    index = reverse ? body.lastIndexOf(query, from) : body.indexOf(query, from);
	
	    if (index !== -1) {
	        // We found a match. Select it in the editor.
	        editor.setSelectionRange(index, index + originalQuery.length);
	
	        // --- B"H: FOCUS & SCROLL FIXES ---
	        // 1. Re-focus and select the text in the FIND input, not the editor
	        this.findInput.focus();
	        this.findInput.select();
	
	        // 2. Scroll the editor smoothly to the selection
	        const textBefore = editor.value.substring(0, index);
	        const lineNumber = (textBefore.match(/\n/g) || []).length;
	        const style = window.getComputedStyle(editor);
	        const lineHeight = parseFloat(style.lineHeight);
	        const editorRect = editor.getBoundingClientRect();
	        const scrollY = (lineNumber * lineHeight) - (editorRect.height / 2);
	        
	        editor.scrollTo({ top: scrollY, behavior: 'smooth' });
	
	    } else {
	        UI.showToast('No more occurrences found.', 'info');
	    }
	},
	
	// Keep the `replace()` function as it is.
	// Replace the `replaceAll()` function:
	
	replaceAll() {
	    const query = this.findInput.value;
	    const replacement = this.replaceInput.value;
	    if (!query) return;
	
	    const originalValue = DOM.editor.value;
	    let newValue;
	    const caseSensitive = this.caseSensitiveCheckbox.checked;
	
	    // Helper function to escape special regex characters from the query
	    const escapeRegExp = (string) => string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
	    const escapedQuery = escapeRegExp(query);
	
	    // Use a regular expression for case-insensitive replacement
	    const flags = caseSensitive ? 'g' : 'gi'; // g = global, i = ignore case
	    const regex = new RegExp(escapedQuery, flags);
	    
	    newValue = originalValue.replace(regex, replacement);
	
	    if (originalValue !== newValue) {
	        DOM.editor.value = newValue;
	        const matches = originalValue.match(regex) || [];
	        UI.showToast(`Replaced ${matches.length} occurrences.`, 'success');
	        DOM.editor.dispatchEvent(new Event('input'));
	    } else {
	        UI.showToast(`No occurrences of "${query}" found.`, 'info');
	    }
	},
	
	// And finally, replace the `init()` function:
	
	init() {
	    this.panel = DOM.findReplacePanel;
	    this.findInput = this.panel.querySelector('#find-input');
	    this.replaceInput = this.panel.querySelector('#replace-input');
	    this.caseSensitiveCheckbox = this.panel.querySelector('#fr-case-sensitive'); // Get the new checkbox
	
	    this.panel.querySelector('#find-next-btn').onclick = () => this.find();
	    this.panel.querySelector('#find-prev-btn').onclick = () => this.find(true);
	    this.panel.querySelector('#find-close-btn').onclick = () => this.hide();
	    this.panel.querySelector('#replace-btn').onclick = () => this.replace();
	    this.panel.querySelector('#replace-all-btn').onclick = () => this.replaceAll();
	
	    // The 'Enter' key listener remains the same and now works perfectly with the new logic
	    this.findInput.addEventListener('keydown', (e) => {
	        if (e.key === 'Enter') {
	            e.preventDefault();
	            this.find(e.shiftKey); 
	        }
	    });
	}

   

    
    
};



    
