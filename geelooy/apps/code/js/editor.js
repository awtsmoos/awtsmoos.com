//B"H
//FILE: js/editor.js
import { State, DOM } from "./state.js";
import { UI } from "./ui.js";
import { StatusBar } from "./statusbar.js";
import { Linter } from "./tools/linter.js"; // B"H
import pnimi from "/scripts/awtsmoos/coding/pnimi.js";

export const Editor = {
	currentHighlighter: null,
	currentObjectURL: null,
    lintDebounce: null,
    refreshDebounce: null,

	init() {
        // B"H - Init Linter
        Linter.init().catch(e => console.warn("Linter init deferred", e));
    },
		
    _getExt: (name) => {
		const ld = name.lastIndexOf(".");
		return ld < 0 ? "" : name.substring(ld);
	},
	_clearPreviewer() {
		if (this.currentObjectURL) {
			URL.revokeObjectURL(
				this.currentObjectURL
			);
			this.currentObjectURL = null;
		}
	}, 
    
    // B"H - NEW: Smart Indent Detection
    detectIndentation(content) {
        const lines = content.split('\n', 100); 
        let spaces = 0;
        let tabs = 0;
        for (const line of lines) {
            if (line.startsWith(' ')) spaces++;
            if (line.startsWith('\t')) tabs++;
        }
        if (tabs > spaces) State.useTabs = true;
        else if (spaces > tabs) State.useTabs = false;
    },

    // B"H - Line Operations
    duplicateLine() {
        this._manipulateLine((text, start, end) => {
            const content = text.substring(start, end);
            const insert = (end === -1 ? '\n' : '') + content + (end !== -1 ? '\n' : '');
            return { text: insert, newSelection: null };
        });
    },

    moveLine(direction) { 
        const editor = DOM.editor;
        const start = editor.selectionStart;
        const val = editor.value;
        const lineStart = val.lastIndexOf('\n', start - 1) + 1;
        const lineEnd = val.indexOf('\n', start);
        const actualEnd = lineEnd === -1 ? val.length : lineEnd;
        const currentLine = val.substring(lineStart, actualEnd);
        
        if (direction === -1) { 
            if (lineStart === 0) return; 
            const prevLineStart = val.lastIndexOf('\n', lineStart - 2) + 1;
            const prevLine = val.substring(prevLineStart, lineStart - 1);
            editor.setRangeText(currentLine + '\n' + prevLine, prevLineStart, actualEnd, 'select');
            editor.setSelectionRange(prevLineStart, prevLineStart + currentLine.length);
        } else { 
            if (lineEnd === -1) return;
            const nextLineEnd = val.indexOf('\n', lineEnd + 1);
            const actualNextEnd = nextLineEnd === -1 ? val.length : nextLineEnd;
            const nextLine = val.substring(lineEnd + 1, actualNextEnd);
            editor.setRangeText(nextLine + '\n' + currentLine, lineStart, actualNextEnd, 'select');
            const newStart = lineStart + nextLine.length + 1;
            editor.setSelectionRange(newStart, newStart + currentLine.length);
        }
        editor.dispatchEvent(new Event('input'));
    },

    deleteLine() {
        const editor = DOM.editor;
        const start = editor.selectionStart;
        const val = editor.value;
        const lineStart = val.lastIndexOf('\n', start - 1) + 1;
        let lineEnd = val.indexOf('\n', start);
        if (lineEnd !== -1) lineEnd++; // Include newline
        else lineEnd = val.length;
        
        editor.setRangeText('', lineStart, lineEnd, 'start');
        editor.dispatchEvent(new Event('input'));
    },

    insertLine(position = 'after') {
        const editor = DOM.editor;
        const start = editor.selectionStart;
        const val = editor.value;
        
        const lineStart = val.lastIndexOf('\n', start - 1) + 1;
        const currentLine = val.substring(lineStart, val.indexOf('\n', start) === -1 ? val.length : val.indexOf('\n', start));
        const leadingWhitespace = currentLine.match(/^\s*/)[0];

        if (position === 'after') {
            const lineEnd = val.indexOf('\n', start);
            const insertPos = lineEnd === -1 ? val.length : lineEnd;
            editor.setSelectionRange(insertPos, insertPos);
            editor.setRangeText('\n' + leadingWhitespace, insertPos, insertPos, 'end');
        } else {
            // Before
            const insertPos = lineStart;
            editor.setRangeText(leadingWhitespace + '\n', insertPos, insertPos, 'end');
            // Move cursor to the new line
            editor.setSelectionRange(insertPos + leadingWhitespace.length, insertPos + leadingWhitespace.length);
        }
        editor.dispatchEvent(new Event('input'));
        editor.focus();
    },

    toggleComment() {
        const editor = DOM.editor;
        const start = editor.selectionStart;
        const end = editor.selectionEnd;
        const val = editor.value;
        
        // Expand to full lines
        const lineStart = val.lastIndexOf('\n', start - 1) + 1;
        let lineEnd = val.indexOf('\n', end);
        if (lineEnd === -1) lineEnd = val.length;
        
        const text = val.substring(lineStart, lineEnd);
        const lines = text.split('\n');
        
        // Determine if we should comment or uncomment
        // If ALL lines are commented, uncomment. Otherwise, comment.
        const allCommented = lines.every(l => l.trim().startsWith('//') || l.trim() === '');
        
        const newLines = lines.map(line => {
            if (line.trim() === '') return line;
            if (allCommented) {
                return line.replace(/\/\/\s?/, '');
            } else {
                return '// ' + line;
            }
        });
        
        const result = newLines.join('\n');
        editor.setRangeText(result, lineStart, lineEnd, 'select');
        editor.dispatchEvent(new Event('input'));
    },

    _manipulateLine(callback) {
        const editor = DOM.editor;
        const start = editor.selectionStart;
        const end = editor.selectionEnd;
        const val = editor.value;
        const lineStart = val.lastIndexOf('\n', start - 1) + 1;
        const lineEnd = val.indexOf('\n', end);
        const actualEnd = lineEnd === -1 ? val.length : lineEnd;
        
        const result = callback(val, lineStart, actualEnd);
        if (result) {
            editor.setRangeText(result.text, actualEnd, actualEnd, 'select');
            editor.dispatchEvent(new Event('input'));
        }
    },

    async promptGoToLine() {
        const lineStr = await UI.showDialog({
            title: "Go to Line",
            hasInput: true,
            inputType: "number",
            placeholder: "Line number",
            okText: "Go"
        });
        if (lineStr) {
            const line = parseInt(lineStr, 10);
            if (!isNaN(line)) this.goToLine(line);
        }
    },

    goToLine(lineNumber) {
        const editor = DOM.editor;
        const lines = editor.value.split('\n');
        if (lineNumber < 1) lineNumber = 1;
        if (lineNumber > lines.length) lineNumber = lines.length;
        let charIndex = 0;
        for (let i = 0; i < lineNumber - 1; i++) {
            charIndex += lines[i].length + 1; 
        }
        editor.focus();
        editor.setSelectionRange(charIndex, charIndex);
        const style = window.getComputedStyle(editor);
        const lineHeight = parseFloat(style.lineHeight) || 24;
        const editorRect = editor.getBoundingClientRect();
        const scrollY = ((lineNumber - 1) * lineHeight) - (editorRect.height / 2);
        editor.scrollTo({ top: scrollY, left: 0, behavior: 'smooth' });
    },

    /*B"H*/
    async showTextEditor(content = "", filename = "", scrollPos = 0) {
		UI.switchView("editor");
		State.isRestoring = true;
		DOM.editor.value = content;
		DOM.editor.setSelectionRange(0, 0);
		
        this.detectIndentation(content);
		UI.updateLineNumbers();
		StatusBar.updateLanguage(filename);
		
        // B"H - Trigger Lint
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
    
    // B"H - Linter Logic
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

    clearLintErrors() {
        // UI.updateLineNumbers is called to refresh foldable icons even if no errors
        UI.updateLineNumbers([]);
    },

    renderLintErrors(errors) {
        UI.updateLineNumbers(errors);
    },
	
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
	setCurrentContent(txt) {
		if (!this.currentHighlighter) return;
		this.currentHighlighter.setText(txt);
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