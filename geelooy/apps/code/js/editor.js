// B"H
// FILE: js/editor.js

import { DOM } from './state.js';
import { UI } from './ui.js';
import { StatusBar } from './statusbar.js';
import pnimi from '/scripts/awtsmoos/coding/pnimi.js';

export const Editor = {
    currentHighlighter: null,
    currentObjectURL: null,

    init() {
        // No DOM lookups needed here yet, but the pattern is good to have.
    },

    _getExt: (name) => {
        const ld = name.lastIndexOf(".");
        return (ld < 0) ? "" : name.substring(ld);
    },
    
    _clearPreviewer() {
        DOM.previewer.innerHTML = '';
        DOM.previewer.classList.add('hidden');
        if (this.currentObjectURL) {
            URL.revokeObjectURL(this.currentObjectURL);
            this.currentObjectURL = null;
        }
    },

    showTextEditor(content = "", filename = "") {
        this._clearPreviewer();
        DOM.editorWrapper.classList.remove('hidden');

        DOM.editor.value = content;
        UI.updateLineNumbers();
        StatusBar.updateLanguage(filename);
        setTimeout(() => { 
            UI.syncScroll(); 
            this.focus();

            if (this.currentHighlighter) {
                this.currentHighlighter.destroy();
            }
            const ext = this._getExt(filename);
            const langMap = { ".js": "js", ".css": "css", ".html": "html" };
            this.currentHighlighter = new pnimi(DOM.editor, langMap[ext] || "js");
        }, 0);
    },

    // --- B"H: FIND AND REPLACE THIS ENTIRE FUNCTION in js/editor.js ---

showPreviewer(data, fileInfo) {
    if (this.currentHighlighter) {
        this.currentHighlighter.destroy();
        this.currentHighlighter = null;
    }
    DOM.editorWrapper.classList.add('hidden');
    this._clearPreviewer();
    DOM.previewer.classList.remove('hidden');

    // --- B"H: NEW LOGIC FOR HTML PREVIEW ---
    if (fileInfo.type === 'html-preview') {
        // This is the definitive fix. By creating a Blob URL for the HTML,
        // the resulting iframe inherits the parent's security context,
        // enabling SharedArrayBuffer and Atomics to work correctly.
        const blob = new Blob([data], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        this.currentObjectURL = url; // Track this new URL for cleanup

        DOM.previewer.innerHTML = `<iframe src="${url}" style="width: 100%; height: 100%; border: none; background: #fff;"></iframe>`;
        return;
    }
    // --- END NEW LOGIC ---

    let url;
    if (data.isBinary) { // GitHub object
        url = `data:${data.mime};base64,${data.base64Content}`;
    } else { // Local FS Blob/File
        url = URL.createObjectURL(data);
        this.currentObjectURL = url;
    }

    switch(fileInfo.type) {
        case 'image':
            DOM.previewer.innerHTML = `<img src="${url}" alt="${fileInfo.name}">`;
            break;
        case 'video':
            DOM.previewer.innerHTML = `<video src="${url}" controls></video>`;
            break;
        case 'audio':
            DOM.previewer.innerHTML = `<audio src="${url}" controls></audio>`;
            break;
        case 'pdf':
            DOM.previewer.innerHTML = `<embed src="${url}" type="application/pdf" />`;
            break;
        default:
            DOM.previewer.innerHTML = `
                <div class="unsupported-message">
                    <svg class="svg-icon"><use href="#icon-file"></use></svg>
                    <h3>Binary File</h3>
                    <p>This file type cannot be previewed.</p>
                </div>`;
            break;
    }
},

    getContent: () => DOM.editor.value,

    getCursorInfo: () => {
        try {
            const textLines = DOM.editor.value.substring(0, DOM.editor.selectionStart).split("\n");
            return { line: textLines.length, col: textLines[textLines.length - 1].length + 1 };
        } catch (e) { return { line: 1, col: 1 }; }
    },

    focus: () => DOM.editor.focus(),
};