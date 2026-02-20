// B"H
// FILE: js/features/ai-manifestation/index.js

import { UI } from '../../ui.js';
import { State } from '../../state.js';
import { FileSystemProvider } from '../../fs-provider.js';
import { Workspaces } from '../../workspaces.js';
import { ResponseParser } from '../../vibe/modules/ResponseParser.js';
import { Tabs } from '../../tabs/index.js';
import { FileOperations } from '../../file-operations.js';
import { ManifestationUI } from './ui.js';
import { HistoryManager } from './history.js';

export const AIManifestation = {
    async showDialog(folderItem) {
        console.log("[AIManifestation] showDialog for:", folderItem.path);
        const folderName = folderItem.path.split('/').filter(Boolean).pop() || folderItem.name;

        UI.showDialog({
            title: `External AI Manifestation`,
            contentHTML: ManifestationUI.getMainDialogHTML(folderName),
            okText: "Review Changes", 
            cancelText: "Close"
        });

        setTimeout(() => this._attachListeners(folderItem), 150);
    },

    _attachListeners(folderItem) {
        console.log("[AIManifestation] Attaching UI listeners...");
        const container = document.querySelector('.ai-manifest-container');
        if (!container) {
            console.error("[AIManifestation] Could not find UI container!");
            return;
        }

        const okBtn = document.getElementById('dialog-ok-btn');
        const downloadBtn = document.getElementById('download-context-btn');
        const copyBtn = document.getElementById('copy-prompt-btn');

        // Tab Switching
        container.querySelectorAll('.ai-tab').forEach(tab => {
            tab.onclick = () => {
                container.querySelectorAll('.ai-tab').forEach(t => t.classList.remove('active'));
                container.querySelectorAll('.ai-tab').forEach(t => t.style.borderBottom = 'none');
                tab.classList.add('active');
                tab.style.borderBottom = '2px solid var(--neon-cyan)';

                const isInput = tab.dataset.view === 'input';
                container.querySelector('#ai-view-input').style.display = isInput ? 'block' : 'none';
                container.querySelector('#ai-view-history').style.display = isInput ? 'none' : 'block';
                container.querySelector('#ai-view-preview').style.display = 'none';
                
                okBtn.style.display = isInput ? 'inline-block' : 'none';
                okBtn.textContent = 'Review Changes';
                if (!isInput) this._renderHistory();
            };
        });

        if (downloadBtn) {
            downloadBtn.onclick = () => {
                console.log("[AIManifestation] Downloading context for:", folderItem.path);
                FileOperations.downloadAllContents([folderItem]);
            };
        }

        if (copyBtn) {
            copyBtn.onclick = () => {
                const prompt = document.getElementById('ai-system-prompt').value;
                navigator.clipboard.writeText(prompt).then(() => {
                    copyBtn.textContent = "✓";
                    setTimeout(() => copyBtn.textContent = "Copy", 1500);
                });
            };
        }

        let parsedChanges = [];
        okBtn.onclick = async (e) => {
            e.stopPropagation();

            if (okBtn.textContent === 'Review Changes') {
                const xmlText = document.getElementById('ai-xml-response').value;
                console.log("[AIManifestation] User pasted XML. Length:", xmlText.length);
                
                if (!xmlText.trim()) return UI.showToast("Paste the XML response.", "warning");

                parsedChanges = ResponseParser.parseChanges(xmlText, folderItem.path);
                
                if (parsedChanges.length === 0) {
                    console.error("[AIManifestation] Parsing failed or no changes found.");
                    return UI.showToast("No valid <change> blocks found. Check console.", "error");
                }

                container.querySelector('#ai-view-input').style.display = 'none';
                container.querySelector('#ai-view-preview').style.display = 'block';
                document.getElementById('ai-change-list').innerHTML = parsedChanges.map(c => ManifestationUI.getChangeItemHTML(c, folderItem.path)).join('');
                document.getElementById('ai-preview-summary').textContent = `Parsed ${parsedChanges.length} changes correctly.`;
                
                okBtn.textContent = 'Manifest';
                okBtn.classList.add('pulse');
            } 
            else if (okBtn.textContent === 'Manifest') {
                console.log("[AIManifestation] Beginning execution of parsed changes...");
                document.getElementById('generic-dialog').classList.remove('visible');
                await this._execute(folderItem, parsedChanges);
            }
        };
    },

    async _execute(folderItem, changes) {
        const taskId = `ai-exec-${Date.now()}`;
        UI.startTask(taskId, "Manifesting...");

        try {
            const workspaceId = folderItem.workspaceId || folderItem.id;
            const workspace = State.workspaces.find(ws => ws.id === workspaceId);
            if (!workspace) throw new Error("Workspace context lost.");

            const affectedParents = new Set();

            for (let i = 0; i < changes.length; i++) {
                const change = changes[i];
                console.log(`[AIManifestation] Executing ${i+1}/${changes.length}:`, change.path);
                UI.updateTask(taskId, (i / changes.length) * 100, `Writing: ${change.path.split('/').pop()}`);

                const item = { ...workspace, path: change.path, kind: 'file', workspaceId, type: workspace.type };

                if (change.operation === 'delete') {
                    console.log("[AIManifestation] Deleting file:", item.path);
                    await FileSystemProvider.delete(item);
                    const tab = State.tabs.find(t => t.uniquePath === `${workspaceId}::${change.path}`);
                    if (tab) await Tabs.close(tab.id, true);
                } else {
                    console.log("[AIManifestation] Writing file content:", item.path);
                    await FileSystemProvider.write(item, change.content);
                    
                    const tab = State.tabs.find(t => t.uniquePath === `${workspaceId}::${change.path}`);
                    if (tab) {
                        tab.content = change.content;
                        tab.isDirty = false;
                        if (State.activeTabId === tab.id) {
                            const { Editor } = await import('../../editor.js');
                            Editor.setCurrentContent(change.content);
                        }
                    }
                }
                const lastSlash = change.path.lastIndexOf('/');
                affectedParents.add(lastSlash === -1 ? '/' : (change.path.substring(0, lastSlash) || '/'));
            }

            console.log("[AIManifestation] Saving history and refreshing folders:", Array.from(affectedParents));
            HistoryManager.addBatch(folderItem.path, changes);
            for (const parentPath of affectedParents) {
                await Workspaces.refreshNode({ ...workspace, path: parentPath, kind: 'directory', workspaceId });
            }

            UI.endTask(taskId, 'success', `Manifested ${changes.length} updates.`);
            UI.showToast(`B"H: Manifestation successful.`, "success");

        } catch (e) {
            console.error("[AIManifestation] FATAL EXECUTION ERROR:", e);
            UI.endTask(taskId, 'error', `Manifestation halted: ${e.message}`);
        }
    },

    _renderHistory() {
        const list = document.getElementById('ai-history-list');
        const history = HistoryManager.getHistory();
        if (history.length === 0) {
            list.innerHTML = '<div style="text-align:center; color:white; padding:20px; opacity:0.6;">No history.</div>';
        } else {
            list.innerHTML = history.map(entry => ManifestationUI.getHistoryItemHTML(entry)).join('');
        }
    }
};