// B"H
// FILE: js/actions/index.js

import { State, DOM } from '../state.js';
import { UI } from '../ui.js';
import { App } from '../app.js';
import { TextActions } from './text.js';
import { FileActions } from './files.js';
import { ViewActions } from './view.js';
import { Effects } from '../effects.js';
import { GitManager } from '../git/index.js';
import { beautify } from "/scripts/awtsmoos/MerkavaBeautifier/beautifier.js";
import { Linter } from '../tools/linter.js';
import { DataAltar } from '../data-altar/index.js';
import { Editor } from '../editor.js';
import { Tabs } from '../tabs/index.js';
import { FileOperations } from '../file-operations.js';
import { SelectionManager } from '../selection-manager.js';
import { Workspaces } from '../workspaces.js';

export const Actions = {
    async handle(action, item = State.contextTarget) {
        const activeTab = State.tabs.find(t => t.id === State.activeTabId);

        try {
            switch (action) {
                // --- VIEW & UI ---
                case "toggle-line-comment": ViewActions.toggleLineComment(); break;
                case "insert-line-before": ViewActions.insertLineBefore(); break;
                case "insert-line-after": ViewActions.insertLineAfter(); break;
                case "delete-line": ViewActions.deleteLine(); break;
                case "show-docs": ViewActions.showDocs(); break;
                case "visual-settings": ViewActions.visualSettings(); break;
                case "toggle-word-wrap": ViewActions.toggleWordWrap(); break;
                case "toggle-theme": ViewActions.toggleTheme(); break;
                case "toggle-keyboard-helper": ViewActions.toggleKeyboardHelper(); break;
                case "toggle-fullscreen": ViewActions.toggleFullscreen(); break;
                case "settings": ViewActions.showSettings(); break;
                case "find-replace": ViewActions.findReplace(); break;
                case "command-palette": ViewActions.commandPalette(); break;
                case "zen-mode": ViewActions.zenMode(); break;
                case "go-to-line": ViewActions.goToLine(); break;
                case "file-properties": ViewActions.fileProperties(item); break;
                case "close-other-tabs": ViewActions.closeOtherTabs(); break;
                case "close-all-tabs": ViewActions.closeAllTabs(); break;
                case "reopen-closed-tab": ViewActions.reopenClosedTab(); break;

                // --- EFFECTS ---
                case "toggle-matrix": Effects.toggleMatrix(); break;
                case "toggle-power": Effects.togglePowerMode(); break;
                case "toggle-sonic": Effects.toggleSonic(); break;
                case "toggle-entropy": Effects.toggleEntropy(); break;
                case "toggle-spotlight": Effects.toggleSpotlight(); break;
                case "voice-command": Effects.voiceCommand(); break;
                case "read-selection": 
                    const textToRead = DOM.editor.value.substring(DOM.editor.selectionStart, DOM.editor.selectionEnd) || "No text selected.";
                    const utter = new SpeechSynthesisUtterance(textToRead);
                    speechSynthesis.speak(utter);
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
                    });
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

                // --- TEXT OPS ---
                case "insert-cyber-ipsum": TextActions.insertCyberIpsum(); break;
                case "zalgo-text": TextActions.zalgoText(); break;
                case "text-binary": TextActions.textBinary(); break;
                case "text-reverse": TextActions.textReverse(); break;
                case "transform-upper": TextActions.transformUpper(); break;
                case "transform-lower": TextActions.transformLower(); break;
                case "transform-title": TextActions.transformTitle(); break;
                case "transform-base64-encode": TextActions.base64Encode(); break;
                case "transform-base64-decode": TextActions.base64Decode(); break;
                case "transform-url-encode": TextActions.urlEncode(); break;
                case "transform-url-decode": TextActions.urlDecode(); break;
                case "sort-lines": TextActions.sortLines(); break;
                case "insert-date": TextActions.insertDate(); break;
                case "insert-uuid": TextActions.insertUUID(); break;

                // --- FILE OPS ---
                case "new-temp-file": FileActions.newTempFile(); break;
                case "open-file": FileActions.openLocalFile(); break;
                case "save": FileActions.save(); break;
                case "download": FileActions.download(); break;
                case "new-file": FileActions.newItem(item, "new-file"); break;
                case "new-folder": FileActions.newItem(item, "new-folder"); break;
                case "rename": FileActions.rename(item); break;
                case "open-file-commander": FileActions.openFileCommander(item); break;
                case "open-zip-entry": FileActions.openZipEntry(item); break;
                case "copy-relative-path": FileActions.copyRelativePath(item); break;
                case "calculate-hash": FileActions.calculateHash(item); break;
                case "delete": FileActions.deleteItem(item); break;

                // --- MISC / TOOLS ---
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
                            contentHTML: `<ul style="list-style:none; padding:0;">${symbols.map(s => `<li style="padding:5px; border-bottom:1px solid var(--color-border);">${s}</li>`).join('')}</ul>`,
                            okText: "Close",
                            cancelText: ""
                        });
                    }
                    break;
                
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

                // --- GIT ---
                case "git-init": if (item) GitManager.initializeRepository(item); break;
                case "commit-changes": App.commitAllChanges(); break;
                case "switch-branch": if (item) GitManager.switchBranch(item); break;
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
                case "refresh":
                    if (item && item.kind === 'directory') {
                        const taskId = `refresh-${Date.now()}`;
                        UI.startTask(taskId, "Refreshing...");
                        await Workspaces.refreshNode(item);
                        UI.endTask(taskId, "success", "Refreshed.");
                    }
                    break;

                // --- CLIPBOARD ---
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

                case "cancel-menu": break;
            }
        } catch (e) {
            UI.showToast(`Error: ${e.message}`, "error");
            console.error("Action failed:", action, e);
        } finally {
            // UI.hideLoading(); // Removed, handled by tasks
        }
    }
};