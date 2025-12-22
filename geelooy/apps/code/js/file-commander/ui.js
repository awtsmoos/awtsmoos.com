// B"H
// FILE: js/file-commander/ui.js

import { State } from '../state.js';
import { Menus } from '../menus.js';
import { Tabs } from '../tabs/index.js';

export const FileCommanderUI = {
    overlay: null,
    grid: null,
    breadcrumbs: null,
    sortBar: null,
    viewMode: 'grid', // 'grid' | 'details'
    sortMode: 'name', // 'name' | 'size' | 'date'
    sortAsc: true,
    controller: null, // Set by index.js

    init(controller) {
        this.controller = controller;
        if (document.getElementById('file-commander-overlay')) return;

        const overlay = document.createElement('div');
        overlay.id = 'file-commander-overlay';
        overlay.className = 'file-commander-overlay hidden';
        overlay.innerHTML = `
            <div class="fc-window">
                <div class="fc-header">
                    <div class="fc-title">File Commander</div>
                    <div class="fc-controls">
                        <button id="fc-close-btn" class="icon-button"><svg class="svg-icon"><use href="#icon-x"></use></svg></button>
                    </div>
                </div>
                <div class="fc-toolbar">
                    <button id="fc-up-btn" class="icon-button" title="Go Up"><svg class="svg-icon"><use href="#icon-arrow-left"></use></svg></button>
                    <div id="fc-breadcrumbs" class="fc-breadcrumbs"></div>
                    <div class="fc-view-options">
                        <button id="fc-view-grid" class="icon-button active" title="Grid View"><svg class="svg-icon"><use href="#icon-brain"></use></svg></button>
                        <button id="fc-view-details" class="icon-button" title="Details View"><svg class="svg-icon"><use href="#icon-list"></use></svg></button>
                    </div>
                </div>
                <div class="fc-sort-bar hidden" id="fc-sort-bar">
                    <div class="fc-col-name" data-sort="name">Name</div>
                    <div class="fc-col-size" data-sort="size">Size</div>
                    <div class="fc-col-date" data-sort="date">Date</div>
                </div>
                <div id="fc-content" class="fc-content grid-view"></div>
                <div class="fc-statusbar">
                    <span id="fc-status-count">0 items</span>
                </div>
            </div>
        `;
        document.body.appendChild(overlay);

        this.overlay = overlay;
        this.grid = overlay.querySelector('#fc-content');
        this.breadcrumbs = overlay.querySelector('#fc-breadcrumbs');
        this.sortBar = overlay.querySelector('#fc-sort-bar');

        this._bindEvents();
    },

    _bindEvents() {
        this.overlay.querySelector('#fc-close-btn').onclick = () => this.controller.hide();
        this.overlay.querySelector('#fc-up-btn').onclick = () => this.controller.goUp();
        
        this.overlay.querySelector('#fc-view-grid').onclick = () => this.setView('grid');
        this.overlay.querySelector('#fc-view-details').onclick = () => this.setView('details');

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
        
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.overlay.classList.contains('visible')) {
                this.controller.hide();
            }
        });
    },

    show() {
        this.overlay.classList.remove('hidden');
        void this.overlay.offsetWidth;
        this.overlay.classList.add('visible');
    },

    hide() {
        this.overlay.classList.remove('visible');
        setTimeout(() => this.overlay.classList.add('hidden'), 200);
    },

    setView(mode) {
        this.viewMode = mode;
        this.grid.className = `fc-content ${mode}-view`;
        
        const gridBtn = this.overlay.querySelector('#fc-view-grid');
        const detailsBtn = this.overlay.querySelector('#fc-view-details');
        
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
        
        // Sort
        currentFiles.sort((a, b) => {
            let valA, valB;
            if (this.sortMode === 'name') {
                if (a.kind !== b.kind) return a.kind === 'directory' ? -1 : 1;
                valA = a.name.toLowerCase(); valB = b.name.toLowerCase();
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

            itemEl.onclick = () => {
                if (isDir) {
                    this.controller.navigate(fullItem);
                } else {
                    Tabs.create(fullItem);
                    this.hide();
                }
            };
            
            itemEl.oncontextmenu = (e) => {
                Menus.show(e, fullItem);
            };

            this.grid.appendChild(itemEl);
        });
        
        this.overlay.querySelector('#fc-status-count').textContent = `${currentFiles.length} items`;
    },

    _updateBreadcrumbs(currentPathItem) {
        this.breadcrumbs.innerHTML = '';
        if (!currentPathItem) return;

        const rootSpan = document.createElement('span');
        rootSpan.className = 'fc-crumb root';
        rootSpan.textContent = 'Workspaces';
        rootSpan.onclick = () => this.controller.navigate({ kind: 'root', name: 'Workspaces', path: '/' });
        this.breadcrumbs.appendChild(rootSpan);

        if (currentPathItem.kind === 'root') return;

        const sep1 = document.createElement('span');
        sep1.className = 'fc-sep';
        sep1.textContent = '>';
        this.breadcrumbs.appendChild(sep1);

        const ws = State.workspaces.find(ws => ws.id === currentPathItem.workspaceId);
        const wsName = ws ? ws.name : 'Unknown';
        
        const wsSpan = document.createElement('span');
        wsSpan.className = 'fc-crumb';
        wsSpan.textContent = wsName;
        wsSpan.onclick = () => this.controller.navigate({ ...currentPathItem, path: '/', kind: 'directory' });
        this.breadcrumbs.appendChild(wsSpan);

        if (currentPathItem.path === '/') return;

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
            crumb.onclick = () => this.controller.navigate({ ...currentPathItem, path: crumbPath, kind: 'directory' });
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