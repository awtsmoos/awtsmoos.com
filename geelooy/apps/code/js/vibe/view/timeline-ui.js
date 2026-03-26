
// B"H
// FILE: js/vibe/view/timeline-ui.js
import { VibeDB } from '../db.js';
import { UI } from '../../ui.js';
import { Tabs } from '../../tabs/index.js';

export const TimelineUI = {
    async render(container, tab, controller) {
        var records = await VibeDB.getTimelineRecords(tab.vibeSession.id);
        
        container.innerHTML = '<div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:15px;">' +
                '<h4 style="margin:0; color:var(--neon-cyan);">Manifestation Timeline</h4>' +
                '<div style="display:flex; gap:8px;">' +
                    '<button id="tl-import-btn" class="secondary-btn" style="min-height:0; padding:4px 10px; font-size:0.75em;">Import</button>' +
                    '<button id="tl-clear-btn" class="secondary-btn danger" style="min-height:0; padding:4px 10px; font-size:0.75em;">Purge All</button>' +
                '</div>' +
            '</div>' +
            '<div id="tl-list" style="display:flex; flex-direction:column; gap:10px;">' +
                (records.length === 0 ? '<p style="opacity:0.5; font-size:0.9em;">No manifestations recorded.</p>' : '') +
            '</div>' +
            '<input type="file" id="tl-file-input" accept=".json" style="display:none;">';
            
        var list = container.querySelector('#tl-list');
        var self = this;

        records.reverse().forEach(function(rec) {
            var card = document.createElement('div');
            card.className = "vibe-manifest-card";
            card.style.padding = "12px";
            card.style.display = "flex";
            card.style.flexDirection = "column";
            card.style.gap = "8px";
            
            const fileCount = rec.changes ? rec.changes.length : 0;
            const sizeStr = self._formatBytes(rec.sizeBytes);
            const timeStr = new Date(rec.timestamp).toLocaleString();

            // Setup preview logic
            let filesHtml = `<div class="tl-files-list hidden" style="margin-top: 8px; border-top: 1px solid rgba(255,255,255,0.1); padding-top: 8px; display:flex; flex-direction:column; gap: 4px;">`;
            if (rec.changes) {
                rec.changes.forEach((c, idx) => {
                    const pureName = c.path.split('/').pop();
                    filesHtml += `
                    <div style="display:flex; justify-content:space-between; align-items:center; font-size: 0.85em; background: rgba(0,0,0,0.2); padding: 4px 8px; border-radius: 4px;">
                        <span style="font-family: var(--font-code); color: var(--color-text-secondary);">${pureName}</span>
                        <button class="secondary-btn tl-preview-btn" data-index="${idx}" style="min-height:0; padding:2px 6px; font-size: 0.8em; border-color: var(--color-border); color: #fff;">Preview New</button>
                    </div>`;
                });
            }
            filesHtml += `</div>`;

            card.innerHTML = '<div style="display:flex; justify-content:space-between; align-items:flex-start; border-bottom:1px solid rgba(255,255,255,0.1); padding-bottom:6px;">' +
                    '<div>' +
                        '<div style="font-weight:bold; color:var(--neon-lime); font-size:0.9em; cursor:pointer;" class="tl-toggle-files">' + fileCount + ' Files Modified ▼</div>' +
                        '<div style="font-size:0.75em; color:var(--color-text-tertiary); font-family:var(--font-code);">' + timeStr + ' | ' + sizeStr + '</div>' +
                    '</div>' +
                    '<div style="display:flex; gap:5px;">' +
                        '<button class="tl-export icon-button" title="Export Snapshot" style="width:24px; height:24px; padding:2px;"><svg class="svg-icon"><use href="#icon-download"></use></svg></button>' +
                        '<button class="tl-delete icon-button" title="Delete Snapshot" style="width:24px; height:24px; padding:2px; color:var(--color-accent-danger);"><svg class="svg-icon"><use href="#icon-trash"></use></svg></button>' +
                    '</div>' +
                '</div>' +
                '<div style="display:flex; gap:8px;">' +
                    '<button class="tl-undo secondary-btn" style="flex:1; min-height:0; padding:6px; font-size:0.8em; border-color:var(--color-accent-danger); color:var(--color-accent-danger);">↶ Undo All</button>' +
                    '<button class="tl-redo secondary-btn" style="flex:1; min-height:0; padding:6px; font-size:0.8em; border-color:var(--neon-cyan); color:var(--neon-cyan);">↷ Redo All</button>' +
                '</div>' + filesHtml;
            
            card.querySelector('.tl-toggle-files').onclick = function(e) {
                const flist = card.querySelector('.tl-files-list');
                if (flist) flist.classList.toggle('hidden');
                e.target.textContent = flist.classList.contains('hidden') ? fileCount + ' Files Modified ▶' : fileCount + ' Files Modified ▼';
            };

            card.querySelectorAll('.tl-preview-btn').forEach(btn => {
                btn.onclick = function(e) {
                    const idx = e.target.dataset.index;
                    const change = rec.changes[idx];
                    
                    const tempItem = {
                        name: `[TimeTravel] ${change.path.split('/').pop()}`,
                        path: change.path,
                        kind: 'file',
                        type: 'temp',
                        workspaceId: tab.item.workspaceId,
                        content: change.newContent || `// File was deleted in this snapshot.`
                    };
                    
                    Tabs.create(tempItem, false, false, true);
                };
            });

            card.querySelector('.tl-undo').onclick = async function() {
                if (await UI.showDialog({ title: "Undo", message: "Revert " + fileCount + " files?", okText: "Undo" })) {
                    await self._applyDirectional(rec, 'undo', tab.item.workspaceId);
                    UI.showToast("B\"H: Manifestation Undone.", "success");
                }
            };

            card.querySelector('.tl-redo').onclick = async function() {
                if (await UI.showDialog({ title: "Redo", message: "Re-apply these changes?", okText: "Redo" })) {
                    await self._applyDirectional(rec, 'redo', tab.item.workspaceId);
                    UI.showToast("B\"H: Manifestation Re-applied.", "success");
                }
            };
            
            card.querySelector('.tl-delete').onclick = async function() {
                if (await UI.showDialog({ title: "Delete Snapshot", message: "Permanently delete this timeline record?", okText: "Delete" })) {
                    await VibeDB.deleteTimelineRecord(rec.id);
                    self.render(container, tab, controller);
                }
            };

            card.querySelector('.tl-export').onclick = function() {
                const blob = new Blob([JSON.stringify(rec, null, 2)], { type: 'application/json' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url; a.download = "vibe-snapshot-" + rec.id + ".json";
                a.click(); URL.revokeObjectURL(url);
            };
            
            list.appendChild(card);
        });

        const importBtn = container.querySelector('#tl-import-btn');
        const fileInput = container.querySelector('#tl-file-input');
        if (importBtn && fileInput) {
            importBtn.onclick = function() { fileInput.click(); };
            fileInput.onchange = async function(e) {
                const file = e.target.files[0];
                if (!file) return;
                try {
                    const record = JSON.parse(await file.text());
                    record.sessionId = tab.vibeSession.id; 
                    record.id = Date.now().toString(); 
                    await VibeDB.saveTimelineRecord(record);
                    UI.showToast("B\"H: Imported.", "success");
                    self.render(container, tab, controller);
                } catch(err) { UI.showToast("Import failed.", "error"); }
                fileInput.value = '';
            };
        }

        const clearBtn = container.querySelector('#tl-clear-btn');
        if (clearBtn) {
            clearBtn.onclick = async function() {
                if (await UI.showDialog({ title: "Purge", message: "Delete ALL manifestation history?", okText: "Purge" })) {
                    for (const rec of records) await VibeDB.deleteTimelineRecord(rec.id);
                    self.render(container, tab, controller);
                }
            };
        }
    },

    async _applyDirectional(record, direction, workspaceId) {
        if (!record.changes) return;
        const { LoopEngine } = await import('../modules/LoopEngine.js');
        
        const simulatedChanges = record.changes.map(function(c) {
            return {
                path: c.path,
                operation: (direction === 'undo' ? (c.oldContent === null ? 'delete' : 'write') : (c.newContent === null ? 'delete' : 'write')),
                content: (direction === 'undo' ? (c.oldContent || '') : (c.newContent || ''))
            };
        });
        
        await LoopEngine.apply(simulatedChanges, workspaceId, record.sessionId, true);
    },

    _formatBytes(bytes) {
        if (!bytes) return '0 B';
        const k = 1024, sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }
};
