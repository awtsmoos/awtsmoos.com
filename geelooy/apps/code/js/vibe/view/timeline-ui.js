
// B"H
/**
 * @file timeline-ui.js
 * @brief Modular Timeline View (Refactored to JSON).
 */

import { VibeDB } from '../db.js';
import { UI } from '../../ui.js';
import { HTML } from '../../html-generator.js';
import { TimelineRenderer } from './timeline/renderer.js';
import { TimelineActions } from './timeline/actions.js';
import { TimelineVisualizer } from './timeline/visualizer.js';
import { ProjectHistorySync } from '../modules/ProjectHistorySync.js';

export const TimelineUI = {
    async render(container, tab, controller) {
        const records = await VibeDB.getTimelineRecords(tab.vibeSession.id);
        
        container.innerHTML = '';
        container.appendChild(HTML({
            style: { display: 'flex', flexDirection: 'column', height: '100%' },
            children:[
                {
                    style: { display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'15px', flexWrap:'wrap', gap:'10px' },
                    children:[
                        { tag: 'h4', style: { margin:0, color:'var(--neon-cyan)' }, text: 'Manifestation Timeline' },
                        {
                            style: { display:'flex', gap:'5px' },
                            children:[
                                { tag: 'button', id: 'tl-export-bundle', className: 'secondary-btn', title: 'Export Everything', style: { minHeight:0, padding:'4px 8px', fontSize:'0.7em' }, text: 'Export Bundle' },
                                { tag: 'button', id: 'tl-import-btn', className: 'secondary-btn', title: 'Import Bundle', style: { minHeight:0, padding:'4px 8px', fontSize:'0.7em' }, text: 'Import' },
                                { tag: 'button', id: 'tl-branch-btn', className: 'primary-btn', style: { minHeight:0, padding:'4px 8px', fontSize:'0.7em', borderColor:'var(--neon-lime)', color:'var(--neon-lime)' }, text: 'New Branch' }
                            ]
                        }
                    ]
                },
                {
                    id: 'tl-tree-vessel',
                    style: { height: '200px', background: 'rgba(0,0,0,0.4)', borderRadius: '8px', marginBottom: '15px', border: '1px solid var(--neon-cyan)', position:'relative' },
                    html: TimelineVisualizer.buildTreeSVG(records)
                },
                {
                    id: 'tl-list',
                    style: { display:'flex', flexDirection:'column', gap:'10px', paddingBottom: '50px' }
                },
                { tag: 'input', type: 'file', id: 'tl-file-input', style: { display:'none' }, accept: '.json' }
            ]
        }));
            
        const list = container.querySelector('#tl-list');
        if (records.length === 0) {
            list.appendChild(HTML({ tag: 'p', style: { opacity:0.5, fontSize:'0.9em', textAlign:'center' }, text: 'Empty Timestream.' }));
        }

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
    }
};
