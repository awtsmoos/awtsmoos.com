
// B"H
// FILE: js/selection-manager.js

import { State, DOM } from './state.js';
import { UI } from './ui.js';
import { getItemUniquePath } from './workspaces.js'; 
import { FileOperations } from './file-operations.js';

export const SelectionManager = {
    initialize() {
        // 1. Locate the physical vessel
        if (!DOM.selectionMenu) {
            DOM.selectionMenu = document.getElementById('selection-menu');
            if (!DOM.selectionMenu) {
                // Defensive: Create it if the HTML structure is broken
                DOM.selectionMenu = document.createElement('div');
                DOM.selectionMenu.id = 'selection-menu';
                DOM.selectionMenu.className = 'selection-menu-bar'; 
                document.body.appendChild(DOM.selectionMenu);
            }
        }

        // 2. Bind Events (The Senses)
        if (DOM.selectionMenu && !DOM.selectionMenu.dataset.bound) {
            DOM.selectionMenu.addEventListener('click', e => {
                e.stopPropagation();
                const button = e.target.closest('button');
                if (!button) return;
                const action = button.dataset.action;

                const items = Array.from(State.selectedItems)
                    .map(path => State.domItemMap.get(path)?.item)
                    .filter(Boolean);

                if (items.length === 0 && action !== 'cancel') return;

                // Execute Rituals
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
        // B"H - Tikkun: Ensure the senses are awake before we do anything!
        this.initialize();

        if (State.isSelectionModeActive) {
            if (initialItem) this.toggle(initialItem);
            return;
        }
        
        State.isSelectionModeActive = true;
        
        if (initialItem) {
            this.toggle(initialItem);
        }
        
        // Determine position: Mouse event, or Center Screen fallback
        const evt = State.contextEvent;
        let x, y;
        
        if (evt && evt.clientX !== undefined) {
            x = evt.clientX;
            y = evt.clientY;
        } else {
            x = window.innerWidth / 2;
            y = window.innerHeight / 2;
        }
        
        this.showMenuAt(x, y);
        UI.showToast("Selection Mode Active", "info");
    },

    end() {
        State.isSelectionModeActive = false;
        this.hideMenu();
        
        // Clear visual selection state
        State.selectedItems.forEach(uniquePath => {
            const entry = State.domItemMap.get(uniquePath);
            if (entry?.el) entry.el.classList.remove('selected');
        });
        State.selectedItems.clear();
        State.contextEvent = null; // Clean up the event reference
    },

    toggle(item) {
        // B"H - Ensure senses are awake if toggle is called directly
        this.initialize();

        if (!item) return;
        const uniquePath = getItemUniquePath(item); 
        const entry = State.domItemMap.get(uniquePath);
        
        if (State.selectedItems.has(uniquePath)) {
            State.selectedItems.delete(uniquePath);
            if (entry?.el) entry.el.classList.remove('selected');
        } else {
            State.selectedItems.add(uniquePath);
            if (entry?.el) entry.el.classList.add('selected');
            // B"H - Update position to follow the most recent selection
            this.updatePositionForItem(item);
        }
        
        this.updateMenuContent();
        
        // Ensure it's visible if we have items
        if (State.selectedItems.size > 0 && DOM.selectionMenu) {
            DOM.selectionMenu.classList.add('visible');
        }
    },
    
    updatePositionForItem(item) {
        const uniquePath = getItemUniquePath(item); 
        const entry = State.domItemMap.get(uniquePath);
        if (entry && entry.el) {
            const rect = entry.el.getBoundingClientRect();
            // Position to the right of the item
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
        const rect = menu.getBoundingClientRect();
        
        let posX = x + 20;
        let posY = y;
        
        // Keep inside bounds
        if (posX + rect.width > window.innerWidth) posX = window.innerWidth - rect.width - 10;
        if (posY + rect.height > window.innerHeight) posY = window.innerHeight - rect.height - 10;
        
        // Ensure it doesn't go off-screen top/left
        if (posX < 10) posX = 10;
        if (posY < 10) posY = 10;
        
        menu.style.left = `${posX}px`;
        menu.style.top = `${posY}px`;
    },

    updateMenuContent() {
        const count = State.selectedItems.size;
        if (!DOM.selectionMenu) return;
        
        // Pure HTML structure. Styles are in css/ui/selection-menu.css
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
