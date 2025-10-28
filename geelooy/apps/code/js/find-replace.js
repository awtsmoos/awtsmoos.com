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
	 find(reverse = false) {
        this.updateHighlights();

        if (this.matches.length === 0) {
            UI.showToast('No occurrences found.', 'info');
            return;
        }

        if (reverse) {
            this.currentMatchIndex--;
            if (this.currentMatchIndex < 0) {
                this.currentMatchIndex = this.matches.length - 1; // Wrap around to the end
            }
        } else {
            this.currentMatchIndex++;
            if (this.currentMatchIndex >= this.matches.length) {
                this.currentMatchIndex = 0; // Wrap around to the start
            }
        }

        const currentMatch = this.matches[this.currentMatchIndex];
        const editor = DOM.editor;
        
        editor.setSelectionRange(currentMatch.index, currentMatch.index + currentMatch[0].length);

        this.findInput.focus();
        this.findInput.select();



        // Scroll into view
        const textBefore = editor.value.substring(0, currentMatch.index);
        const lineNumber = (textBefore.match(/\n/g) || []).length;
        const style = window.getComputedStyle(editor);
        const lineHeight = parseFloat(style.lineHeight);
        const editorRect = editor.getBoundingClientRect();
        const scrollY = (lineNumber * lineHeight) - (editorRect.height / 2);
        
        editor.scrollTo({ top: scrollY, left: editor.scrollLeft, behavior: 'smooth' });
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
		this.caseSensitiveCheckbox = this.panel.querySelector('#fr-case-sensitive');
		this.highlightLayer = document.getElementById('editor-highlight-layer');
		
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
		
		// B"H - Synchronize scrolling between textarea and highlight layer
		DOM.editor.addEventListener('scroll', () => {
		    this.highlightLayer.scrollTop = DOM.editor.scrollTop;
		    this.highlightLayer.scrollLeft = DOM.editor.scrollLeft;
		});
		
	}

   

    
    
};



    
