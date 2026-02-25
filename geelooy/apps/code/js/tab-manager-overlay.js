
// B"H
// FILE: js/tab-manager-overlay.js

import { State, DOM } from './state.js';
import { Tabs } from './tabs/index.js';
import { UI } from './ui.js';

/**
 * --- TAB MANAGER OVERLAY ---
 * Rectified Hierarchical View with Workspace-to-Category-to-Path nesting.
 * B"H. This ensures all session types are partitioned by their physical world.
 */
export const TabManagerOverlay = {
    overlay: null,
    gridContainer: null,
    searchInput: null,
    selectionBar: null,
    contextMenu: null,
    
    isSelectionMode: false,
    selectedTabIds: new Set(),
    contextTargetTabId: null,
    
    isFolderView: false,
    expandedFolders: new Set(), 

    init() {
        this.overlay = document.getElementById('tab-manager-overlay');
        this.gridContainer = document.getElementById('tm-grid');
        this.searchInput = document.getElementById('tm-search');
        this.selectionBar = document.getElementById('tm-selection-bar');
        this.contextMenu = document.getElementById('tm-context-menu');
        
        document.getElementById('tab-manager-btn').onclick = () => this.show();
        document.getElementById('tm-close-overlay').onclick = () => this.hide();
        
        const storedExpanded = localStorage.getItem('awtsmoos_tm_expanded');
        if (storedExpanded) { try { this.expandedFolders = new Set(JSON.parse(storedExpanded)); } catch(e){} }
        
        const controlsDiv = this.overlay.querySelector('.tm-controls');
        const selectModeBtn = document.getElementById('tm-select-mode-btn');
        const toggleBtn = document.createElement('button');
        toggleBtn.id = 'tm-view-toggle-btn';
        toggleBtn.className = 'icon-button';
        toggleBtn.innerHTML = '<svg class="svg-icon"><use href="#icon-folder"></use></svg>';
        controlsDiv.insertBefore(toggleBtn, selectModeBtn);

        toggleBtn.onclick = () => {
            this.isFolderView = !this.isFolderView;
            toggleBtn.innerHTML = `<svg class="svg-icon"><use href="#icon-${this.isFolderView ? 'list' : 'folder'}"></use></svg>`;
            this.renderGrid();
        };

        selectModeBtn.onclick = () => this.enterSelectionMode();
        document.getElementById('tm-cancel-selection').onclick = () => this.exitSelectionMode();
        document.getElementById('tm-select-all').onclick = () => this.selectAll();
        document.getElementById('tm-close-selected').onclick = () => this.closeSelected();
        
        this.contextMenu.onclick = (e) => this.handleContextAction(e);
        document.addEventListener('click', (e) => { if (!this.contextMenu.contains(e.target)) this.hideContextMenu(); });
        this.searchInput.oninput = () => this.renderGrid();
        document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && this.overlay.classList.contains('visible')) { if (this.isSelectionMode) this.exitSelectionMode(); else this.hide(); } });
    },

    show() {
        this.exitSelectionMode(); 
        this.searchInput.value = '';
        this.renderGrid();
        this.overlay.classList.remove('hidden');
        void this.overlay.offsetWidth; 
        this.overlay.classList.add('visible');
        this.searchInput.focus();
    },

    hide() { this.overlay.classList.remove('visible'); setTimeout(() => this.overlay.classList.add('hidden'), 200); },

    renderGrid() {
        this.gridContainer.innerHTML = '';
        const filter = this.searchInput.value.toLowerCase();
        if (this.isFolderView) { this.gridContainer.className = 'tm-folder-layout'; this._renderFolderLayout(filter); }
        else { this.gridContainer.className = 'tm-grid'; this._renderFlatLayout(filter); }
    },

    _renderFlatLayout(filter) {
        State.tabs.forEach((tab, index) => {
            if (filter && !tab.item.name.toLowerCase().includes(filter)) return;
            this.gridContainer.appendChild(this._createCard(tab, index));
        });
    },

    /**
     * B"H - The Grand Hierarchy Ritual.
     * Partitioning: Workspace -> [Files | Vibe | Terminals | Commanders | Previews] -> Path.
     */
    _renderFolderLayout(filter) {
        const tree = new Map();

        State.tabs.forEach((tab, index) => {
            if (filter && !tab.item.name.toLowerCase().includes(filter)) return;
            
            const ws = State.workspaces.find(w => w.id === tab.item.workspaceId);
            const wsName = ws ? ws.name : 'System / Global';
            
            // 1. Determine Category
            let catName = '📄 Files';
            let catIcon = 'folder';
            let catType = 'standard';

            if (tab.fileType === 'vibe' || tab.item.type === 'vibe-session') { catName = '🧠 Vibe Sessions'; catIcon = 'brain'; catType = 'vibe'; }
            else if (tab.fileType === 'html-preview' || tab.isPreview) { catName = '👁️ Previews'; catIcon = 'eye'; catType = 'preview'; }
            else if (tab.item.type === 'commander') { catName = '📂 Commanders'; catIcon = 'folder'; catType = 'commander'; }
            else if (tab.fileType === 'terminal' || tab.item.type === 'terminal') { catName = '💻 Terminals'; catIcon = 'laptop'; catType = 'terminal'; }

            // 2. Ensure Workspace Node
            if (!tree.has(wsName)) {
                tree.set(wsName, { name: wsName, pathKey: wsName, type: 'workspace', children: new Map(), tabs: [], totalTabs: 0 });
            }
            const wsNode = tree.get(wsName);
            wsNode.totalTabs++;

            // 3. Ensure Category Node inside Workspace
            if (!wsNode.children.has(catName)) {
                wsNode.children.set(catName, { 
                    name: catName, 
                    pathKey: wsName + '::' + catName, 
                    type: 'category', 
                    catIcon, 
                    children: new Map(), 
                    tabs: [], 
                    totalTabs: 0 
                });
            }
            const catNode = wsNode.children.get(catName);
            catNode.totalTabs++;

            // 4. Traverse/Build Path Hierarchy inside Category
            let current = catNode;
            let currentPathKey = catNode.pathKey;
            
            let dirPath = tab.item.path || '/';
            const lastSlash = dirPath.lastIndexOf('/');
            dirPath = lastSlash > 0 ? dirPath.substring(0, lastSlash) : '/';
            
            if (dirPath !== '/') {
                dirPath.split('/').filter(Boolean).forEach(part => {
                    currentPathKey += '::' + part;
                    if (!current.children.has(part)) {
                        current.children.set(part, { name: part, pathKey: currentPathKey, type: 'folder', children: new Map(), tabs: [], totalTabs: 0 });
                    }
                    current = current.children.get(part);
                    current.totalTabs++;
                });
            }
            current.tabs.push({ tab, index });
        });

        const container = document.createElement('div');
        container.className = 'tm-tree-container';
        
        // Sorting: Alphabetical Workspaces
        const sortedWs = Array.from(tree.keys()).sort();
        sortedWs.forEach(ws => this._appendTreeNode(tree.get(ws), container, filter, true));
        this.gridContainer.appendChild(container);
    },

    _appendTreeNode(node, parentEl, filter, isRoot = false) {
        const wrapper = document.createElement('div');
        wrapper.className = `tm-tree-node ${isRoot ? 'root' : 'nested'}`;
        const isExpanded = filter || this.expandedFolders.has(node.pathKey);
        if (isExpanded) wrapper.classList.add('expanded');

        const header = document.createElement('div');
        header.className = 'tm-tree-header';
        
        // Icon logic
        let icon = 'folder';
        if (node.type === 'workspace') icon = 'brain';
        else if (node.type === 'category') icon = node.catIcon;
        
        header.innerHTML = `
            <span class="tm-folder-caret">▶</span> 
            <svg class="svg-icon tm-folder-icon"><use href="#icon-${icon}"></use></svg> 
            <span class="tm-folder-title">${node.name}</span> 
            <span class="tm-folder-count">${node.totalTabs}</span>
            <div class="tm-tree-tools" style="margin-left:auto; display:none; gap:5px;">
                 <button data-action="expand-all" style="padding:2px 6px; background:none; border:1px solid var(--color-border); border-radius:4px; color:var(--neon-lime); cursor:pointer;">+</button>
                 <button data-action="collapse-all" style="padding:2px 6px; background:none; border:1px solid var(--color-border); border-radius:4px; color:var(--color-accent-danger); cursor:pointer;">-</button>
            </div>`;

        header.onmouseenter = () => { const t = header.querySelector('.tm-tree-tools'); if(t) t.style.display = 'flex'; };
        header.onmouseleave = () => { const t = header.querySelector('.tm-tree-tools'); if(t) t.style.display = 'none'; };

        header.onclick = (e) => {
            const btn = e.target.closest('button[data-action]');
            if (btn) {
                e.stopPropagation();
                this._toggleRecursive(node, btn.dataset.action === 'expand-all');
                this.renderGrid();
                return;
            }
            const currentlyExpanded = wrapper.classList.contains('expanded');
            if (currentlyExpanded) { wrapper.classList.remove('expanded'); this.expandedFolders.delete(node.pathKey); }
            else { wrapper.classList.add('expanded'); this.expandedFolders.add(node.pathKey); }
            localStorage.setItem('awtsmoos_tm_expanded', JSON.stringify(Array.from(this.expandedFolders)));
        };

        const body = document.createElement('div');
        body.className = 'tm-tree-body';
        
        // Sorting folders alphabetically
        Array.from(node.children.keys()).sort().forEach(ck => this._appendTreeNode(node.children.get(ck), body, filter, false));
        
        // Render tabs in a grid
        if (node.tabs.length > 0) {
            const grid = document.createElement('div');
            grid.className = 'tm-tree-tabs-grid';
            node.tabs.forEach(({tab, index}) => grid.appendChild(this._createCard(tab, index, false)));
            body.appendChild(grid);
        }
        wrapper.append(header, body);
        parentEl.appendChild(wrapper);
    },

    _toggleRecursive(node, expand) {
        if (expand) this.expandedFolders.add(node.pathKey); else this.expandedFolders.delete(node.pathKey);
        node.children.forEach(c => this._toggleRecursive(c, expand));
        localStorage.setItem('awtsmoos_tm_expanded', JSON.stringify(Array.from(this.expandedFolders)));
    },

    _createCard(tab, index, drag = true) {
        const card = document.createElement('div');
        card.className = `tm-card ${tab.id === State.activeTabId ? 'active-tab' : ''} ${this.selectedTabIds.has(tab.id) ? 'selected' : ''} ${tab.pinned ? 'pinned' : ''}`;
        card.draggable = drag; card.dataset.tabId = tab.id;
        const iconMap = { 'text': 'file', 'image': 'eye', 'zip': 'save', 'html-preview': 'eye', 'console': 'laptop', 'commander': 'folder', 'vibe': 'brain', 'terminal': 'laptop' };
        let dot = tab.isDirty ? '<span class="tm-status-dot dirty"></span>' : tab.isUncommitted ? '<span class="tm-status-dot uncommitted"></span>' : '';
        card.innerHTML = `<div class="tm-card-header"><div class="tm-icon"><svg class="svg-icon"><use href="#icon-${iconMap[tab.fileType]||'file'}"></use></svg></div><div class="tm-info"><span class="tm-name">${dot}${tab.item.name}</span><span class="tm-path" title="${tab.item.path}">${tab.item.path || '/'}</span></div></div>`;
        this.attachCardEvents(card, tab.id);
        return card;
    },

    attachCardEvents(card, tabId) {
        card.onclick = () => { if (this.isSelectionMode) this.toggleSelection(tabId); else { this.hide(); Tabs.activate(tabId); } };
        card.oncontextmenu = (e) => { e.preventDefault(); this.showContextMenu(e.clientX, e.clientY, tabId); };
    },

    toggleSelection(tabId) { if (this.selectedTabIds.has(tabId)) this.selectedTabIds.delete(tabId); else this.selectedTabIds.add(tabId); this.updateSelectionUI(); },
    updateSelectionUI() { document.getElementById('tm-selection-count').textContent = `${this.selectedTabIds.size} Selected`; this.gridContainer.querySelectorAll('.tm-card').forEach(c => c.classList.toggle('selected', this.selectedTabIds.has(Number(c.dataset.tabId)))); },
    enterSelectionMode() { this.isSelectionMode = true; this.overlay.classList.add('selection-mode'); this.selectionBar.classList.remove('hidden'); this.updateSelectionUI(); this.renderGrid(); },
    exitSelectionMode() { this.isSelectionMode = false; this.selectedTabIds.clear(); this.overlay.classList.remove('selection-mode'); this.selectionBar.classList.add('hidden'); this.renderGrid(); },
    selectAll() { State.tabs.forEach(t => this.selectedTabIds.add(t.id)); this.updateSelectionUI(); },
    async closeSelected() { for (const id of Array.from(this.selectedTabIds)) await Tabs.close(id, true); this.exitSelectionMode(); },
    showContextMenu(x, y, tabId) { this.contextTargetTabId = tabId; this.contextMenu.style.left = `${x}px`; this.contextMenu.style.top = `${y}px`; this.contextMenu.classList.remove('hidden'); },
    hideContextMenu() { this.contextMenu.classList.add('hidden'); },
    handleContextAction(e) {
        const btn = e.target.closest('button'); if (!btn) return;
        const tabId = this.contextTargetTabId; this.hideContextMenu();
        if (btn.dataset.action === 'open') { this.hide(); Tabs.activate(tabId); }
        else if (btn.dataset.action === 'close') { import('../tabs/index.js').then(m => m.Tabs.close(tabId)); this.renderGrid(); }
        else if (btn.dataset.action === 'pin') { const t = State.tabs.find(x => x.id === tabId); if(t) { t.pinned = !t.pinned; this.renderGrid(); import('../tabs/index.js').then(m => m.Tabs.render()); } }
    }
};
