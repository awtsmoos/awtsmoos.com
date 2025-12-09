// B"H
// FILE: js/tab-manager-overlay.js

import { State, DOM } from './state.js';
import { Tabs } from './tabs/index.js';
import { UI } from './ui.js';

export const TabManagerOverlay = {
    overlay: null,
    grid: null,
    searchInput: null,
    selectionBar: null,
    contextMenu: null,
    
    isSelectionMode: false,
    selectedTabIds: new Set(),
    contextTargetTabId: null,
    draggedTabId: null,

    init() {
        this.overlay = document.getElementById('tab-manager-overlay');
        this.grid = document.getElementById('tm-grid');
        this.searchInput = document.getElementById('tm-search');
        this.selectionBar = document.getElementById('tm-selection-bar');
        this.contextMenu = document.getElementById('tm-context-menu');
        
        document.getElementById('tab-manager-btn').onclick = () => this.show();
        document.getElementById('tm-close-overlay').onclick = () => this.hide();
        
        // Selection Mode Controls
        document.getElementById('tm-select-mode-btn').onclick = () => this.enterSelectionMode();
        document.getElementById('tm-cancel-selection').onclick = () => this.exitSelectionMode();
        document.getElementById('tm-select-all').onclick = () => this.selectAll();
        document.getElementById('tm-close-selected').onclick = () => this.closeSelected();
        
        // Context Menu Controls
        this.contextMenu.addEventListener('click', (e) => this.handleContextAction(e));
        document.addEventListener('click', (e) => {
            if (!this.contextMenu.contains(e.target)) this.hideContextMenu();
        });

        this.searchInput.oninput = () => this.renderGrid();
        
        // Close on escape
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.overlay.classList.contains('visible')) {
                if (this.isSelectionMode) this.exitSelectionMode();
                else this.hide();
            }
        });
    },

    show() {
        this.exitSelectionMode(); // Start fresh
        this.searchInput.value = '';
        this.renderGrid();
        this.overlay.classList.remove('hidden');
        void this.overlay.offsetWidth; 
        this.overlay.classList.add('visible');
        this.searchInput.focus();
    },

    hide() {
        this.overlay.classList.remove('visible');
        setTimeout(() => {
            this.overlay.classList.add('hidden');
        }, 200);
    },

    // --- RENDER LOGIC ---

    renderGrid() {
        this.grid.innerHTML = '';
        const filter = this.searchInput.value.toLowerCase();
        
        State.tabs.forEach((tab, index) => {
            if (filter && !tab.item.name.toLowerCase().includes(filter)) return;

            const card = document.createElement('div');
            card.className = `tm-card ${tab.id === State.activeTabId ? 'active-tab' : ''}`;
            if (this.selectedTabIds.has(tab.id)) card.classList.add('selected');
            if (tab.pinned) card.classList.add('pinned');
            
            // Drag Attributes
            card.draggable = true; 
            
            card.dataset.tabId = tab.id;
            card.dataset.index = index;

            // Icon Determination
            const iconMap = { 'text': 'file', 'image': 'eye', 'zip': 'save', 'html-preview': 'eye', 'console': 'laptop' };
            const icon = iconMap[tab.fileType] || 'file';
            
            // Status Dot
            let statusDot = '';
            if (tab.isDirty) statusDot = '<span class="tm-status-dot dirty"></span>';
            else if (tab.isUncommitted) statusDot = '<span class="tm-status-dot uncommitted"></span>';

            card.innerHTML = `
                <div class="tm-card-header">
                    <div class="tm-icon"><svg class="svg-icon"><use href="#icon-${icon}"></use></svg></div>
                    <div class="tm-info">
                        <span class="tm-name">${statusDot}${tab.item.name}</span>
                        <span class="tm-path" title="${tab.item.path}">${tab.item.path || '/'}</span>
                    </div>
                </div>
            `;
            
            this.attachCardEvents(card, tab.id);
            this.grid.appendChild(card);
        });
    },

    attachCardEvents(card, tabId) {
        let longPressTimer;
        const LONG_PRESS_DURATION = 500;

        // 1. CLICK / TAP
        card.addEventListener('click', (e) => {
            if (this.isSelectionMode) {
                this.toggleSelection(tabId);
            } else {
                this.hide();
                Tabs.activate(tabId);
            }
        });

        // 2. CONTEXT MENU (Right Click)
        card.addEventListener('contextmenu', (e) => {
            e.preventDefault();
            this.showContextMenu(e.clientX, e.clientY, tabId);
        });

        // 3. LONG PRESS (Touch)
        const startPress = (e) => {
            longPressTimer = setTimeout(() => {
                // Trigger context menu
                const touch = e.touches ? e.touches[0] : e;
                this.showContextMenu(touch.clientX, touch.clientY, tabId);
            }, LONG_PRESS_DURATION);
        };

        const cancelPress = () => {
            clearTimeout(longPressTimer);
        };

        card.addEventListener('touchstart', startPress, { passive: true });
        card.addEventListener('touchend', cancelPress);
        card.addEventListener('touchmove', cancelPress);

        // 4. DRAG & DROP
        card.addEventListener('dragstart', (e) => {
            this.draggedTabId = tabId;
            e.dataTransfer.effectAllowed = 'move';
            // Slight delay to allow the ghost image to form before adding class
            setTimeout(() => card.classList.add('dragging'), 0);
        });

        card.addEventListener('dragend', () => {
            this.draggedTabId = null;
            card.classList.remove('dragging');
            // Re-render to ensure clean state
            this.renderGrid();
        });

        card.addEventListener('dragover', (e) => {
            e.preventDefault(); // Necessary to allow dropping
            const draggedId = this.draggedTabId;
            if (!draggedId || draggedId === tabId) return;

            // Perform visual swap (logic)
            this.handleReorder(draggedId, tabId);
        });
    },//comma!!

    // --- REORDER LOGIC ---

    handleReorder(sourceId, targetId) {
        const sourceIndex = State.tabs.findIndex(t => t.id === sourceId);
        const targetIndex = State.tabs.findIndex(t => t.id === targetId);

        if (sourceIndex === -1 || targetIndex === -1 || sourceIndex === targetIndex) return;

        // 1. Modify State
        const [movedTab] = State.tabs.splice(sourceIndex, 1);
        State.tabs.splice(targetIndex, 0, movedTab);

        // 2. Re-render Grid (Efficiently ideally, but full re-render is safe)
        // We only re-render the grid DOM, we don't save session every ms of drag.
        this.renderGrid();
        
        // 3. Sync main tab bar immediately so user sees effect
        Tabs.render(); 
    },

    // --- SELECTION MODE ---

    enterSelectionMode() {
        this.isSelectionMode = true;
        this.overlay.classList.add('selection-mode');
        this.selectionBar.classList.remove('hidden');
        this.updateSelectionUI(); // B"H - Ensure count is synced immediately
        this.renderGrid(); // Update card visuals (dashed borders)
    },

    exitSelectionMode() {
        this.isSelectionMode = false;
        this.selectedTabIds.clear();
        this.overlay.classList.remove('selection-mode');
        this.selectionBar.classList.add('hidden');
        this.renderGrid();
    },

    toggleSelection(tabId) {
        if (this.selectedTabIds.has(tabId)) {
            this.selectedTabIds.delete(tabId);
        } else {
            this.selectedTabIds.add(tabId);
        }
        this.updateSelectionUI();
    },

    selectAll() {
        State.tabs.forEach(t => this.selectedTabIds.add(t.id));
        this.updateSelectionUI();
    },

    updateSelectionUI() {
        document.getElementById('tm-selection-count').textContent = `${this.selectedTabIds.size} Selected`;
        
        // Update Grid visual state
        const cards = this.grid.querySelectorAll('.tm-card');
        cards.forEach(card => {
            const id = Number(card.dataset.tabId);
            if (this.selectedTabIds.has(id)) card.classList.add('selected');
            else card.classList.remove('selected');
        });
    },

    async closeSelected() {
        if (this.selectedTabIds.size === 0) return;
        
        // Convert Set to Array to iterate safely while mutating State.tabs
        const ids = Array.from(this.selectedTabIds);
        for (const id of ids) {
            await Tabs.close(id, true); // Force close for bulk action? Or prompt? 
            // For smoother UX in bulk, we usually force or check dirty once. 
            // Tabs.close logic handles dirty checks individually. 
        }
        
        this.exitSelectionMode(); // Exit mode after action
    },

    // --- CONTEXT MENU ---

    showContextMenu(x, y, tabId) {
        this.contextTargetTabId = tabId;
        const menu = this.contextMenu;
        
        menu.style.left = `${x}px`;
        menu.style.top = `${y}px`;
        menu.classList.remove('hidden');
        
        // Adjust position if off-screen
        const rect = menu.getBoundingClientRect();
        if (x + rect.width > window.innerWidth) menu.style.left = `${window.innerWidth - rect.width - 10}px`;
        if (y + rect.height > window.innerHeight) menu.style.top = `${window.innerHeight - rect.height - 10}px`;
    },

    hideContextMenu() {
        this.contextMenu.classList.add('hidden');
        this.contextTargetTabId = null;
    },//commas

    handleContextAction(e) {
        const btn = e.target.closest('button');
        if (!btn) return;
        const action = btn.dataset.action;
        const tabId = this.contextTargetTabId;
        
        this.hideContextMenu();

        if (action === 'open') {
            this.hide();
            Tabs.activate(tabId);
        } else if (action === 'select') {
            this.enterSelectionMode();
            this.toggleSelection(tabId);
        } else if (action === 'close') {
            Tabs.close(tabId);
            this.renderGrid();
        } else if (action === 'pin') {
            const tab = State.tabs.find(t => t.id === tabId);
            if (tab) {
                tab.pinned = !tab.pinned;
                // Move pinned tabs to start
                if (tab.pinned) {
                    const idx = State.tabs.indexOf(tab);
                    State.tabs.splice(idx, 1);
                    State.tabs.unshift(tab);
                }
                this.renderGrid();
                Tabs.render();
            }
        }
    }
};