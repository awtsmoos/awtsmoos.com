// B"H
// FILE: js/actions.js

import { State, DOM } from './state.js';
import { UI } from './ui.js';
import { App } from './app.js';
import { Tabs } from './tabs/index.js';
import { Workspaces, getItemUniquePath } from './workspaces.js';
import { FindReplace } from './find-replace.js';
import { Clipboard } from './clipboard.js';
import { FileSystemProvider } from './fs-provider.js';
import { Editor } from './editor.js';
import { FileOperations } from './file-operations.js';
import { SelectionManager } from './selection-manager.js';
import { GitManager } from './git/index.js'; 
import { beautify } from "/scripts/awtsmoos/MerkavaBeautifier/beautifier.js";
import { FileCommander } from './file-commander.js';
import { ZipExplorer } from './zip/zip-explorer.js';
import { CommandPalette } from './command-palette.js'; 
import { Linter } from './tools/linter.js'; 
import { DataAltar } from './data-altar/index.js'; 
import { Help } from './help.js'; 
import { Effects } from './effects.js'; // B"H
import { VisualSettings } from './visuals/settings.js'; // B"H

export const Actions = {
    async handle(action, item = State.contextTarget) {
        const activeTab = State.tabs.find(t => t.id === State.activeTabId);

        try {
            switch (action) {
                // --- B"H NEW FEATURES ---
                case "toggle-line-comment": Editor.toggleComment(); break;
                case "insert-line-before": Editor.insertLine('before'); break;
                case "insert-line-after": Editor.insertLine('after'); break;
                case "delete-line": Editor.deleteLine(); break;
                case "show-docs": Help.show(); break;
                
                // EXTREME FEATURES
                case "toggle-matrix": Effects.toggleMatrix(); break;
                case "toggle-power": Effects.togglePowerMode(); break;
                case "toggle-sonic": Effects.toggleSonic(); break;
                case "toggle-entropy": Effects.toggleEntropy(); break;
                case "toggle-spotlight": Effects.toggleSpotlight(); break;
                case "voice-command": Effects.voiceCommand(); break;
                
                // B"H - Visual Settings Dialog
                case "visual-settings":
                    const html = VisualSettings.getSettingsPanelHTML();
                    UI.showDialog({
                        title: "Visual Engine Configuration",
                        contentHTML: html,
                        okText: "Close",
                        cancelText: ""
                    });
                    // Bind events after rendering
                    setTimeout(() => {
                        const dialog = document.getElementById('generic-dialog');
                        if (dialog) VisualSettings.bindEvents(dialog);
                    }, 50);
                    break;
                
                case "read-selection": 
                    const textToRead = DOM.editor.value.substring(DOM.editor.selectionStart, DOM.editor.selectionEnd) || "No text selected.";
                    const utter = new SpeechSynthesisUtterance(textToRead);
                    speechSynthesis.speak(utter);
                    break;
                
                case "insert-cyber-ipsum":
                    const words = ["Quantum", "Flux", "Cyber", "Mainframe", "Decrypt", "Override", "Node", "Vector", "Protocol", "Synth", "Nano", "Grid", "Matrix", "Void", "Stack", "Trace", "Buffer", "Inject"];
                    let ipsum = "";
                    for(let i=0; i<30; i++) ipsum += words[Math.floor(Math.random()*words.length)] + " ";
                    this._insertText(ipsum.trim());
                    break;
                
                case "zalgo-text":
                    this._transformSelection(text => {
                        const chars = text.split('');
                        return chars.map(c => c + Array(Math.floor(Math.random()*5)).fill(0).map(() => String.fromCharCode(768 + Math.floor(Math.random()*112))).join('')).join('');
                    });
                    break;
                
                case "text-binary":
                    this._transformSelection(text => text.split('').map(c => c.charCodeAt(0).toString(2).padStart(8,'0')).join(' '));
                    break;
                
                case "text-reverse":
                    this._transformSelection(text => text.split('').reverse().join(''));
                    break;
                
                case "show-time-travel":
                    if (!State.sessionHistory) State.sessionHistory = [];
                    const max = State.sessionHistory.length - 1;
                    if (max < 0) { UI.showToast("No history yet.", "info"); return; }
                    
                    const sliderHTML = `<div style="padding:10px;"><input type="range" id="time-travel-slider" min="0" max="${max}" value="${max}" style="width:100%;"></div>`;
                    
                    UI.showDialog({
                        title: "Time Travel",
                        contentHTML: sliderHTML,
                        okText: "Restore",
                        cancelText: "Cancel"
                    }).then(() => { /* Value is set live via listener below */ });
                    
                    setTimeout(() => {
                        const slider = document.getElementById('time-travel-slider');
                        if(slider) {
                            slider.oninput = (e) => {
                                const idx = parseInt(e.target.value);
                                const snap = State.sessionHistory[idx];
                                if(snap) DOM.editor.value = snap;
                            };
                        }
                    }, 100);
                    break;

                case "command-palette":
                    CommandPalette.toggle();
                    break;
                case "zen-mode":
                    document.body.classList.toggle('zen-mode');
                    UI.showToast(document.body.classList.contains('zen-mode') ? "Zen Mode Active (Esc to exit)" : "Zen Mode Disabled", "info");
                    break;
                case "go-to-line":
                    Editor.promptGoToLine();
                    break;
                case "file-properties":
                    if (item) {
                        const info = `
                            <strong>Name:</strong> ${item.name}<br>
                            <strong>Path:</strong> ${item.path}<br>
                            <strong>Type:</strong> ${item.kind} (${item.type})<br>
                            <strong>Workspace:</strong> ${State.workspaces.find(w => w.id === (item.workspaceId||item.id))?.name || 'N/A'}
                        `;
                        UI.showDialog({ title: "Properties", contentHTML: info, okText: "Close", cancelText: "" });
                    }
                    break;
                case "close-other-tabs":
                    if (State.contextTabTarget) {
                        const targetId = State.contextTabTarget.id;
                        const tabsToClose = State.tabs.filter(t => t.id !== targetId);
                        for (const t of tabsToClose) {
                            await Tabs.close(t.id, true);
                        }
                    }
                    break;
                case "close-all-tabs":
                    const allTabs = [...State.tabs];
                    for (const t of allTabs) await Tabs.close(t.id);
                    break;
                case "reopen-closed-tab":
                    Tabs.reopenLastClosed();
                    break;
                
                // --- Transforms ---
                case "transform-upper": this._transformSelection(s => s.toUpperCase()); break;
                case "transform-lower": this._transformSelection(s => s.toLowerCase()); break;
                case "transform-title": 
                    this._transformSelection(s => s.toLowerCase().replace(/\b\w/g, c => c.toUpperCase())); 
                    break;
                case "transform-base64-encode":
                    this._transformSelection(s => btoa(s));
                    break;
                case "transform-base64-decode":
                    this._transformSelection(s => { try { return atob(s); } catch(e) { UI.showToast("Invalid Base64", "error"); return s; } });
                    break;
                case "transform-url-encode":
                    this._transformSelection(s => encodeURIComponent(s));
                    break;
                case "transform-url-decode":
                    this._transformSelection(s => decodeURIComponent(s));
                    break;
                
                case "sort-lines": this._processLines(lines => lines.sort()); break;
                case "insert-date":
                    const dateStr = new Date().toLocaleString();
                    this._insertText(dateStr);
                    break;
                case "insert-uuid":
                    const uuid = crypto.randomUUID();
                    this._insertText(uuid);
                    break;
                
                // --- File Ops ---
                case "copy-relative-path":
                    if (item && item.path) {
                        await Clipboard.write(item.path);
                        UI.showToast("Copied relative path.", "success");
                    }
                    break;
                case "calculate-hash":
                    if (item && item.kind === 'file') {
                        UI.showLoading("Calculating SHA-256...");
                        try {
                            const content = await FileSystemProvider.read(item);
                            let bytes;
                            if (content instanceof Blob) bytes = await content.arrayBuffer();
                            else if (typeof content === 'string') bytes = new TextEncoder().encode(content);
                            else if (content.base64Content) bytes = Uint8Array.from(atob(content.base64Content), c=>c.charCodeAt(0));
                            
                            const hashBuffer = await crypto.subtle.digest('SHA-256', bytes);
                            const hashArray = Array.from(new Uint8Array(hashBuffer));
                            const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
                            
                            UI.showDialog({
                                title: "SHA-256 Hash",
                                contentHTML: `<div style="word-break:break-all; font-family:monospace; background:var(--color-bg-tertiary); padding:10px; border-radius:4px;">${hashHex}</div>`,
                                okText: "Copy",
                                cancelText: "Close"
                            }).then(res => { if(res) Clipboard.write(hashHex); });
                        } catch(e) {
                            UI.showToast("Error calculating hash.", "error");
                        } finally { UI.hideLoading(); }
                    }
                    break;

                case "toggle-word-wrap":
                    const currentWrap = DOM.editor.style.whiteSpace;
                    DOM.editor.style.whiteSpace = (currentWrap === 'pre-wrap') ? 'pre' : 'pre-wrap';
                    UI.showToast(`Word Wrap: ${DOM.editor.style.whiteSpace === 'pre-wrap' ? 'ON' : 'OFF'}`, 'info');
                    break;
                case "toggle-theme":
                    const body = document.body;
                    if (body.classList.contains('theme-midnight')) {
                        body.classList.remove('theme-midnight');
                        body.classList.add('theme-matrix');
                        UI.showToast("Theme: Matrix", "info");
                    } else if (body.classList.contains('theme-matrix')) {
                        body.classList.remove('theme-matrix');
                        UI.showToast("Theme: Vivid Dark (Default)", "info");
                    } else {
                        body.classList.add('theme-midnight');
                        UI.showToast("Theme: Midnight", "info");
                    }
                    break;
                case "eval-selection":
                    const code = DOM.editor.value.substring(DOM.editor.selectionStart, DOM.editor.selectionEnd);
                    if (!code) { UI.showToast("Select code to evaluate.", "warning"); return; }
                    try {
                        const result = eval(code);
                        UI.showToast(`Result: ${result}`, "success");
                        console.log("Eval Result:", result);
                    } catch(e) {
                        UI.showToast(`Error: ${e.message}`, "error");
                    }
                    break;
                case "transmute-json":
                    const text = DOM.editor.value;
                    try {
                        const obj = new Function(`return ${text}`)();
                        const json = JSON.stringify(obj, null, 4);
                        DOM.editor.value = json;
                        UI.showToast("Transmuted to JSON.", "success");
                    } catch(e) {
                        UI.showToast("Invalid Object Syntax.", "error");
                    }
                    break;
                case "show-ast":
                    if (!activeTab) return;
                    const ast = Linter.getAST(DOM.editor.value);
                    if (ast && !ast.error) {
                        UI.switchView('altar');
                        DataAltar.manifest(ast);
                        UI.showToast("AST Manifested in Altar.", "success");
                    } else {
                        UI.showToast(ast?.error || "Failed to generate AST.", "error");
                    }
                    break;
                case "show-outline":
                    if (!activeTab) return;
                    const astOutline = Linter.getAST(DOM.editor.value);
                    if (astOutline && !astOutline.error && astOutline.body) {
                        const symbols = [];
                        const traverse = (node) => {
                            if (node.type === 'FunctionDeclaration') symbols.push(`ƒ ${node.id.name}`);
                            if (node.type === 'ClassDeclaration') symbols.push(`© ${node.id.name}`);
                            if (node.type === 'VariableDeclaration') {
                                node.declarations.forEach(d => {
                                    if (d.init && (d.init.type === 'ArrowFunctionExpression' || d.init.type === 'FunctionExpression')) {
                                        symbols.push(`ƒ ${d.id.name}`);
                                    }
                                });
                            }
                        };
                        astOutline.body.forEach(traverse);
                        
                        if (symbols.length === 0) symbols.push("No symbols found.");
                        
                        UI.showDialog({
                            title: "Symbol Outline",
                            contentHTML: `<ul style="list-style:none; padding:0;">${
	                            symbols.map(s => `<li style="padding:5px; border-bottom:1px solid var(--color-border);">${s}</li>`).join('')
                            }</ul>
                            `,
                            okText: "Close",
                            cancelText: ""
                        });
                    }
                    break;

                // --- Git & Workspace ---
                case "git-init":
                    if (item) GitManager.initializeRepository(item);
                    break;
                case "commit-changes":
                    App.commitAllChanges();
                    break;
                case "switch-branch":
                    if (item) GitManager.switchBranch(item);
                    break;
                case "delete-workspace":
                    if (item && item.path === "/") {
                        const confirmed = await UI.showDialog({
                            title: "Remove Workspace",
                            message: `Remove '${item.name}'?`,
                            okText: "Remove"
                        });
                        if (confirmed) {
                            Workspaces.remove(item.id || item.workspaceId);
                            UI.showToast(`Workspace removed.`, "success");
                        }
                    }
                    break;
                
                // B"H - Refresh Logic
                case "refresh":
                    if (item && item.kind === 'directory') {
                        UI.showLoading("Refreshing...");
                        await Workspaces.refreshNode(item);
                        UI.showToast("Refreshed & Synced.", "success");
                    }
                    break;

                // --- File Creation & IO ---
                case "new-temp-file": Tabs.createTemporary(); break;
                case "open-file": App.openLocalFile(); break;
                case "save": Tabs.saveActive(); break;
                case "download": Tabs.downloadActive(); break;
                case "new-file":
                case "new-folder":
                    if (item) {
                        if (item.type === 'zip-entry') {
                            await ZipExplorer.createItem(action === "new-folder" ? "directory" : "file");
                            return;
                        }
                        const kind = action === "new-folder" ? "directory" : "file";
                        const name = await UI.showDialog({
                            title: `Create New ${kind}`,
                            hasInput: true,
                            placeholder: `Enter ${kind} name...`
                        });
                        if (name) {
                            await FileSystemProvider.create(item, name, kind);
                            UI.showToast(`${kind} '${name}' created.`, "success");
                            await Workspaces.refreshNode(item);
                            if (kind === "file") {
                                const newPath = item.path === "/" ? `/${name}` : `${item.path}/${name}`;
                                const newFileItem = { ...item, name, path: newPath, kind: "file", content: "" };
                                Tabs.create(newFileItem);
                            }
                        }
                    } else {
                        // B"H - Fallback to temporary file if no workspace selected
                        if (action === 'new-file') Tabs.createTemporary();
                        else UI.showToast("Select a folder to create a new folder.", "warning");
                    }
                    break;
                
                case "rename":
                    if (item && (item.type === 'local' || item.type === 'opfs')) {
                        const newName = await UI.showDialog({
                            title: "Rename Item",
                            hasInput: true,
                            inputType: 'text',
                            placeholder: item.name,
                            inputValue: item.name, 
                            okText: "Rename"
                        });
                        
                        if (newName && newName !== item.name) {
                            UI.showLoading("Renaming...");
                            await FileSystemProvider.rename(item, newName);
                            const parentPath = item.path.substring(0, item.path.lastIndexOf('/')) || '/';
                            const parentItem = { ...item, path: parentPath, kind: 'directory' };
                            await Workspaces.refreshNode(parentItem);
                            UI.showToast("Item renamed.", "success");
                        }
                    } else {
                        UI.showToast("Rename not supported for this item type.", "warning");
                    }
                    break;
                
                case "open-file-commander":
                    if (item && item.kind === 'directory') FileCommander.show(item);
                    break;
                
                case "open-zip-entry":
                    if (item && item.type === 'zip-entry') {
                        if (ZipExplorer.currentZip) {
                            const entry = ZipExplorer.currentZip.entries.find(e => e.filename === item.path);
                            if (entry) ZipExplorer.openEntry(entry);
                            else ZipExplorer.openEntry({ filename: item.path, isDir: false, getData: async() => new Blob([]) });
                        }
                    }
                    break;

                // --- Editing & View ---
                case "beautify":
                    if(Editor.currentHighlighter) {
                        const cont = Editor.getContent();
                        const bew = await beautify(cont);
                        Editor.currentHighlighter.setText(bew);
                    }
                    break;
                case "toggle-awtsmoos-view":
                    if (activeTab) {
                        activeTab.isHexView = !activeTab.isHexView;
                        activeTab.forceReload = true;
                        Tabs.activate(activeTab.id);
                    }
                    break;
                case "view-html":
                    if (activeTab) {
                        const content = Editor.getContent();
                        Tabs.createPreview(activeTab.item, content);
                    }
                    break;
                case "toggle-altar-view":
                    if (activeTab) {
                        activeTab.isAltarView = !activeTab.isAltarView;
                        Tabs.activate(activeTab.id, true);
                    }
                    break;
                case "find-replace": FindReplace.show(); break;
                case "toggle-keyboard-helper": DOM.keyboardHelper.classList.toggle("is-visible"); break;
                case "toggle-fullscreen": App.toggleFullscreen(); break;
                case "settings": App.showSettings(); break;

                // --- Clipboard & Selection ---
                case "select-all": if (activeTab) DOM.editor.select(); break;
                case "copy":
                    const selectedText = DOM.editor.value.substring(DOM.editor.selectionStart, DOM.editor.selectionEnd);
                    if (selectedText) {
                        await Clipboard.write(selectedText);
                        UI.showToast("Selection copied!", "success");
                    }
                    break;
                case "copy-all":
                    if (activeTab && DOM.editor.value) {
                        await Clipboard.write(DOM.editor.value);
                        UI.showToast("All content copied!", "success");
                    }
                    break;
                case "copy-all-contents": if (item) FileOperations.copyAllContents([item]); break;
                case "start-selection": SelectionManager.start(item, State.contextEvent); break;
                case "copy-single":
                    if (item) {
                        State.fileClipboard = [getItemUniquePath(item)];
                        UI.showToast(`Copied "${item.name}" to clipboard.`, "success");
                    }
                    break;
                case "copy-zip-single": if (item) FileOperations.copyAsZip([item]); break;
                case "download-zip-single": if (item) FileOperations.downloadAsZip([item]); break;
                case "download-file": if (item) FileOperations.downloadFile(item); break;

                case "paste":
                    if (item) {
                        let target = item;
                        if (target.kind === 'file') {
                             if (target.type === 'zip-entry') {
                                 const idx = target.path.lastIndexOf('/');
                                 const parentPath = idx >= 0 ? target.path.substring(0, idx) : '';
                                 target = { ...target, path: parentPath, kind: 'directory' };
                             } else {
                                 const parentPath = target.path.substring(0, target.path.lastIndexOf('/')) || '/';
                                 target = { ...target, path: parentPath, kind: 'directory' };
                             }
                        }
                        if (target.kind === "directory") FileOperations.paste(target);
                        else UI.showToast("Paste target must be a directory.", "warning");
                    }
                    break;

                // --- Destructive ---
                case "delete":
                    if (item) {
                        if (item.type === 'zip-entry') {
                            await ZipExplorer.deleteItem(item.path);
                            return;
                        }
                        const confirmed = await UI.showDialog({
                            title: "Confirm Deletion",
                            message: `Delete '${item.name}'?`,
                            okText: "Delete"
                        });
                        if (confirmed) {
                            const tab = State.tabs.find(t => t.uniquePath === Tabs.getUniquePath(item));
                            if (tab) await Tabs.close(tab.id, true);
                            await FileSystemProvider.delete(item);
                            const parentPath = item.path.substring(0, item.path.lastIndexOf("/")) || "/";
                            await Workspaces.refreshNode({ ...item, path: parentPath, kind: "directory" });
                            UI.showToast(`'${item.name}' deleted.`, "success");
                        }
                    }
                    break;
                case "cancel-menu": break;
            }
        } catch (e) {
            UI.showToast(`Error: ${e.message}`, "error");
            console.error("Action failed:", action, e);
        } finally {
            UI.hideLoading();
        }
    },

    // --- Helpers for Text Manipulation ---
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