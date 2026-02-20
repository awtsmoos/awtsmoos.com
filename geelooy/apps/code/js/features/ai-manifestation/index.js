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
        const workspace = State.workspaces.find(ws => ws.id === (folderItem.workspaceId || folderItem.id));
        const fullDisplayPath = `${workspace ? workspace.name : 'Unknown'} :: ${folderItem.path}`;

        const dialogId = 'ai-manifest-dialog';
        
        // We use a custom flow, so we handle buttons manually
        UI.showDialog({
            title: `External AI Manifestation`,
            contentHTML: ManifestationUI.getMainDialogHTML(fullDisplayPath),
            okText: "Review Changes", // Initial State
            cancelText: "Close"
        }).then(result => {
            if (result === 'execute') {
                // Execution handled by internal event listeners
            }
        });

        // Use a short timeout to ensure DOM is ready
        setTimeout(() => this._attachListeners(folderItem), 50);
    },

    _attachListeners(folderItem) {
        const container = document.querySelector('.ai-manifest-container');
        if (!container) return;

        const inputView = container.querySelector('#ai-view-input');
        const historyView = container.querySelector('#ai-view-history');
        const previewView = container.querySelector('#ai-view-preview');
        const okBtn = document.getElementById('dialog-ok-btn');
        const cancelBtn = document.getElementById('dialog-cancel-btn');

        // 1. Tab Switching
        container.querySelectorAll('.ai-tab').forEach(tab => {
            tab.onclick = () => {
                container.querySelectorAll('.ai-tab').forEach(t => t.classList.remove('active'));
                container.querySelectorAll('.ai-tab').forEach(t => t.style.borderBottom = 'none');
                container.querySelectorAll('.ai-tab').forEach(t => t.style.color = 'var(--color-text-secondary)');
                
                tab.classList.add('active');
                tab.style.borderBottom = '2px solid var(--neon-cyan)';
                tab.style.color = 'var(--neon-cyan)';

                if (tab.dataset.view === 'input') {
                    inputView.style.display = 'block';
                    historyView.style.display = 'none';
                    previewView.style.display = 'none';
                    okBtn.style.display = 'inline-block';
                    okBtn.textContent = 'Review Changes';
                } else {
                    inputView.style.display = 'none';
                    historyView.style.display = 'block';
                    previewView.style.display = 'none';
                    okBtn.style.display = 'none';
                    this._renderHistory();
                }
            };
        });

        // 2. Button Actions
        const copyBtn = document.getElementById('copy-prompt-btn');
        const promptArea = document.getElementById('ai-system-prompt');
        if (copyBtn) copyBtn.onclick = () => {
            navigator.clipboard.writeText(promptArea.value);
            copyBtn.textContent = "✓";
            setTimeout(() => copyBtn.textContent = "Copy", 1500);
        };

        document.getElementById('download-context-btn').onclick = () => {
            FileOperations.downloadAllContents([folderItem]);
        };

        document.getElementById('ai-clear-history').onclick = () => {
            HistoryManager.clear();
            this._renderHistory();
        };

        // 3. Review / Execute Logic
        let parsedChanges = [];

        okBtn.onclick = async (e) => {
            e.stopPropagation(); // Prevent dialog auto-close logic from UI.js defaults

            // State A: "Review Changes" -> Go to Preview
            if (okBtn.textContent === 'Review Changes') {
                const xmlText = document.getElementById('ai-xml-response').value;
                if (!xmlText.trim()) return UI.showToast("Paste the XML first.", "warning");

                parsedChanges = ResponseParser.parseChanges(xmlText, folderItem.path);
                
                if (parsedChanges.length === 0) {
                    return UI.showToast("No valid <change> tags found.", "error");
                }

                // Render Preview
                inputView.style.display = 'none';
                previewView.style.display = 'block';
                
                const list = document.getElementById('ai-change-list');
                list.innerHTML = parsedChanges.map(c => ManifestationUI.getChangeItemHTML(c)).join('');
                
                document.getElementById('ai-preview-summary').textContent = `Ready to apply ${parsedChanges.length} changes to '${folderItem.name}'.`;
                
                okBtn.textContent = 'Manifest';
                okBtn.classList.add('pulse'); // Add visual cue
            } 
            // State B: "Manifest" -> Execute
            else if (okBtn.textContent === 'Manifest') {
                document.getElementById('generic-dialog').classList.remove('visible'); // Close Dialog
                await this._execute(folderItem, parsedChanges);
            }
        };
    },

    _renderHistory() {
        const list = document.getElementById('ai-history-list');
        const history = HistoryManager.getHistory();
        if (history.length === 0) {
            list.innerHTML = '<div style="text-align:center; color:gray; padding:20px;">No history in this session.</div>';
        } else {
            list.innerHTML = history.map(entry => ManifestationUI.getHistoryItemHTML(entry)).join('');
        }
    },

    async _execute(folderItem, changes) {
        const taskId = `ai-exec-${Date.now()}`;
        UI.startTask(taskId, "Manifesting...");

        try {
            const workspaceId = folderItem.workspaceId || folderItem.id;
            const workspace = State.workspaces.find(ws => ws.id === workspaceId);
            const affectedParents = new Set();

            for (let i = 0; i < changes.length; i++) {
                const change = changes[i];
                UI.updateTask(taskId, 30 + ((i / changes.length) * 60), `${change.operation}: ${change.path.split('/').pop()}`);

                const item = { ...workspace, path: change.path, kind: 'file', workspaceId };

                if (change.operation === 'delete') {
                    await FileSystemProvider.delete(item);
                    const tab = State.tabs.find(t => t.uniquePath === `${workspaceId}::${change.path}`);
                    if (tab) await Tabs.close(tab.id, true);
                } else {
                    await FileSystemProvider.write(item, change.content);
                    const tab = State.tabs.find(t => t.uniquePath === `${workspaceId}::${change.path}`);
                    if (tab) {
                        tab.content = change.content;
                        tab.isDirty = false;
                        if (State.activeTabId === tab.id) {
                            import('../../editor.js').then(m => m.Editor.setCurrentContent(change.content));
                        }
                    }
                }

                // Parent refresh logic
                const lastSlash = change.path.lastIndexOf('/');
                const parentPath = lastSlash === -1 ? '/' : (change.path.substring(0, lastSlash) || '/');
                affectedParents.add(parentPath);
            }

            // Save to History
            HistoryManager.addBatch(folderItem.path, changes);

            // Refresh Workspace
            for (const parentPath of affectedParents) {
                await Workspaces.refreshNode({ ...workspace, path: parentPath, kind: 'directory', workspaceId });
            }

            UI.endTask(taskId, 'success', `Manifested ${changes.length} changes.`);

        } catch (e) {
            console.error(e);
            UI.endTask(taskId, 'error', `Manifestation halted: ${e.message}`);
        }
    }
};