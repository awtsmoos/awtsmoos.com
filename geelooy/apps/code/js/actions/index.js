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
import { Workspaces, getItemUniquePath } from '../workspaces.js';
import { ASTEngine } from '../tools/ast-engine.js';
import { SearchSystem } from '../search-system.js'; 
import { FileSystemProvider } from '../fs-provider.js'; // B"H
import { GitMetaProvider } from '../git/meta.js'; // B"H
import { IndexedDBProvider } from '../fs/indexeddb.js'; // B"H

export const Actions = {
    async handle(action, item = State.contextTarget) {
        const activeTab = State.tabs.find(t => t.id === State.activeTabId);

        try {
            switch (action) {
                // ... (Existing cases unchanged) ...
                case "toggle-line-comment": ViewActions.toggleLineComment(); break;
                case "insert-line-before": ViewActions.insertLineBefore(); break;
                case "insert-line-after": ViewActions.insertLineAfter(); break;
                case "delete-line": ViewActions.deleteLine(); break;
                case "show-docs": ViewActions.showDocs(); break;
                case "visual-settings": ViewActions.visualSettings(); break;
                case "toggle-word-wrap": ViewActions.toggleWordWrap(); break;
                case "increase-font-size": ViewActions.increaseFontSize(); break;
                case "decrease-font-size": ViewActions.decreaseFontSize(); break;
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
                    
             case "open-file-tab": 
                if (item && item.kind === 'file') Tabs.create(item);
                break;
                case "insert-cyber-ipsum": TextActions.insertCyberIpsum(); break;
                case "zalgo-text": TextActions.zalgoText(); break;
                
                case "apply-external-ai":
                if (item && item.kind === 'directory') {
                    import('../features/ai-manifestation.js').then(m => m.AIManifestation.showDialog(item));
                } else {
                    UI.showToast("Please select a folder to apply changes to.", "warning");
                }
                break;
                
                
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
                case "new-temp-file": FileActions.newTempFile(); break;
                case "open-file": FileActions.openLocalFile(); break;
                case "save": FileActions.save(); break;
                case "download": FileActions.download(); break;
                case "new-file": FileActions.newItem(item, "new-file"); break;
                case "new-folder": FileActions.newItem(item, "new-folder"); break;
                case "rename": FileActions.rename(item); break;
                case "open-file-commander": FileActions.openFileCommander(item); break;
                case "search-in-folder": SearchSystem.show(item); break; 
                case "open-zip-entry": FileActions.openZipEntry(item); break;
                case "copy-relative-path": FileActions.copyRelativePath(item); break;
                case "calculate-hash": FileActions.calculateHash(item); break;
                case "delete": FileActions.deleteItem(item); break;
                case "fold-functions": ASTEngine.foldBlocks(); break;
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
                case "git-init": if (item) GitManager.initializeRepository(item); break;
                case "commit-changes": App.commitAllChanges(); break;
                case "switch-branch": if (item) GitManager.switchBranch(item); break;
                
                case "git-actions":
                    if (item) {
                        let rootItem = item;
                        if (item.type === 'github') {
                            const ws = State.workspaces.find(w => w.id === (item.workspaceId || item.id));
                            rootItem = ws || item;
                        } else {
                            let currPath = item.path;
                            const wsId = item.workspaceId || item.id;
                            let found = false;
                            while (true) {
                                const uPath = `${wsId}::${currPath}`;
                                const entry = State.domItemMap.get(uPath);
                                if (entry && entry.item && entry.item.isGitClone) {
                                    rootItem = entry.item;
                                    found = true;
                                    break;
                                }
                                if (currPath === '/' || currPath === '') break;
                                const lastSlash = currPath.lastIndexOf('/');
                                currPath = lastSlash <= 0 ? '/' : currPath.substring(0, lastSlash);
                            }
                            if (!found) {
                                const ws = State.workspaces.find(w => w.id === wsId);
                                if (ws && ws.isGitClone) rootItem = { ...ws, path: '/', kind: 'directory' };
                            }
                        }
                        GitManager.showGitUI(rootItem);
                    }
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
                
                case "refresh":
                    if (item && item.kind === 'directory') {
                        const taskId = `refresh-${Date.now()}`;
                        UI.startTask(taskId, "Annihilating & Refetching...");
                        
                        try {
                            const workspace = State.workspaces.find(ws => ws.id === (item.workspaceId || item.id));
                            
                            // B"H - ABSOLUTE REALITY RESET
                            if (workspace && (workspace.type === 'local' || workspace.type === 'opfs')) {
                                
                                // 1. Refresh the Master Key (Root Handle) from IDB
                                const freshHandle = await IndexedDBProvider.getHandle(workspace.id);
                                if (freshHandle) {
                                    workspace.handle = freshHandle;
                                    
                                    if (workspace.type === 'local' && freshHandle.queryPermission) {
                                        const perm = await freshHandle.queryPermission({ mode: 'read' });
                                        if (perm !== 'granted') {
                                            await freshHandle.requestPermission({ mode: 'read' });
                                        }
                                    }
                                }
                                
                                // 2. Wipe the Cache Map completely
                                if (workspace.type === 'local' && FileSystemProvider.Local.clearCache) {
                                    await FileSystemProvider.Local.clearCache(item, true); // true = BRUTAL
                                } else if (workspace.type === 'opfs' && FileSystemProvider.OPFS.clearCache) {
                                    await FileSystemProvider.OPFS.clearCache(item, true);
                                }
                                
                                // B"H - 3. Recursive Git Check (The "Renewal")
                                // We scan from the refreshed folder UP to the root
                                let pointerPath = item.path;
                                let limit = 20; // Safety
                                const wsId = workspace.id;
                                
                                while (limit-- > 0) {
                                    const tempItem = { 
                                        ...workspace, 
                                        workspaceId: wsId, 
                                        path: pointerPath, 
                                        kind: 'directory',
                                        handle: workspace.handle 
                                    };
                                    
                                    // Quietly check for git repo
                                    const gitInfo = await GitMetaProvider.getGitInfoForFolder(tempItem);
                                    
                                    const uniquePath = getItemUniquePath(tempItem);
                                    const domEntry = State.domItemMap.get(uniquePath);
                                    
                                    if (gitInfo) {
                                        // Found a repo!
                                        if (domEntry && domEntry.item) {
                                            domEntry.item.isGitClone = true;
                                            const icon = domEntry.el.querySelector('.svg-icon use');
                                            if (icon) icon.setAttribute('href', '#icon-git-folder');
                                        }
                                        if (pointerPath === '/') workspace.isGitClone = true;
                                    } else {
                                        // Update state if we thought it was a repo but it isn't
                                        if (domEntry && domEntry.item) {
                                            domEntry.item.isGitClone = false;
                                            // Reset icon to folder if it was git-folder
                                            const icon = domEntry.el.querySelector('.svg-icon use');
                                            if (icon && icon.getAttribute('href').includes('git-folder')) {
                                                icon.setAttribute('href', '#icon-folder');
                                            }
                                        }
                                        if (pointerPath === '/') workspace.isGitClone = false;
                                    }

                                    if (pointerPath === '/') break;
                                    const lastSlash = pointerPath.lastIndexOf('/');
                                    pointerPath = lastSlash <= 0 ? '/' : pointerPath.substring(0, lastSlash);
                                }
                            }
                            
                            // 3. Clean the item to ensure no stale handle is passed to list()
                            const cleanItem = { ...item };
                            if(cleanItem.handle) delete cleanItem.handle;
                            if(cleanItem._treeCache) delete cleanItem._treeCache;
                            
                            // 4. Force UI Refresh
                            await Workspaces.refreshNode(cleanItem);
                            UI.endTask(taskId, "success", "Reality Synchronized.");
                        } catch(e) {
                            UI.endTask(taskId, "error", "Refresh Failed: " + e.message);
                            console.error(e);
                        }
                    }
                    break;

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
                case "download-all-contents": if (item) FileOperations.downloadAllContents([item]); break;
                
                case "start-selection": SelectionManager.start(item); break;
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
                             const parentPath = target.path.substring(0, target.path.lastIndexOf('/')) || '/';
                             target = { ...target, path: parentPath, kind: 'directory' };
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
        }
    }
};
