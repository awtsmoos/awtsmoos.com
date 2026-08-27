
// B"H
import { Tabs } from '../../../tabs/index.js';

export const TimelineRenderer = {
    renderRecord(rec, tab, self) {
        const card = document.createElement('div');
        card.className = "vibe-manifest-card";
        card.style.padding = "12px"; 
        card.style.display = "flex"; 
        card.style.flexDirection = "column"; 
        card.style.gap = "8px";
        
        const fileCount = rec.changes ? rec.changes.length : 0;
        const sizeStr = self._formatBytes(rec.sizeBytes);
        const timeStr = new Date(rec.timestamp).toLocaleString();
        
        // B"H - Display the summary label if it exists
        const summaryLabel = rec.summary ? `<div style="font-size:0.8em; color:#bbb; margin-bottom:5px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;" title="${rec.summary}">Modified: ${rec.summary}</div>` : '';

        let filesHtml = `<div class="tl-files-list hidden" style="margin-top: 8px; border-top: 1px solid rgba(255,255,255,0.1); padding-top: 8px; display:flex; flex-direction:column; gap: 4px;">
            <div style="font-size:0.75em; color:var(--neon-magenta); text-align:center; margin-bottom:5px;">Preview past states safely without overwriting.</div>`;
        if (rec.changes) {
            rec.changes.forEach((c, idx) => {
                filesHtml += `<div style="display:flex; justify-content:space-between; align-items:center; font-size: 0.85em; background: rgba(0,0,0,0.2); padding: 4px 8px; border-radius: 4px;">
                    <span style="font-family: var(--font-code); color: var(--color-text-secondary);">${c.path.split('/').pop()}</span>
                    <button class="secondary-btn tl-preview-btn" data-index="${idx}" style="min-height:0; padding:2px 6px; font-size: 0.8em; color: #fff;" title="Open Read-Only Preview">Preview File</button>
                </div>`;
            });
        }
        filesHtml += `</div>`;

        card.innerHTML = `
            <div style="display:flex; justify-content:space-between; align-items:flex-start; border-bottom:1px solid rgba(255,255,255,0.1); padding-bottom:6px;">
                <div style="max-width: 85%;">
                    <div style="font-weight:bold; color:var(--neon-lime); font-size:0.9em; cursor:pointer; display:flex; align-items:center; gap:5px;" class="tl-toggle-files">
                        ${fileCount} Files Modified <span style="font-size:0.8em;">▼</span>
                    </div>
                    ${summaryLabel}
                    <div style="font-size:0.75em; color:var(--color-text-tertiary); font-family:var(--font-code);">${timeStr} | ${sizeStr}</div>
                </div>
                <button class="tl-delete icon-button" style="width:24px; height:24px; padding:2px; color:var(--color-accent-danger);" title="Delete Record"><svg class="svg-icon"><use href="#icon-trash"></use></svg></button>
            </div>
            <div style="display:flex; gap:8px;">
                <button class="tl-undo secondary-btn" style="flex:1; min-height:0; padding:6px; font-size:0.8em; border-color:var(--color-accent-danger); color:var(--color-accent-danger);" title="Overwrite current files with this past state">↶ Revert To Here</button>
                <button class="tl-redo secondary-btn" style="flex:1; min-height:0; padding:6px; font-size:0.8em; border-color:var(--neon-cyan); color:var(--neon-cyan);" title="Re-apply these specific changes">↷ Re-apply Changes</button>
            </div>` + filesHtml;

        this._bind(card, rec, tab, self);
        return card;
    },

    _bind(card, rec, tab, self) {
        card.querySelector('.tl-toggle-files').onclick = (e) => card.querySelector('.tl-files-list').classList.toggle('hidden');
        card.querySelectorAll('.tl-preview-btn').forEach(btn => btn.onclick = (e) => {
            const c = rec.changes[e.target.dataset.index];
            Tabs.create({ name: `[Preview] ${c.path.split('/').pop()}`, path: c.path, kind: 'file', type: 'temp', workspaceId: tab.item.workspaceId, content: c.newContent || '// Deleted in this state' }, false, false, true);
        });
        card.querySelector('.tl-undo').onclick = () => self.handleUndo(rec, tab);
        card.querySelector('.tl-redo').onclick = () => self.handleRedo(rec, tab);
        card.querySelector('.tl-delete').onclick = () => self.handleDelete(rec, tab);
    }
};
