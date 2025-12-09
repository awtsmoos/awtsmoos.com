// B"H
// FILE: js/tab-manager-overlay.js

import { State, DOM } from './state.js';
import { Tabs } from './tabs/index.js'; // Use index to avoid cycle issues if any, though direct is fine
import { UI } from './ui.js';

export const TabManagerOverlay = {
    overlay: null,
    grid: null,
    searchInput: null,
    selectedTabIds: new Set(),

    init() {
        this.overlay = document.getElementById('tab-manager-overlay');
        this.grid = document.getElementById('tm-grid');
        this.searchInput = document.getElementById('tm-search');
        
        document.getElementById('tab-manager-btn').onclick = () => this.show();
        document.getElementById('tm-close-overlay').onclick = () => this.hide();
        document.getElementById('tm-close-all').onclick = () => this.closeAll();
        document.getElementById('tm-close-selected').onclick = () => this.closeSelected();
        
        this.searchInput.oninput = () => this.renderGrid();
        
        // Close on escape
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.overlay.classList.contains('visible')) {
                this.hide();
            }
        });
    },

    show() {
        this.selectedTabIds.clear();
        this.searchInput.value = '';
        this.renderGrid();
        this.overlay.classList.remove('hidden');
        // Force reflow
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

    renderGrid() {
        this.grid.innerHTML = '';
        const filter = this.searchInput.value.toLowerCase();
        
        State.tabs.forEach(tab => {
            if (filter && !tab.item.name.toLowerCase().includes(filter)) return;

            const card = document.createElement('div');
            card.className = `tm-card ${tab.id === State.activeTabId ? 'active-tab' : ''}`;
            if (this.selectedTabIds.has(tab.id)) card.classList.add('selected');
            
            card.onclick = (e) => this.toggleSelection(tab.id, card, e);
            card.ondblclick = () => {
                this.hide();
                Tabs.activate(tab.id);
            };

            const iconMap = {
                'text': 'file',
                'image': 'eye',
                'zip': 'save',
                'html-preview': 'eye',
                'console': 'laptop'
            };
            const icon = iconMap[tab.fileType] || 'file';

            card.innerHTML = `
                <div class="tm-status ${tab.isDirty ? 'dirty' : (tab.isUncommitted ? 'uncommitted' : '')}"></div>
                <div class="tm-card-header">
                    <div class="tm-icon"><svg class="svg-icon"><use href="#icon-${icon}"></use></svg></div>
                    <div class="tm-info">
                        <span class="tm-name" title="${tab.item.name}">${tab.item.name}</span>
                        <span class="tm-path" title="${tab.item.path}">${tab.item.path || '/'}</span>
                    </div>
                </div>
                <div class="tm-actions">
                    <button class="tm-close-btn" title="Close Tab"><svg class="svg-icon"><use href="#icon-x"></use></svg></button>
                </div>
            `;
            
            card.querySelector('.tm-close-btn').onclick = (e) => {
                e.stopPropagation();
                this.closeTab(tab.id);
            };

            this.grid.appendChild(card);
        });
    },

    toggleSelection(tabId, cardElement, event) {
        if (event.ctrlKey || event.metaKey) {
            if (this.selectedTabIds.has(tabId)) {
                this.selectedTabIds.delete(tabId);
                cardElement.classList.remove('selected');
            } else {
                this.selectedTabIds.add(tabId);
                cardElement.classList.add('selected');
            }
        } else {
            // Simple click selects only this one
            this.selectedTabIds.clear();
            this.grid.querySelectorAll('.tm-card.selected').forEach(el => el.classList.remove('selected'));
            this.selectedTabIds.add(tabId);
            cardElement.classList.add('selected');
        }
    },

    async closeTab(tabId) {
        await Tabs.close(tabId);
        this.renderGrid();
    },

    async closeAll() {
        const confirm = await UI.showDialog({
            title: "Close All Tabs?",
            message: "Are you sure you want to close all open tabs?",
            okText: "Close All",
            cancelText: "Cancel"
        });
        if (!confirm) return;

        // Clone array to avoid modification issues during iteration
        const tabs = [...State.tabs];
        for (const tab of tabs) {
            await Tabs.close(tab.id, true);
        }
        this.renderGrid();
    },

    async closeSelected() {
        if (this.selectedTabIds.size === 0) return;
        
        for (const tabId of this.selectedTabIds) {
            await Tabs.close(tabId, true);
        }
        this.selectedTabIds.clear();
        this.renderGrid();
    }
};