
// B"H
// FILE: js/file-commander/ui.js

import { State, DOM } from '../state.js';
import { Menus } from '../menus.js';
import { Tabs } from '../tabs/index.js';
import { SelectionManager } from '../selection-manager.js';
import { getItemUniquePath } from '../workspaces.js';

export const FileCommanderUI = {
    container: null,
    grid: null,
    breadcrumbs: null,
    sortBar: null,
    viewMode: 'details',
    sortMode: 'name',
    sortAsc: true,
    controller: null, 

    init(controller, container) {
        this.controller = controller;
        this.container = container;
        this.renderStructure();
    },

    renderStructure() {
        this.container.innerHTML = `
            <div class="fc-window" style="border:none; box-shadow:none;">
                <div class="fc-toolbar">
                    <button id="fc-up-btn" class="icon-button" title="Go Up"><svg class="svg-icon"><use href="#icon-arrow-left"></use></svg></button>
                    <div id="fc-breadcrumbs" class="fc-breadcrumbs"></div>
                    <div class="fc-view-options">
                        <button id="fc-refresh-btn" class="icon-button" title="Refresh"><svg class="svg-icon"><use href="#icon-refresh"></use></svg></button>
                        <button id="fc-view-grid" class="icon-button" title="Grid View"><svg class="svg-icon"><use href="#icon-brain"></use></svg></button>
                        <button id="fc-view-details" class="icon-button active" title="Details View"><svg class="svg-icon"><use href="#icon-list"></use></svg></button>
                    </div>
                </div>
                <div class="fc-sort-bar" id="fc-sort-bar">
                    <div class="fc-col-name" data-sort="name">Name</div>
                    <div class="fc-col-size" data-sort="size">Size</div>
                    <div class="fc-col-date" data-sort="date">Date</div>
                </div>
                <div id="fc-content" class="fc-content details-view"></div>
                <div class="fc-statusbar">
                    <span id="fc-status-count">0 items</span>
                </div>
            </div>
        `;

        this.grid = this.container.querySelector('#fc-content');
        this.breadcrumbs = this.container.querySelector('#fc-breadcrumbs');
        this.sortBar = this.container.querySelector('#fc-sort-bar');

        this._bindEvents();
    },

    _bindEvents() {
        this.container.querySelector('#fc-up-btn').onclick = () => this.controller.goUp();
        this.container.querySelector('#fc-refresh-btn').onclick = () => this.controller.refresh();
        
        this.container.querySelector('#fc-view-grid').onclick = () => this.setView('grid');
        this.container.querySelector('#fc-view-details').onclick = () => this.setView('details');

        this.sortBar.querySelectorAll('div[data-sort]').forEach(el => {
            el.onclick = () => {
                if (this.sortMode === el.dataset.sort) {
                    this.sortAsc = !this.sortAsc;
                } else {
                    this.sortMode = el.dataset.sort;
                    this.sortAsc = true;
                }
                this.render(this.controller.getData());
            };
        });
    },

    setView(mode) {
        this.viewMode = mode;
        this.grid.className = `fc-content ${mode}-view`;
        
        const gridBtn = this.container.querySelector('#fc-view-grid');
        const detailsBtn = this.container.querySelector('#fc-view-details');
        
        if (mode === 'grid') {
            gridBtn.classList.add('active');
            detailsBtn.classList.remove('active');
            this.sortBar.classList.add('hidden');
        } else {
            gridBtn.classList.remove('active');
            detailsBtn.classList.add('active');
            this.sortBar.classList.remove('hidden');
        }
        this.render(this.controller.getData());
    },

    render({ currentFiles, currentPathItem }) {
        if (!this.grid) return;
        this.grid.innerHTML = '';
        this._updateBreadcrumbs(currentPathItem);
        
        if (!currentFiles || currentFiles.length === 0) {
             this.grid.innerHTML = `<div class="fc-empty-msg" style="padding:20px; text-align:center; color:var(--color-text-tertiary);">No items found.</div>`;
             this.container.querySelector('#fc-status-count').textContent = `0 items`;
             return;
        }

        // Sort
        currentFiles.sort((a, b) => {
            let valA, valB;
            if (this.sortMode === 'name') {
                // Directories always first
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

        currentFiles.forEach(file => {
            const itemEl = document.createElement('div');
            itemEl.className = 'fc-item';
            
            const isDir = file.kind === 'directory';
            let icon = isDir ? 'folder' : 'file';
            
            // Icon logic for Workspaces root
            if (currentPathItem.kind === 'root') {
                 if (file.type === 'github') icon = 'github';
                 else if (file.type === 'local') icon = 'laptop';
                 else if (file.type === 'ssh') icon = 'ssh';
                 else if (file.type === 'indexeddb') icon = 'brain';
                 else if (file.type === 'opfs') icon = 'save';
            }
            
            let sizeStr = isDir ? '--' : this._formatSize(file.size);
            let dateStr = file.lastModified ? new Date(file.lastModified).toLocaleDateString() : '--';

            if (this.viewMode === 'grid') {
                itemEl.innerHTML = `
                    <div class="fc-icon"><svg class="svg-icon"><use href="#icon-${icon}"></use></svg></div>
                    <div class="fc-name">${file.name}</div>
                `;
            } else {
                itemEl.innerHTML = `
                    <div class="fc-col-name">
                        <svg class="svg-icon"><use href="#icon-${icon}"></use></svg>
                        <span>${file.name}</span>
                    </div>
                    <div class="fc-col-size">${sizeStr}</div>
                    <div class="fc-col-date">${dateStr}</div>
                `;
            }

            const fullItem = { ...currentPathItem, ...file };
            const uniquePath = getItemUniquePath(fullItem);
            
            State.domItemMap.set(uniquePath, { el: itemEl, item: fullItem });
            if (State.selectedItems.has(uniquePath)) itemEl.classList.add('selected');

            itemEl.onclick = (e) => {
                if (State.isSelectionModeActive || e.ctrlKey || e.metaKey) {
                    State.contextEvent = e;
                    SelectionManager.toggle(fullItem);
                    return;
                }
                
                if (isDir) {
                    this.controller.navigate(fullItem);
                } else {
                    Tabs.create(fullItem);
                }
            };
            
            itemEl.oncontextmenu = (e) => {
                State.contextEvent = e;
                Menus.show(e, fullItem);
            };

            this.grid.appendChild(itemEl);
        });
        
        this.container.querySelector('#fc-status-count').textContent = `${currentFiles.length} items`;
    },

    _updateBreadcrumbs(currentPathItem) {
        this.breadcrumbs.innerHTML = '';
        if (!currentPathItem) return;

        // Root Link
        const rootSpan = document.createElement('span');
        rootSpan.className = 'fc-crumb root';
        rootSpan.textContent = 'Workspaces';
        rootSpan.onclick = () => this.controller.navigate({ kind: 'root', name: 'Workspaces', path: '/' });
        this.breadcrumbs.appendChild(rootSpan);

        if (currentPathItem.kind === 'root') return;

        // Separator
        const sep1 = document.createElement('span');
        sep1.className = 'fc-sep';
        sep1.textContent = '>';
        this.breadcrumbs.appendChild(sep1);

        // Workspace Link
        const ws = State.workspaces.find(ws => ws.id === currentPathItem.workspaceId);
        // Fallback if workspace object isn't found (e.g. lost context), rely on item name for safety
        const wsName = ws ? ws.name : (currentPathItem.isWorkspaceRoot ? currentPathItem.name : 'Unknown');
        
        const wsSpan = document.createElement('span');
        wsSpan.className = 'fc-crumb';
        wsSpan.textContent = wsName;
        // Navigate to Workspace Root
        wsSpan.onclick = () => {
            if (ws) this.controller.navigate({ ...ws, path: '/', kind: 'directory' });
        };
        this.breadcrumbs.appendChild(wsSpan);

        if (currentPathItem.path === '/' || currentPathItem.path === '') return;

        // Path Segments
        const parts = currentPathItem.path.split('/').filter(Boolean);
        let currentAccum = '';
        
        parts.forEach((part) => {
            const sep = document.createElement('span');
            sep.className = 'fc-sep';
            sep.textContent = '/';
            this.breadcrumbs.appendChild(sep);

            currentAccum += '/' + part;
            const crumbPath = currentAccum; 
            
            const crumb = document.createElement('span');
            crumb.className = 'fc-crumb';
            crumb.textContent = part;
            crumb.onclick = () => this.controller.navigate({ 
                ...currentPathItem, 
                path: crumbPath, 
                name: part, 
                kind: 'directory' 
            });
            this.breadcrumbs.appendChild(crumb);
        });
    },

    _formatSize(bytes) {
        if (!bytes) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
    }
};
