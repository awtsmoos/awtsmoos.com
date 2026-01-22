//B"H
//FILE: js/editor.js
import { State, DOM } from "./state.js";
import { UI } from "./ui.js";
import { StatusBar } from "./statusbar.js";
import { Linter } from "./tools/linter.js"; 
import { ASTEngine } from "./tools/ast-engine.js"; 
import pnimi from "/scripts/awtsmoos/coding/pnimi.js";

export const Editor = {
    // ... (existing props and init) ...
	currentHighlighter: null,
	currentObjectURL: null,
    lintDebounce: null,
    refreshDebounce: null,

	init() {
        Linter.init().catch(e => console.warn("Linter init deferred", e));
        ASTEngine.setEditor(this);
        DOM.editor.addEventListener('input', () => {
            if (State.foldedRegistry.size > 0) {
                const wasChanged = ASTEngine.unfoldAll();
                if(wasChanged) {
                    if(this.currentHighlighter) this.currentHighlighter.setText(DOM.editor.value);
                }
            }
        });
    },
		
    _getExt: (name) => {
		const ld = name.lastIndexOf(".");
		return ld < 0 ? "" : name.substring(ld);
	},
	_clearPreviewer() {
		if (this.currentObjectURL) {
			URL.revokeObjectURL(this.currentObjectURL);
			this.currentObjectURL = null;
		}
	}, 
    
    // ... (indent detection, line ops, comment toggle, etc. - keep existing) ...
    detectIndentation(content) {
        const lines = content.split('\n', 100); 
        let spaces = 0, tabs = 0;
        for (const line of lines) {
            if (line.startsWith(' ')) spaces++;
            if (line.startsWith('\t')) tabs++;
        }
        if (tabs > spaces) State.useTabs = true;
        else if (spaces > tabs) State.useTabs = false;
    },
    duplicateLine() { this._manipulateLine((text, start, end) => { const content = text.substring(start, end); const insert = (end === -1 ? '\n' : '') + content + (end !== -1 ? '\n' : ''); return { text: insert, newSelection: null }; }); },
    moveLine(direction) { /* ... existing ... */ },
    deleteLine() { /* ... existing ... */ },
    insertLine(position = 'after') { /* ... existing ... */ },
    toggleComment() { /* ... existing ... */ },
    _manipulateLine(callback) { /* ... existing ... */ },
    async promptGoToLine() { /* ... existing ... */ },
    goToLine(lineNumber) { /* ... existing ... */ },

    // B"H - Enhanced Set Content with Smart Scroll
    setCurrentContent(txt) {
        if (!this.currentHighlighter) return;
        
        const editorEl = DOM.editor;
        
        // Smart Scroll Logic
        const threshold = 50; // px
        // Check if user is near bottom BEFORE update
        const isNearBottom = (editorEl.scrollHeight - editorEl.scrollTop - editorEl.clientHeight) < threshold;
        
        this.currentHighlighter.setText(txt);
        
        if (isNearBottom) {
            // Re-tether to bottom after update
            editorEl.scrollTop = editorEl.scrollHeight;
        }
    },

    // ... (rest of methods: showTextEditor, showPreviewer, etc. - keep existing) ...
	async showTextEditor(content = "", filename = "", scrollPos = 0) {
		UI.switchView("editor");
		State.isRestoring = true;
        State.foldedRegistry.clear();
		DOM.editor.value = content;
		DOM.editor.setSelectionRange(0, 0);
        this.detectIndentation(content);
		UI.updateLineNumbers();
		StatusBar.updateLanguage(filename);
        this.runLinter(content, filename);

		return new Promise(
			(resolve) => {
				const onRendered = () => {
					DOM.editor.removeEventListener("editor-rendered", onRendered);
					this.focus();
					requestAnimationFrame(() => {
                        DOM.editor.scrollTop = scrollPos;
                        UI.syncScroll();
                    });
					setTimeout(() => {
						State.isRestoring = false;
						resolve();
					}, 50);
				};
				const safetyTimer = setTimeout(() => { onRendered(); }, 300);
				DOM.editor.addEventListener("editor-rendered", () => {
						clearTimeout(safetyTimer);
						onRendered();
					}, { once: true });
				if (this.currentHighlighter) {
					this.currentHighlighter.destroy();
				}
				const ext = this._getExt(filename);
				const langMap = { ".js": "js", ".mjs": "js", ".css": "css", ".c": "c", ".html": "html", ".htm": "html", ".svg": "html", ".xml": "html", ".json": "json", ".awtsmoosJSON": "json" };
				this.currentHighlighter = new pnimi(DOM.editor, langMap[ext] || "js");
			}
		);
	},
    
    runLinter(content, filename) {
        if (!filename || !filename.match(/\.(js|mjs|json|awtsmoosJSON)$/)) {
            this.clearLintErrors();
            return;
        }
        if (this.lintDebounce) clearTimeout(this.lintDebounce);
        this.lintDebounce = setTimeout(() => {
            const errors = Linter.lint(content);
            this.renderLintErrors(errors);
        }, 800);
    },
    clearLintErrors() { UI.updateLineNumbers([]); },
    renderLintErrors(errors) { UI.updateLineNumbers(errors); },
	
    showPreviewer(data, fileInfo, tabId) {
        if (this.currentHighlighter) {
            this.currentHighlighter.destroy();
            this.currentHighlighter = null;
        }
        UI.switchView("preview");
        DOM.previewer.innerHTML = "";
        if (fileInfo.type === "html-preview") {
            let iframe = State.previewIframes.get(tabId);
            if (!iframe) {
                iframe = document.createElement("iframe");
                iframe.style.width = "100%";
                iframe.style.height = "100%";
                iframe.style.border = "none";
                iframe.style.background = "#fff";
                State.previewIframes.set(tabId, iframe);
                DOM.previewer.appendChild(iframe);
            } else {
                DOM.previewer.appendChild(iframe);
            }
            import('./html-preview-processor.js').then(({ orchestratePreview }) => {
                const tab = State.tabs.find(t => t.id === tabId);
                if (tab && tab.item) {
                    orchestratePreview(tab.item, iframe, tab.content);
                }
            });
            return;
        }
        let url;
        if (data.isBinary) {
            url = `data:${data.mime};base64,${data.base64Content}`;
        } else {
            url = URL.createObjectURL(data);
            this.currentObjectURL = url;
        }
        switch (fileInfo.type) {
            case "image": DOM.previewer.innerHTML = `<img src="${url}" alt="${fileInfo.name}">`; break;
            case "video": DOM.previewer.innerHTML = `<video src="${url}" controls></video>`; break;
            case "audio": DOM.previewer.innerHTML = `<audio src="${url}" controls></audio>`; break;
            case "pdf":   DOM.previewer.innerHTML = `<embed src="${url}" type="application/pdf" />`; break;
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
			const textLines = (DOM.editor.value.substring(0, DOM.editor.selectionStart)).split("\n");
			return { line: textLines.length, col: textLines[textLines.length - 1].length + 1 };
		} catch (e) {
			return { line: 1, col: 1 };
		}
	},
	focus: () => DOM.editor.focus()
};