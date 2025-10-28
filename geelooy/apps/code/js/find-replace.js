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

    // B"H - IN: js/find-replace.js
	// REPLACE your entire find() function with this one:
	find(reverse = false) {
	    const query = this.findInput.value;
	    if (!query) return;
	
	    const editor = DOM.editor;
	    const body = editor.value;
	    let index = -1;
	
	    if (reverse) {
	        // Start searching from just before the current selection begins
	        let from = editor.selectionStart - 1;
	        index = body.lastIndexOf(query, from);
	    } else {
	        // To find the *next* occurrence, start searching one character
	        // after the beginning of the current selection. This prevents finding the same match again.
	        let from = editor.selectionStart + 1;
	        index = body.indexOf(query, from);
	    }
	
	    if (index !== -1) {
	        editor.setSelectionRange(index, index + query.length);
	        editor.focus();
	
	        // --- B"H - NEW & IMPROVED SCROLL-INTO-VIEW LOGIC ---
	
	        // 1. Calculate the line number of the found text
	        const textBefore = body.substring(0, index);
	        const lineNumber = (textBefore.match(/\n/g) || []).length;
	        
	        // 2. Get editor's computed styles for accurate calculations
	        const style = window.getComputedStyle(editor);
	        const lineHeight = parseFloat(style.lineHeight);
	        
	        // 3. Calculate the desired vertical scroll position to center the line
	        const editorRect = editor.getBoundingClientRect();
	        const scrollY = (lineNumber * lineHeight) - (editorRect.height / 2);
	        
	        // 4. Calculate the horizontal scroll position based on column
	        const lineStartPos = body.lastIndexOf('\n', index - 1) + 1;
	        const column = index - lineStartPos;
	        
	        // 5. Estimate character width (0.6 is a good heuristic for monospace fonts)
	        const charWidth = parseFloat(style.fontSize) * 0.6;
	        // Scroll to a position slightly before the match to give it context
	        const scrollX = Math.max(0, (column * charWidth) - 50); // Show ~50px before match
	        
	        // 6. Perform the scroll with a smooth animation
	        editor.scrollTo({
	            top: scrollY,
	            left: scrollX,
	            behavior: 'smooth'
	        });
	
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
		    this.panel = DOM.findReplacePanel;
		    this.findInput = this.panel.querySelector('#find-input');
		    this.replaceInput = this.panel.querySelector('#replace-input');
		
		    this.panel.querySelector('#find-next-btn').onclick = () => this.find();
		    this.panel.querySelector('#find-prev-btn').onclick = () => this.find(true);
		    this.panel.querySelector('#find-close-btn').onclick = () => this.hide();
		    this.panel.querySelector('#replace-btn').onclick = () => this.replace();
		    this.panel.querySelector('#replace-all-btn').onclick = () => this.replaceAll();
		
		    // B"H - ADD THIS EVENT LISTENER FOR THE 'ENTER' KEY
		    this.findInput.addEventListener('keydown', (e) => {
		        if (e.key === 'Enter') {
		            e.preventDefault(); // Stop the default 'Enter' behavior
		            // Find previous on Shift+Enter, otherwise find next
		            this.find(e.shiftKey); 
		        }
		    });
		}
    }




    
