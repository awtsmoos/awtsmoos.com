// B"H
// FILE: js/editor.js

import { DOM } from './state.js';
import { UI } from './ui.js';
import { StatusBar } from './statusbar.js';
import pnimi from "/scripts/awtsmoos/coding/pnimi.js";

/**
 * Editor Module: Manages the main text editor area.
 */
export const Editor = {
    currentHighlighter: null,

    getExt: (name) => {
        var ld = name.lastIndexOf(".");
        if (ld < 0) return "";
        var last = name.substring(ld);
        return last;
    },

    setContent: (content = "", filename = "") => {
        DOM.editor.value = content;
        UI.updateLineNumbers();
        StatusBar.updateLanguage(filename);
        setTimeout(() => { 
            UI.syncScroll(); 
            Editor.focus();

            if (Editor.currentHighlighter) {
                Editor.currentHighlighter.destroy();
            }

            var ext = Editor.getExt(filename);
            var real = {
                ".js": "js",
                ".css": "css",
                ".html": "html"
            };
            var f = real[ext];

            Editor.currentHighlighter = new pnimi(DOM.editor, f || "js");
        }, 0);
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