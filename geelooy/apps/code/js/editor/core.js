
// B"H
/**
 * @file core.js
 * @brief The Heart of the Editor Manifestation.
 */
import { DOM, State } from '../state.js';
import { UI } from '../ui.js';
import { StatusBar } from '../statusbar.js';
import pnimi from '/scripts/awtsmoos/coding/pnimi.js';

export const EditorCore = {
    currentHighlighter: null,

    /**
     * @async
     * @function showTextEditor
     * @description Manifests content into the editor and forces a highlighter refresh.
     */
    async showTextEditor(content = "", filename = "", scrollPos = 0) {
        console.log(`B"H - [Editor] Manifesting ${content.length} chars for ${filename}`);
        
        State.isRestoring = true;
        
        // 1. Physical Update
        DOM.editor.value = content;
        UI.updateLineNumbers();
        StatusBar.updateLanguage(filename);

        // 2. Highlighter Re-Genesis
        if (this.currentHighlighter) {
            this.currentHighlighter.destroy();
            this.currentHighlighter = null;
        }

        const ext = '.' + filename.split('.').pop().toLowerCase();
        const langMap = { ".js": "js", ".mjs": "js", ".css": "css", ".html": "html", ".json": "json" };
        const lang = langMap[ext] || "js";

        try {
            this.currentHighlighter = new pnimi(DOM.editor, lang);
            // B"H - CRITICAL TIKKUN: Force the highlighter to perceive the content
            if (this.currentHighlighter.update) {
                this.currentHighlighter.update(content);
            }
        } catch (e) {
            console.warn("B\"H - Highlighter failed to initialize. Falling back to raw text.", e);
        }
        
        // 3. Spatial Restoration
        requestAnimationFrame(() => {
            DOM.editor.scrollTop = scrollPos;
            UI.syncScroll();
            State.isRestoring = false;
            console.log(`B"H - [Editor] Restoration complete.`);
        });
    },

    setCurrentContent(txt) {
        if (DOM.editor) DOM.editor.value = txt;
        if (this.currentHighlighter && this.currentHighlighter.update) {
            this.currentHighlighter.update(txt);
        }
    }
};
