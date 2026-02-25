
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
import { GitMetaProvider } from '../git/meta.js';
import { FileCommander } from '../file-commander.js';
import { Terminal } from '../terminal/index.js';

export const Actions = {
    async handle(action, item = State.contextTarget) {
        const activeTab = State.tabs.find(t => t.id === State.activeTabId);
        try {
            switch (action) {
                case "copy-for-clone":
				    State.clipboardCloneSource = item;
				    UI.showToast(`Source marked: ${item.name}.`, "success");
				    break;
				case "clone-repo-here":
				    if (State.clipboardCloneSource && item.kind === 'directory') {
				        FileOperations.cloneRepo(State.clipboardCloneSource, item);
				        State.clipboardCloneSource = null;
				    }
			        break;
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
                    const txt = DOM.editor.value.substring(DOM.editor.selectionStart, DOM.editor.selectionEnd) || "None";
                    speechSynthesis.speak(new SpeechSynthesisUtterance(txt));
                    break;
                case "show-time-travel":
                    const max = (State.sessionHistory?.length || 0) - 1;
                    if (max < 0) return UI.showToast("No history.", "info");
                    UI.showDialog({ title: "Time Travel", contentHTML: `<input type="range" id="tt-s" min="0" max="${max}" value="${max}" style="width:100%;">`, okText: "Restore" });
                    setTimeout(() => { document.getElementById('tt-s').oninput = (e) => { DOM.editor.value = State.sessionHistory[e.target.value]; }; }, 100);
                    break;
                case "open-file-tab": if (item?.kind === 'file') Tabs.create(item); break;
                case "insert-cyber-ipsum": TextActions.insertCyberIpsum(); break;
                case "zalgo-text": TextActions.zalgoText(); break;
                case "apply-external-ai":
                    if (item?.kind === 'directory') {
                        import('../vibe/vibe-controller.js').then(async m => {
                            await m.VibeController.open(item);
                            const tab = State.tabs.find(t => t.vibeSession?.rootPath === item.path);
                            if (tab) { tab.vibeSession.activeSidebarTab = 'manifest'; Tabs.activate(tab.id); }
                        });
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
                
                // B"H - Updated Actions
                case "open-file-commander-tab": 
                    FileCommander.open(item); 
                    break;
                
                case "open-terminal-tab": 
                    Terminal.open(item); 
                    break;

                case "search-in-folder": SearchSystem.show(item); break; 
                case "open-zip-entry": FileActions.openZipEntry(item); break;
                case "copy-relative-path": FileActions.copyRelativePath(item); break;
                case "calculate-hash": FileActions.calculateHash(item); break;
                case "delete": FileActions.deleteItem(item); break;
                case "fold-functions": ASTEngine.foldBlocks(); break;
                case "show-ast":
                    const ast = Linter.getAST(DOM.editor.value);
                    if (ast && !ast.error) { UI.switchView('altar'); DataAltar.manifest(ast); }
                    else UI.showToast(ast?.error || "AST error.", "error");
                    break;
                case "beautify":
                    if(Editor.currentHighlighter) Editor.currentHighlighter.setText(await beautify(Editor.getContent()));
                    break;
                case "toggle-awtsmoos-view":
                    if (activeTab) { activeTab.isHexView = !activeTab.isHexView; activeTab.forceReload = true; Tabs.activate(activeTab.id); }
                    break;
                case "view-html":
                    if (activeTab) Tabs.createPreview(activeTab.item, Editor.getContent());
                    break;
                case "toggle-altar-view":
                    if (activeTab) { activeTab.isAltarView = !activeTab.isAltarView; Tabs.activate(activeTab.id, true); }
                    break;
                case "git-init": if (item) GitManager.initializeRepository(item); break;
                case "commit-changes": App.commitAllChanges(); break;
                case "switch-branch": if (item) GitManager.switchBranch(item); break;
                case "git-actions":
                    if (item) {
                       const gitRoot = await GitMetaProvider.getGitInfoForFolder(item);
                       if (gitRoot) GitManager.showGitUI(item, gitRoot);
                       else UI.showToast("No Git repo found.", "warning");
                    }
                    break;
                case "delete-workspace":
                    if (item && await UI.showDialog({ title: "Remove Workspace", message: `Remove ${item.name}?` })) Workspaces.remove(item.id || item.workspaceId);
                    break;
                case "refresh": if (item?.kind === 'directory') Workspaces.refreshNode(item); break;
                case "select-all": if (activeTab) DOM.editor.select(); break;
                case "copy":
                    const sel = DOM.editor.value.substring(DOM.editor.selectionStart, DOM.editor.selectionEnd);
                    if (sel) { await navigator.clipboard.writeText(sel); UI.showToast("Copied."); }
                    break;
                case "copy-all":
                    if (activeTab) { await navigator.clipboard.writeText(DOM.editor.value); UI.showToast("All copied."); }
                    break;
                case "copy-all-contents": if (item) FileOperations.copyAllContents([item]); break;
                case "download-all-contents": if (item) FileOperations.downloadAllContents([item]); break;
                case "start-selection": SelectionManager.start(item); break;
                case "copy-single":
                    if (item) { State.fileClipboard = [getItemUniquePath(item)]; UI.showToast(`Copied ${item.name}`); }
                    break;
                case "copy-zip-single": if (item) FileOperations.copyAsZip([item]); break;
                case "download-zip-single": if (item) FileOperations.downloadAsZip([item]); break;
                case "download-file": if (item) FileOperations.downloadFile(item); break;
                case "paste": if (item?.kind === 'directory') FileOperations.paste(item); break;
                case "cancel-menu": break;
            }
        } catch (e) { UI.showToast(`Error: ${e.message}`, "error"); }
    }
};
