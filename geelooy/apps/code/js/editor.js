// B"H
// FILE: js/editor.js

import { State, DOM } from './state.js';
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
        // Now only revokes the URL, doesn't touch the DOM
        if (this.currentObjectURL) {
            URL.revokeObjectURL(this.currentObjectURL);
            this.currentObjectURL = null;
        }
    },

    /*B"H*/
async showTextEditor(content = "", filename = "", scrollPos = 0) {
    UI.switchView('editor');
    
    // 1. LOCK STATE (Prevent scroll listeners from saving '0')
    State.isRestoring = true;

    // 2. Set Content
    DOM.editor.value = content;
    UI.updateLineNumbers();
    StatusBar.updateLanguage(filename);

    // 3. The "Retry Loop" Scroll Strategy
    return new Promise(resolve => {
        let attempts = 0;
        const maxAttempts = 20; // Try for approx 300ms

        const tryScrolling = () => {
            // Force browser to calc layout
            const currentScrollHeight = DOM.editor.scrollHeight;
            const clientHeight = DOM.editor.clientHeight;
            
            // Apply Scroll
            DOM.editor.scrollTop = scrollPos;
            UI.syncScroll();

            // Check if it worked OR if it's impossible (content too short)
            const didScroll = Math.abs(DOM.editor.scrollTop - scrollPos) < 5;
            const cantScroll = currentScrollHeight <= clientHeight;
            
            if (didScroll || cantScroll || attempts > maxAttempts) {
                // SUCCESS or Gave Up
                this.focus();
                
                // Re-apply Highlighting
                if (this.currentHighlighter) this.currentHighlighter.destroy();
                const ext = this._getExt(filename);
                const langMap = {
                    ".js": "js", ".mjs": "js", ".css": "css", ".html": "html",
                    ".htm": "html", ".svg": "html", ".xml": "html", 
                    ".json": "json", ".awtsmoosJSON": "json"
                };
                this.currentHighlighter = new pnimi(DOM.editor, langMap[ext] || "js");

                // UNLOCK after a safety buffer
                setTimeout(() => {
                    State.isRestoring = false;
                    resolve();
                }, 100);
            } else {
                // FAILED (Layout not ready yet), Try again next frame
                attempts++;
                requestAnimationFrame(tryScrolling);
            }
        };

        // Start the loop
        requestAnimationFrame(tryScrolling);
    });
},

    // --- B"H: FIND AND REPLACE THIS ENTIRE FUNCTION in js/editor.js ---

showPreviewer(data, fileInfo, tabId) { // B"H - Accept tabId
        if (this.currentHighlighter) {
            this.currentHighlighter.destroy();
            this.currentHighlighter = null;
        }

        UI.switchView('preview'); // B"H - Use view switcher
        DOM.previewer.innerHTML = ''; // Clear previous preview content

        let iframe = State.previewIframes.get(tabId);
        
        if (fileInfo.type === 'html-preview') {
             if (!iframe) {
                // Create iframe if it doesn't exist for this tab
                iframe = document.createElement('iframe');
                iframe.style.width = '100%';
                iframe.style.height = '100%';
                iframe.style.border = 'none';
                iframe.style.background = '#fff';
                iframe.sandbox ="allow-scripts allow-same-origin"
                State.previewIframes.set(tabId, iframe);
                
                const blob = new Blob([data], { type: 'text/html' });
                const url = URL.createObjectURL(blob);
                // We don't revoke this URL until the tab closes
                iframe.src = url;
             }
             // Move the iframe from the cache to the visible area
             DOM.previewer.appendChild(iframe);
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
            DOM.previewer.innerHTML = /*html*/`
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