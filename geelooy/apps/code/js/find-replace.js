
// B"H
// FILE: js/find-replace.js

import { DOM } from './state.js';
import { UI } from './ui.js';
import { Editor } from './editor.js';

export const FindReplace = {
    panel: null,
    findInput: null,
    replaceInput: null,
    caseSensitiveCheckbox: null,
	isFindSelectionActive: false, 

	show(prefillText = '') {
	    if (!this.panel) return; 
	
	    if (prefillText) {
	        this.findInput.value = prefillText;
	    }
	
	    this.panel.style.display = 'grid';
	    this.findInput.focus();
	    this.findInput.select(); 
	},

    hide() {
	    if (!this.panel) return;
	    this.panel.style.display = 'none';
	    this.isFindSelectionActive = false; 
	    Editor.focus();
	},

    find(reverse = false) {
	    const originalQuery = this.findInput.value;
	    if (!originalQuery) return;
	
	    const caseSensitive = this.caseSensitiveCheckbox ? this.caseSensitiveCheckbox.checked : false;
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
	        editor.setSelectionRange(index, index + originalQuery.length);
	        editor.focus();
	        this.isFindSelectionActive = true;

	        const textBefore = editor.value.substring(0, index);
	        const lineNumber = (textBefore.match(/\n/g) || []).length;
	        const style = window.getComputedStyle(editor);
	        const lineHeight = parseFloat(style.lineHeight) || 24;
	        const editorRect = editor.getBoundingClientRect();
	        const scrollY = (lineNumber * lineHeight) - (editorRect.height / 2);
	        
	        editor.scrollTo({ top: scrollY, left: editor.scrollLeft, behavior: 'smooth' });
	
	    } else {
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

        const caseSensitive = this.caseSensitiveCheckbox ? this.caseSensitiveCheckbox.checked : false;
        const selectedText = DOM.editor.value.substring(DOM.editor.selectionStart, DOM.editor.selectionEnd);
        
        const selectionMatchesQuery = caseSensitive
            ? selectedText === query
            : selectedText.toLowerCase() === query.toLowerCase();

        if (selectionMatchesQuery) {
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
        const caseSensitive = this.caseSensitiveCheckbox ? this.caseSensitiveCheckbox.checked : false;

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
	    if (!this.panel) return;

	    this.findInput = this.panel.querySelector('#find-input');
	    this.replaceInput = this.panel.querySelector('#replace-input');
	    this.caseSensitiveCheckbox = this.panel.querySelector('#fr-case-sensitive');
	
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
	
	    DOM.editor.addEventListener('keydown', (e) => {
	        if (e.key === 'Enter' && this.isFindSelectionActive) {
	            e.preventDefault();
	            this.find(e.shiftKey);
	        } else {
	            this.isFindSelectionActive = false;
	        }
	    });
	
	    DOM.editor.addEventListener('mousedown', () => {
	        this.isFindSelectionActive = false;
	    });
	}
};
