// B"H
// FILE: js/actions.js

import { State, DOM } from './state.js';
import { UI } from './ui.js';
import { App } from './app.js';
import { Tabs } from './tabs.js';
import { Workspaces, getItemUniquePath } from './workspaces.js';
import { FindReplace } from './find-replace.js';
import { Clipboard } from './clipboard.js';
import { FileSystemProvider } from './fs-provider.js';
import { Editor } from './editor.js';
import { FileOperations } from './file-operations.js';
import { SelectionManager } from './selection-manager.js';
import { GitManager } from './git-manager.js';
import { beautify } from "/scripts/awtsmoos/MerkavaBeautifier/beautifier.js";

export const Actions = {
    async handle(action, item = State.contextTarget) {
        const activeTab = State.tabs.find(t => t.id === State.activeTabId);

        try {
            switch (action) {
                // --- Git & Workspace ---
                case "git-init":
                    if (item) GitManager.initializeRepository(item);
                    break;
                case "commit-changes":
                    App.commitAllChanges();
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

                // --- File Creation & IO ---
                case "new-temp-file":
                    Tabs.createTemporary();
                    break;
                case "open-file":
                    App.openLocalFile();
                    break;
                case "save":
                    Tabs.saveActive();
                    break;
                case "download":
                    Tabs.downloadActive();
                    break;
                case "new-file":
                case "new-folder":
                    if (item) {
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
                case "find-replace":
                    FindReplace.show();
                    break;
                case "toggle-keyboard-helper":
                    DOM.keyboardHelper.classList.toggle("is-visible");
                    break;
                case "toggle-fullscreen":
                    App.toggleFullscreen();
                    break;
                case "settings":
                    App.showSettings();
                    break;

                // --- Clipboard & Selection ---
                case "select-all":
                    if (activeTab) DOM.editor.select();
                    break;
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
                case "copy-all-contents":
                    if (item) FileOperations.copyAllContents([item]);
                    break;
                case "start-selection":
                    SelectionManager.start(item, State.contextEvent);
                    break;
                case "copy-single":
                    if (item) {
                        State.fileClipboard = [getItemUniquePath(item)];
                        UI.showToast(`Copied "${item.name}" to clipboard.`, "success");
                    }
                    break;
                
                // B"H 
                //Zip/Download handlers
                case "copy-zip-single":
                    if (item) FileOperations.copyAsZip([item]);
                    break;
                case "download-zip-single":
                    if (item) FileOperations.downloadAsZip([item]);
                    break;
                case "download-file":
                    if (item) FileOperations.downloadFile(item);
                    break;

                case "paste":
                    if (item && item.kind === "directory") FileOperations.paste(item);
                    else UI.showToast("Paste target must be a directory.", "warning");
                    break;

                // --- Destructive ---
                case "delete":
                    if (item) {
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
                    
                case "cancel-menu":
                    break;
            }
        } catch (e) {
            UI.showToast(`Error: ${e.message}`, "error");
            console.error("Action failed:", action, e);
        } finally {
            UI.hideLoading();
        }
    }
};