
// B"H
import { TMState } from './state.js';
import { TMSelection } from './selection.js';
import { TMUI } from './ui.js';
import { TMFlatRenderer } from './render-flat.js';
import { TMTreeRenderer } from './render-tree.js';
import { State } from '../state.js';
import { Tabs } from '../tabs/index.js';

export const TabManagerOverlay = {
    element: null, gridContainer: null, searchInput: null, selectionBar: null, contextMenu: null,

    init() {
        this.element = document.getElementById('tab-manager-overlay');
        this.gridContainer = document.getElementById('tm-grid');
        this.searchInput = document.getElementById('tm-search');
        this.selectionBar = document.getElementById('tm-selection-bar');
        this.contextMenu = document.getElementById('tm-context-menu');
        
        document.getElementById('tab-manager-btn').onclick = () => this.show();
        document.getElementById('tm-close-overlay').onclick = () => this.hide();
        
        const storedExpanded = localStorage.getItem('awtsmoos_tm_expanded');
        if (storedExpanded) { try { TMState.expandedFolders = new Set(JSON.parse(storedExpanded)); } catch(e){} }
        
        const controlsDiv = this.element.querySelector('.tm-controls');
        const selectModeBtn = document.getElementById('tm-select-mode-btn');
        const toggleBtn = document.createElement('button');
        toggleBtn.id = 'tm-view-toggle-btn';
        toggleBtn.className = 'icon-button';
        toggleBtn.innerHTML = '<svg class="svg-icon"><use href="#icon-folder"></use></svg>';
        controlsDiv.insertBefore(toggleBtn, selectModeBtn);

        toggleBtn.onclick = () => {
            TMState.isFolderView = !TMState.isFolderView;
            toggleBtn.innerHTML = `<svg class="svg-icon"><use href="#icon-${TMState.isFolderView ? 'list' : 'folder'}"></use></svg>`;
            this.renderGrid();
        };

        selectModeBtn.onclick = () => TMSelection.enter(this, () => this.renderGrid());
        document.getElementById('tm-cancel-selection').onclick = () => TMSelection.exit(this, () => this.renderGrid());
        document.getElementById('tm-select-all').onclick = () => TMSelection.selectAll(this);
        document.getElementById('tm-close-selected').onclick = () => TMSelection.closeSelected(this, () => this.renderGrid());
        
        this.contextMenu.onclick = (e) => this.handleContextAction(e);
        document.addEventListener('click', (e) => { if (!this.contextMenu.contains(e.target)) TMUI.hideContextMenu(this.contextMenu); });
        this.searchInput.oninput = () => this.renderGrid();
        document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && this.element.classList.contains('visible')) { if (TMState.isSelectionMode) TMSelection.exit(this, () => this.renderGrid()); else this.hide(); } });
    },

    show() {
        TMSelection.exit(this, () => {}); 
        this.searchInput.value = '';
        this.renderGrid();
        this.element.classList.remove('hidden');
        void this.element.offsetWidth; 
        this.element.classList.add('visible');
        this.searchInput.focus();
    },

    hide() { this.element.classList.remove('visible'); setTimeout(() => this.element.classList.add('hidden'), 200); },

    renderGrid() {
        this.gridContainer.innerHTML = '';
        const filter = this.searchInput.value.toLowerCase();
        
        const onInteract = (id) => { if (TMState.isSelectionMode) TMSelection.toggle(id, this, () => this.renderGrid()); else { this.hide(); Tabs.activate(id); } };
        const onContext = (x, y, id) => TMUI.showContextMenu(x, y, id, this.contextMenu);
        
        if (TMState.isFolderView) { 
            this.gridContainer.className = 'tm-folder-layout'; 
            TMTreeRenderer.render(this.gridContainer, filter, onInteract, onContext, () => this.renderGrid()); 
        } else { 
            this.gridContainer.className = 'tm-grid'; 
            TMFlatRenderer.render(this.gridContainer, filter, onInteract, onContext); 
        }
    },

    handleContextAction(e) {
        const btn = e.target.closest('button'); if (!btn) return;
        const tabId = TMState.contextTargetTabId; TMUI.hideContextMenu(this.contextMenu);
        if (btn.dataset.action === 'open') { this.hide(); Tabs.activate(tabId); }
        else if (btn.dataset.action === 'close') { Tabs.close(tabId); this.renderGrid(); }
        else if (btn.dataset.action === 'pin') { const t = State.tabs.find(x => x.id === tabId); if(t) { t.pinned = !t.pinned; this.renderGrid(); Tabs.render(); } }
    }
};
