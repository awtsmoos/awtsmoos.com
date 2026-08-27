
// B"H
// FILE: js/actions/text.js
import { DOM } from '../state.js';
import { UI } from '../ui.js';

export const TextActions = {
    insertCyberIpsum() {
        const words = ["Quantum", "Flux", "Cyber", "Mainframe", "Decrypt", "Override", "Node", "Vector", "Protocol", "Synth", "Nano", "Grid", "Matrix", "Void", "Stack", "Trace", "Buffer", "Inject"];
        let ipsum = "";
        for(let i=0; i<30; i++) ipsum += words[Math.floor(Math.random()*words.length)] + " ";
        this._insertText(ipsum.trim());
    },

    zalgoText() {
        this._transformSelection(text => {
            const chars = text.split('');
            return chars.map(c => c + Array(Math.floor(Math.random()*5)).fill(0).map(() => String.fromCharCode(768 + Math.floor(Math.random()*112))).join('')).join('');
        });
    },

    textBinary() {
        this._transformSelection(text => text.split('').map(c => c.charCodeAt(0).toString(2).padStart(8,'0')).join(' '));
    },

    textReverse() {
        this._transformSelection(text => text.split('').reverse().join(''));
    },

    transformUpper() { this._transformSelection(s => s.toUpperCase()); },
    transformLower() { this._transformSelection(s => s.toLowerCase()); },
    transformTitle() { 
        this._transformSelection(s => s.toLowerCase().replace(/\b\w/g, c => c.toUpperCase())); 
    },
    
    base64Encode() { this._transformSelection(s => btoa(s)); },
    base64Decode() { this._transformSelection(s => { try { return atob(s); } catch(e) { UI.showToast("Invalid Base64", "error"); return s; } }); },
    urlEncode() { this._transformSelection(s => encodeURIComponent(s)); },
    urlDecode() { this._transformSelection(s => decodeURIComponent(s)); },

    sortLines() { this._processLines(lines => lines.sort()); },
    
    trimTrailingWhitespace() {
        if (DOM.editorWrapper.classList.contains('hidden')) return;
        const editor = DOM.editor;
        const val = editor.value;
        const newVal = val.replace(/[ \t]+$/gm, '');
        
        if (val !== newVal) {
            const selStart = editor.selectionStart;
            const selEnd = editor.selectionEnd;
            editor.value = newVal;
            editor.setSelectionRange(selStart, selEnd);
            editor.dispatchEvent(new Event('input'));
            UI.showToast("Trailing void purged.", "success");
        } else {
            UI.showToast("The document is already pure.", "info");
        }
    },

    insertDate() {
        const dateStr = new Date().toLocaleString();
        this._insertText(dateStr);
    },
    
    insertUUID() {
        const uuid = crypto.randomUUID();
        this._insertText(uuid);
    },

    _transformSelection(transformFn) {
        if (DOM.editorWrapper.classList.contains('hidden')) return;
        const editor = DOM.editor;
        const start = editor.selectionStart;
        const end = editor.selectionEnd;
        if (start === end) {
            UI.showToast("No selection.", "warning");
            return;
        }
        const selectedText = editor.value.substring(start, end);
        const transformed = transformFn(selectedText);
        editor.setRangeText(transformed, start, end, 'select');
        editor.dispatchEvent(new Event('input'));
    },

    _processLines(processFn) {
        if (DOM.editorWrapper.classList.contains('hidden')) return;
        const editor = DOM.editor;
        const start = editor.selectionStart;
        const end = editor.selectionEnd;
        const val = editor.value;
        const lineStart = val.lastIndexOf('\n', start - 1) + 1;
        let lineEnd = val.indexOf('\n', end);
        if (lineEnd === -1) lineEnd = val.length;
        const textToProcess = val.substring(lineStart, lineEnd);
        let lines = textToProcess.split('\n');
        processFn(lines); 
        const result = lines.join('\n');
        editor.setRangeText(result, lineStart, lineEnd, 'select');
        editor.dispatchEvent(new Event('input'));
    },

    _insertText(text) {
        if (DOM.editorWrapper.classList.contains('hidden')) return;
        const editor = DOM.editor;
        const start = editor.selectionStart;
        const end = editor.selectionEnd;
        editor.setRangeText(text, start, end, 'end');
        editor.dispatchEvent(new Event('input'));
    }
};
