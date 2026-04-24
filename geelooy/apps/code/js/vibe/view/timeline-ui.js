
// B"H
/**
 * @file timeline-ui.js
 * @brief Modular Timeline View with Organic Tree and Full Portability.
 */

import { VibeDB } from '../db.js';
import { UI } from '../../ui.js';
import { TimelineRenderer } from './timeline/renderer.js';
import { TimelineActions } from './timeline/actions.js';
import { TimelineVisualizer } from './timeline/visualizer.js';
import { ProjectHistorySync } from '../modules/ProjectHistorySync.js';

export const TimelineUI = {
    async render(container, tab, controller) {
        const records = await VibeDB.getTimelineRecords(tab.vibeSession.id);
        
        container.innerHTML = `
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:15px; flex-wrap:wrap; gap:10px;">
                <h4 style="margin:0; color:var(--neon-cyan);">Manifestation Timeline</h4>
                <div style="display:flex; gap:5px;">
                    <button id="tl-export-bundle" class="secondary-btn" title="Export Everything" style="min-height:0; padding:4px 8px; font-size:0.7em;">Export Bundle</button>
                    <button id="tl-import-btn" class="secondary-btn" title="Import Bundle" style="min-height:0; padding:4px 8px; font-size:0.7em;">Import</button>
                    <button id="tl-branch-btn" class="primary-btn" style="min-height:0; padding:4px 8px; font-size:0.7em; border-color:var(--neon-lime); color:var(--neon-lime);">New Branch</button>
                </div>
            </div>
            
            <div id="tl-tree-vessel" style="height: 200px; background: rgba(0,0,0,0.4); border-radius: 8px; margin-bottom: 15px; border: 1px solid var(--neon-cyan); position:relative;">
                ${TimelineVisualizer.buildTreeSVG(records)}
            </div>

            <div id="tl-list" style="display:flex; flex-direction:column; gap:10px; padding-bottom: 50px;"></div>
            <input type="file" id="tl-file-input" style="display:none;" accept=".json">`;
            
        const list = container.querySelector('#tl-list');
        if (records.length === 0) list.innerHTML = '<p style="opacity:0.5; font-size:0.9em; text-align:center;">Empty Timestream.</p>';

        records.reverse().forEach(rec => {
            list.appendChild(TimelineRenderer.renderRecord(rec, tab, this));
        });

        this._bindGlobal(container, tab);
    },

    async handleUndo(rec, tab) { await TimelineActions.handleUndo(rec, tab, (r, d) => this._apply(r, d, tab)); },
    async handleRedo(rec, tab) { await TimelineActions.handleRedo(rec, tab, (r, d) => this._apply(r, d, tab)); },
    async handleDelete(rec, tab) { await TimelineActions.handleDelete(rec, tab, () => this.render(document.getElementById('vibe-timeline-container'), tab, null)); },

    async _apply(record, direction, tab) {
        const { LoopEngine } = await import('../modules/LoopEngine.js');
        const simulated = record.changes.map(c => ({
            path: c.path,
            operation: (direction === 'undo' ? (c.oldContent === null ? 'delete' : 'write') : (c.newContent === null ? 'delete' : 'write')),
            content: (direction === 'undo' ? (c.oldContent || '') : (c.newContent || ''))
        }));
        await LoopEngine.apply(simulated, tab.item.workspaceId, record.sessionId, true);
    },

    _bindGlobal(container, tab) {
        container.querySelector('#tl-export-bundle').onclick = () => ProjectHistorySync.exportFullBundle(tab);
        
        const fInput = container.querySelector('#tl-file-input');
        container.querySelector('#tl-import-btn').onclick = () => fInput.click();
        fInput.onchange = async (e) => {
            if (await ProjectHistorySync.importBundle(tab, e.target.files[0])) this.render(container, tab, null);
        };

        container.querySelector('#tl-branch-btn').onclick = async () => {
            const name = await UI.showDialog({ title: "Branch Reality", hasInput: true, placeholder: "e.g., test-feature" });
            if (name) {
                const { BranchManager } = await import('../../workspaces/branching.js');
                await BranchManager.switchBranch(tab.item.workspaceId, name);
            }
        };

        container.querySelectorAll('.tl-node-btn').forEach(node => {
            node.onclick = (e) => {
                const id = e.target.dataset.id;
                const el = container.querySelector(`.vibe-manifest-card div[data-id="${id}"]`)?.closest('.vibe-manifest-card');
                if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
            };
        });
    },

    _formatBytes(bytes) {
        if (!bytes) return '0 B';
        const i = Math.floor(Math.log(bytes) / Math.log(1024));
        return parseFloat((bytes / Math.pow(1024, i)).toFixed(1)) + ' ' + ['B', 'KB', 'MB', 'GB'][i];
    }
};
