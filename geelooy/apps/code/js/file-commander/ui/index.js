
// B"H
import { FCLayout } from './layout.js';
import { FCBreadcrumbs } from './breadcrumbs.js';
import { FCGridRender } from './render.js';

export const FileCommanderUI = {
    container: null, grid: null, breadcrumbs: null, sortBar: null,
    viewMode: 'details', sortMode: 'name', sortAsc: true, controller: null, 

    init(controller, container) {
        this.controller = controller;
        this.container = container;
        this.container.innerHTML = FCLayout.getHTML();

        this.grid = this.container.querySelector('#fc-content');
        this.breadcrumbs = this.container.querySelector('#fc-breadcrumbs');
        this.sortBar = this.container.querySelector('#fc-sort-bar');

        this.container.querySelector('#fc-up-btn').onclick = () => this.controller.goUp();
        this.container.querySelector('#fc-refresh-btn').onclick = () => this.controller.refresh();
        FCLayout.bindViewToggles(this.container, this);

        this.sortBar.querySelectorAll('div[data-sort]').forEach(el => {
            el.onclick = () => {
                if (this.sortMode === el.dataset.sort) this.sortAsc = !this.sortAsc;
                else { this.sortMode = el.dataset.sort; this.sortAsc = true; }
                this.render(this.controller.getData());
            };
        });
    },

    setView(mode) {
        this.viewMode = mode;
        this.grid.className = `fc-content ${mode}-view`;
        const gridBtn = this.container.querySelector('#fc-view-grid');
        const detailsBtn = this.container.querySelector('#fc-view-details');
        
        if (mode === 'grid') { gridBtn.classList.add('active'); detailsBtn.classList.remove('active'); this.sortBar.classList.add('hidden'); } 
        else { gridBtn.classList.remove('active'); detailsBtn.classList.add('active'); this.sortBar.classList.remove('hidden'); }
        this.render(this.controller.getData());
    },

    render({ currentFiles, currentPathItem }) {
        if (!this.grid) return;
        FCBreadcrumbs.render(this.breadcrumbs, currentPathItem, (item) => this.controller.navigate(item));
        
        if (!currentFiles || currentFiles.length === 0) {
             this.grid.innerHTML = `<div class="fc-empty-msg" style="padding:20px; text-align:center; color:var(--color-text-tertiary);">No items found.</div>`;
             this.container.querySelector('#fc-status-count').textContent = `0 items`;
             return;
        }

        currentFiles.sort((a, b) => {
            let valA, valB;
            if (this.sortMode === 'name') {
                if (a.kind !== b.kind) return a.kind === 'directory' ? -1 : 1;
                valA = (a.name || '').toLowerCase(); valB = (b.name || '').toLowerCase();
            } else if (this.sortMode === 'size') {
                valA = a.size || 0; valB = b.size || 0;
            } else if (this.sortMode === 'date') {
                valA = a.lastModified || 0; valB = b.lastModified || 0;
            }
            if (valA < valB) return this.sortAsc ? -1 : 1;
            if (valA > valB) return this.sortAsc ? 1 : -1;
            return 0;
        });

        FCGridRender.render(this.grid, currentFiles, currentPathItem, this.viewMode, (item) => this.controller.navigate(item));
        this.container.querySelector('#fc-status-count').textContent = `${currentFiles.length} items`;
    }
};
