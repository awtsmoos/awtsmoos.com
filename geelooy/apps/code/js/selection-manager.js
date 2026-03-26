
// B"H
// FILE: js/selection-manager.js

import { State, DOM } from './state.js';
import { UI } from './ui.js';
import { getItemUniquePath } from './workspaces/index.js'; 
import { FileOperations } from './file-operations.js';

export const SelectionManager = {
    initialize() {
        if (!DOM.selectionMenu) {
            DOM.selectionMenu = document.getElementById('selection-menu');
            if (!DOM.selectionMenu) {
                DOM.selectionMenu = document.createElement('div');
                DOM.selectionMenu.id = 'selection-menu';
                DOM.selectionMenu.className = 'selection-menu-bar'; 
                document.body.appendChild(DOM.selectionMenu);
            }
        }

        if (DOM.selectionMenu && !DOM.selectionMenu.dataset.bound) {
            DOM.selectionMenu.addEventListener('click', e => {
                e.stopPropagation();
                const button = e.target.closest('button');
                if (!button) return;
                const action = button.dataset.action;

                const items = Array.from(State.selectedItems.values());

                if (items.length === 0 && action !== 'cancel') return;

                switch (action) {
                    case 'copy': FileOperations.copySelected(); break;
                    case 'cut': FileOperations.copySelected(); UI.showToast("Items cut (ready to paste)", "info"); break;
                    case 'download-zip': FileOperations.downloadAsZip(items); this.end(); break;
                    case 'copy-zip': FileOperations.copyAsZip(items); break;
                    case 'download-md': FileOperations.downloadAllContents(items); this.end(); break;
                    case 'copy-md': FileOperations.copyAllContents(items); break;
                    case 'delete': FileOperations.deleteSelected(); break;
                    case 'cancel': this.end(); break;
                }
            });
            DOM.selectionMenu.dataset.bound = "true";
        }
    },

    start(initialItem) {
        this.initialize();
        if (State.isSelectionModeActive) {
            if (initialItem) this.toggle(initialItem);
            return;
        }
        
        State.isSelectionModeActive = true;
        if (initialItem) this.toggle(initialItem);
        
        const evt = State.contextEvent;
        let x = evt?.clientX !== undefined ? evt.clientX : window.innerWidth / 2;
        let y = evt?.clientY !== undefined ? evt.clientY : window.innerHeight / 2;
        
        this.showMenuAt(x, y);
        UI.showToast("Selection Mode Active", "info");
    },

    end() {
        State.isSelectionModeActive = false;
        this.hideMenu();
        
        for (const uniquePath of State.selectedItems.keys()) {
            const entry = State.domItemMap.get(uniquePath);
            if (entry?.el) entry.el.classList.remove('selected');
        }
        State.selectedItems.clear();
        State.contextEvent = null; 
    },

    toggle(item) {
        this.initialize();
        if (!item) return;

        const uniquePath = getItemUniquePath(item); 
        const entry = State.domItemMap.get(uniquePath);
        
        if (State.selectedItems.has(uniquePath)) {
            State.selectedItems.delete(uniquePath);
            if (entry?.el) entry.el.classList.remove('selected');
        } else {
            State.selectedItems.set(uniquePath, item);
            if (entry?.el) entry.el.classList.add('selected');
            this.updatePositionForItem(item);
        }
        
        this.updateMenuContent();
        
        if (State.selectedItems.size > 0 && DOM.selectionMenu) {
            DOM.selectionMenu.classList.add('visible');
        }
    },

    add(item) {
        this.initialize();
        if (!item) return;

        const uniquePath = getItemUniquePath(item);
        if (State.selectedItems.has(uniquePath)) return;

        State.selectedItems.set(uniquePath, item);
        
        const entry = State.domItemMap.get(uniquePath);
        if (entry?.el) {
            entry.el.classList.add('selected');
        }
        
        this.updateMenuContent();
        if (DOM.selectionMenu) {
            DOM.selectionMenu.classList.add('visible');
        }
    },
    
    // B"H - Force DOM nodes to mirror internal state arrays accurately
    refreshVisuals() {
        document.querySelectorAll('.tree-item.selected').forEach(el => el.classList.remove('selected'));
        for (const uniquePath of State.selectedItems.keys()) {
            const entry = State.domItemMap.get(uniquePath);
            if (entry && entry.el) {
                entry.el.classList.add('selected');
            }
        }
    },

    updatePositionForItem(item) {
        const uniquePath = getItemUniquePath(item); 
        const entry = State.domItemMap.get(uniquePath);
        if (entry && entry.el) {
            const rect = entry.el.getBoundingClientRect();
            this.showMenuAt(rect.right + 5, rect.top);
        }
    },

    showMenuAt(x, y) {
        if (!DOM.selectionMenu) return;
        DOM.selectionMenu.classList.add('visible');
        this.updateMenuContent();
        this.positionMenu(x, y);
    },

    hideMenu() {
        if (DOM.selectionMenu) {
            DOM.selectionMenu.classList.remove('visible');
        }
    },
    
    positionMenu(x, y) {
        const menu = DOM.selectionMenu;
        if (!menu) return;

        if (!State.contextEvent) {
            menu.style.right = '20px';
            menu.style.top = '60px';
            menu.style.left = 'auto'; 
            return;
        }

        menu.style.right = 'auto'; 
        const rect = menu.getBoundingClientRect();
        
        let posX = x + 20;
        let posY = y;
        
        if (posX + rect.width > window.innerWidth) posX = window.innerWidth - rect.width - 10;
        if (posY + rect.height > window.innerHeight) posY = window.innerHeight - rect.height - 10;
        
        if (posX < 10) posX = 10;
        if (posY < 10) posY = 10;
        
        menu.style.left = `${posX}px`;
        menu.style.top = `${posY}px`;
    },

    updateMenuContent() {
        const count = State.selectedItems.size;
        if (!DOM.selectionMenu) return;
        
        DOM.selectionMenu.innerHTML = `
            <div class="selection-header-vertical">
                <span class="selection-count">${count} Selected</span>
                <button data-action="cancel" class="cancel-icon-btn">×</button>
            </div>
            <div class="selection-list-vertical">
                <button data-action="copy"><svg class="svg-icon"><use href="#icon-copy"></use></svg> Copy</button>
                <button data-action="cut"><svg class="svg-icon"><use href="#icon-scissors"></use></svg> Cut</button>
                <hr class="selection-menu-sep">
                <button data-action="download-zip"><svg class="svg-icon"><use href="#icon-download"></use></svg> Download .zip</button>
                <button data-action="copy-zip"><svg class="svg-icon"><use href="#icon-save"></use></svg> Copy as .zip</button>
                <hr class="selection-menu-sep">
                <button data-action="download-md"><svg class="svg-icon"><use href="#icon-download"></use></svg> Download .md</button>
                <button data-action="copy-md"><svg class="svg-icon"><use href="#icon-clipboard"></use></svg> Copy as .md</button>
                <hr class="selection-menu-sep">
                <button data-action="delete" class="danger"><svg class="svg-icon"><use href="#icon-trash"></use></svg> Delete</button>
            </div>
        `;
    }
};
