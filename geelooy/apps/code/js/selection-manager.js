// B"H
// FILE: js/selection-manager.js

import { State, DOM } from './state.js';
import { UI } from './ui.js';
import { getItemUniquePath } from './workspaces.js'; 
import { FileOperations } from './file-operations.js';

export const SelectionManager = {
    initialize() {
        DOM.selectionMenu = document.getElementById('selection-menu');

        DOM.selectionMenu.addEventListener('click', e => {
            e.stopPropagation()
            
            const button = e.target.closest('button');
            if (!button) return;
            const action = button.dataset.action;

            if (action === 'copy-selection') {
                FileOperations.copySelected();
            } else if (action === 'copy-contents-selection') {
                const itemsToCopy = Array.from(State.selectedItems)
                    .map(path => State.domItemMap.get(path)?.item)
                    .filter(Boolean);

                if (itemsToCopy.length > 0) {
                    FileOperations.copyAllContents(itemsToCopy);
                }
                this.end(); 
            } else if (action === 'copy-zip-selection') {
                const items = Array.from(State.selectedItems)
                    .map(path => State.domItemMap.get(path)?.item)
                    .filter(Boolean);
                FileOperations.copyAsZip(items);
                this.end();
            } else if (action === 'download-zip-selection') {
                const items = Array.from(State.selectedItems)
                    .map(path => State.domItemMap.get(path)?.item)
                    .filter(Boolean);
                FileOperations.downloadAsZip(items);
                this.end();
            } else if (action === 'delete-selection') {
                FileOperations.deleteSelected();
            } else if (action === 'cancel-selection') {
                this.end();
            }
        });
    },

    start(initialItem) {
        if (State.isSelectionModeActive) return;

        const event = State.contextEvent;
        if (!event) {
            UI.showToast("Cannot start selection: context is missing.", "error");
            return;
        }

        State.isSelectionModeActive = true;
        this.toggle(initialItem); 
        this.showMenu(event);
        UI.showToast("Selection mode started.", "info");
    },

    end() {
        if (!State.isSelectionModeActive) return;

        State.isSelectionModeActive = false;
        this.hideMenu();

        State.selectedItems.forEach(uniquePath => {
            const entry = State.domItemMap.get(uniquePath);
            if (entry?.el) {
                entry.el.classList.remove('selected');
            }
        });
        State.selectedItems.clear();
        UI.showToast("Selection canceled.", "info");
    },

    toggle(item) {
        if (!item) return;

        const uniquePath = getItemUniquePath(item); 
        const entry = State.domItemMap.get(uniquePath);
        if (!entry?.el) return;

        if (State.selectedItems.has(uniquePath)) {
            State.selectedItems.delete(uniquePath);
            entry.el.classList.remove('selected');
        } else {
            State.selectedItems.add(uniquePath);
            entry.el.classList.add('selected');
        }

        this.updateMenu();
    },

    showMenu(event) {
        DOM.selectionMenu.classList.add('visible');
        this.updateMenu();
        // Position must happen AFTER it's visible to get dimensions, 
        // but before it paints to avoid jumpiness.
        requestAnimationFrame(() => this.positionMenu(event));
    },

    hideMenu() {
        DOM.selectionMenu.classList.remove('visible');
    },

    updateMenu() {
        const count = State.selectedItems.size;
        const selectedPaths = Array.from(State.selectedItems);
        
        let namesHtml = '';
        if (count > 0) {
            const maxNames = 5;
            const names = selectedPaths.map(path => {
                const item = State.domItemMap.get(path)?.item;
                return item ? item.name : 'Unknown';
            });
            
            const displayNames = names.slice(0, maxNames);
            namesHtml = `<div class="selection-names">`;
            displayNames.forEach(name => {
                namesHtml += `<div class="selection-name-item">${name}</div>`;
            });
            if (count > maxNames) {
                namesHtml += `<div class="selection-more-count">+ ${count - maxNames} others</div>`;
            }
            namesHtml += `</div>`;
        }

        DOM.selectionMenu.innerHTML = /*html*/ `
            <div class="selection-header">
                <span class="selection-count">${count} Item${count === 1 ? '' : 's'}</span>
                ${namesHtml}
            </div>
            
            <div class="selection-actions">
                <button class="menu-button" data-action="copy-selection" title="Copy Selected Items" ${count === 0 ? 'disabled' : ''}>
                    <svg class="svg-icon"><use href="#icon-copy"></use></svg>
                    <span class="menu-button-label">Copy Paths</span>
                </button>
                
                <button class="menu-button" data-action="copy-contents-selection" title="Copy Contents as Markdown" ${count === 0 ? 'disabled' : ''}>
                    <svg class="svg-icon"><use href="#icon-clipboard"></use></svg>
                    <span class="menu-button-label">Copy Contents (MD)</span>
                </button>
                
                <button class="menu-button" data-action="copy-zip-selection" title="Copy as ZIP" ${count === 0 ? 'disabled' : ''}>
                    <svg class="svg-icon"><use href="#icon-save"></use></svg> 
                    <span class="menu-button-label">Copy as ZIP</span>
                </button>
                
                <button class="menu-button" data-action="download-zip-selection" title="Download ZIP" ${count === 0 ? 'disabled' : ''}>
                    <svg class="svg-icon"><use href="#icon-download"></use></svg> 
                    <span class="menu-button-label">Download ZIP</span>
                </button>

                <button class="menu-button danger" data-action="delete-selection" title="Delete Selected Items" ${count === 0 ? 'disabled' : ''}>
                    <svg class="svg-icon"><use href="#icon-trash"></use></svg>
                     <span class="menu-button-label">Delete Selected</span>
                </button>
                
                 <hr class="menu-separator">

                <button class="menu-button" data-action="cancel-selection" title="Cancel Selection">
                    <svg class="svg-icon"><use href="#icon-x"></use></svg>
                    <span class="menu-button-label">Cancel</span>
                </button>
            </div>
        `;
    },
    
    positionMenu(event) {
        if (!event) event = { clientX: window.innerWidth / 2, clientY: window.innerHeight / 2 };

        const menu = DOM.selectionMenu;
        const rect = menu.getBoundingClientRect();
        const winW = window.innerWidth;
        const winH = window.innerHeight;

        let x = event.clientX + 10;
        let y = event.clientY + 10;

        // Smart Horizontal Positioning
        if (x + rect.width > winW - 10) {
            x = event.clientX - rect.width - 10;
        }
        
        // Safety: Prevent going off left edge
        if (x < 10) x = 10;

        // Smart Vertical Positioning (Up vs Down)
        if (y + rect.height > winH - 10) {
            // Check if it fits ABOVE the cursor
            const spaceAbove = event.clientY - 10;
            if (spaceAbove > rect.height) {
                y = event.clientY - rect.height - 10;
            } else {
                // If it doesn't fit above OR below perfectly, force it to fit within screen
                // but prioritize seeing the top of the menu if possible, or pin to bottom
                y = winH - rect.height - 10;
                if (y < 10) y = 10; // Top constraint
            }
        }

        menu.style.left = `${x}px`;
        menu.style.top = `${y}px`;
    }
};