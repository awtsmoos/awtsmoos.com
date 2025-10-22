// B"H
// FILE: js/selection-manager.js

import { State, DOM } from './state.js';
import { UI } from './ui.js';
import { Workspaces, getItemUniquePath } from './workspaces.js'; 

import { FileOperations } from './file-operations.js';

// Get the menu element (we'll need to add it to DOM in state.js)
let selectionMenuEl;
let selectionCountEl;

// The main object to export
export const SelectionManager = {
    initialize() {
        // Find our new HTML element
        DOM.selectionMenu = document.getElementById('selection-menu');

        // This listener will handle clicks on the menu's buttons
        DOM.selectionMenu.addEventListener('click', e => {
            e.stopPropagation()
            
            const button = e.target.closest('button');
            if (!button) return;
            const action = button.dataset.action;

            if (action === 'copy-selection') {
                FileOperations.copySelected();
            } else if (action === 'cancel-selection') {
                this.end();
            }
        });
    },

    start(initialItem, event) {
        if (State.isSelectionModeActive) return; // Already active

        State.isSelectionModeActive = true;
        this.toggle(initialItem); // Select the first item
        this.showMenu(event);
        
        UI.showToast("Selection mode started.", "info");
    },

    end() {
        if (!State.isSelectionModeActive) return;

        State.isSelectionModeActive = false;
        this.hideMenu();

        // Visually deselect all items
        State.selectedItems.forEach(uniquePath => {
            const entry = State.domItemMap.get(uniquePath);
            if (entry?.el) {
                entry.el.classList.remove('selected');
            }
        });
        State.selectedItems.clear();
        UI.showToast("Selection canceled.", "info");
    },

    // The core logic for selecting/deselecting an item
    // B"H
// FILE: js/selection-manager.js
// ACTION: Replace the ENTIRE toggle function with this one.

toggle(item) {
    if (!item) return;

    const uniquePath = getItemUniquePath(item); // Note: getItemUniquePath, not from Workspaces
    const entry = State.domItemMap.get(uniquePath);
    if (!entry?.el) return;

    // This is much simpler. If selected, deselect. If not selected, select.
    if (State.selectedItems.has(uniquePath)) {
        State.selectedItems.delete(uniquePath);
        entry.el.classList.remove('selected');
    } else {
        State.selectedItems.add(uniquePath);
        entry.el.classList.add('selected');
    }

    this.updateMenu();
},

    // --- UI Functions for the Sticky Menu ---
    showMenu(event) {
        DOM.selectionMenu.classList.add('visible');
        this.positionMenu(event);
        this.updateMenu();
    },

    hideMenu() {
        DOM.selectionMenu.classList.remove('visible');
    },

    updateMenu() {
        const count = State.selectedItems.size;
        DOM.selectionMenu.innerHTML = `
            <span class="selection-count">${count} item${count === 1 ? '' : 's'} selected</span>
            <hr class="menu-separator">
            <button class="menu-button" data-action="copy-selection" title="Copy Selected Items" ${count === 0 ? 'disabled' : ''}>
                <svg class="svg-icon"><use href="#icon-copy"></use></svg> Copy
            </button>
            <button class="menu-button" data-action="cancel-selection" title="Cancel Selection">
                <svg class="svg-icon"><use href="#icon-x"></use></svg> Cancel
            </button>
        `;
    },
    
    positionMenu(event) {
        const { clientX: x, clientY: y } = event;
        const menu = DOM.selectionMenu;
        const menuRect = menu.getBoundingClientRect();

        // Position it slightly above the cursor/right-click point
        const adjustedX = (x + menuRect.width > window.innerWidth) ? window.innerWidth - menuRect.width - 10 : x;
        const adjustedY = y - menuRect.height - 10 < 0 ? y + 15 : y - menuRect.height - 10;
        
        menu.style.left = `${adjustedX}px`;
        menu.style.top = `${adjustedY}px`;
    }
};