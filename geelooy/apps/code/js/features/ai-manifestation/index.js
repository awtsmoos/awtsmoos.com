
// B"H
import { UI } from '../../ui.js';
import { State } from '../../state.js';
import { FileSystemProvider } from '../../fs-provider.js';
import { Workspaces } from '../../workspaces/index.js';
import { ResponseParser } from '../../vibe/modules/ResponseParser.js';
import { FileOperations } from '../../file-operations.js';
import { ManifestationUI } from './ui.js';
import { HistoryManager } from './history.js';

export const AIManifestation = {
    async showDialog(folderItem) {
        UI.showDialog({
            title: `AI Manifestation`,
            contentHTML: ManifestationUI.getMainDialogHTML(folderItem.name),
            okText: "Review Changes", 
            cancelText: "Close"
        });
        setTimeout(() => this._attachListeners(folderItem), 150);
    },

    _attachListeners(folderItem) {
        const container = document.querySelector('.ai-manifest-container');
        const okBtn = document.getElementById('dialog-ok-btn');
        const changeList = document.getElementById('ai-change-list');
        const summary = document.getElementById('ai-preview-summary');
        let parsedChanges = [];

        const renderPreview = () => {
            const active = parsedChanges.filter(c => c.isEnabled !== false);
            if (summary) summary.textContent = `${active.length} / ${parsedChanges.length} Enabled`;
            
            changeList.innerHTML = parsedChanges.map((c, i) => 
                ManifestationUI.getChangeItemHTML(c, i, folderItem.path)
            ).join('');

            changeList.querySelectorAll('.ai-change-toggle').forEach(chk => {
                chk.onchange = (e) => {
                    parsedChanges[parseInt(chk.dataset.index)].isEnabled = chk.checked;
                    renderPreview();
                };
            });
        };

        okBtn.onclick = async (e) => {
            if (okBtn.textContent === 'Review Changes') {
                const xml = document.getElementById('ai-xml-response').value;
                const raw = ResponseParser.parseChanges(xml, folderItem.path);
                if (raw.length === 0) return UI.showToast("No changes found.", "error");

                parsedChanges = raw.map(c => ({ ...c, isEnabled: true }));
                container.querySelector('#ai-view-input').style.display = 'none';
                container.querySelector('#ai-view-preview').style.display = 'flex';
                renderPreview();
                okBtn.textContent = 'Manifest';
            } else if (okBtn.textContent === 'Manifest') {
                const toApply = parsedChanges.filter(c => c.isEnabled !== false);
                document.getElementById('generic-dialog').classList.remove('visible');
                await this._execute(folderItem, toApply);
            }
        };

        // Tab switches
        container.querySelectorAll('.ai-tab').forEach(tab => {
            tab.onclick = () => {
                container.querySelectorAll('.ai-tab').forEach(t => t.classList.remove('active'));
                tab.classList.add('active');
                const isInput = tab.dataset.view === 'input';
                container.querySelector('#ai-view-input').style.display = isInput ? 'flex' : 'none';
                container.querySelector('#ai-view-preview').style.display = 'none';
                container.querySelector('#ai-view-history').style.display = isInput ? 'none' : 'block';
                okBtn.style.display = isInput ? 'inline-block' : 'none';
            };
        });
    },

    async _execute(folderItem, changes) {
        const taskId = `ai-exec-${Date.now()}`;
        UI.startTask(taskId, "Manifesting...");
        try {
            const wsId = folderItem.workspaceId || folderItem.id;
            const ws = State.workspaces.find(ws => ws.id === wsId);
            const parents = new Set();
            for (let i = 0; i < changes.length; i++) {
                const c = changes[i];
                UI.updateTask(taskId, (i / changes.length) * 100, `Writing: ${c.path.split('/').pop()}`);
                const item = { ...ws, path: c.path, kind: 'file', workspaceId: wsId, type: ws.originalType || ws.type };
                if (c.operation === 'delete') await FileSystemProvider.delete(item);
                else await FileSystemProvider.write(item, c.content);
                const lastSlash = c.path.lastIndexOf('/');
                parents.add(lastSlash === -1 ? '/' : (c.path.substring(0, lastSlash) || '/'));
            }
            HistoryManager.addBatch(folderItem.path, changes);
            for (const p of parents) await Workspaces.refreshNode({ ...ws, path: p, kind: 'directory', workspaceId: wsId });
            UI.endTask(taskId, 'success', `Manifested ${changes.length} items.`);
        } catch (e) { UI.endTask(taskId, 'error', e.message); }
    }
};
