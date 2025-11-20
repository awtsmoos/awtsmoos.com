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
            } else if (action === 'copy-contents-selection') {
                const itemsToCopy = Array.from(State.selectedItems)
                    .map(path => State.domItemMap.get(path)?.item)
                    .filter(Boolean); // Filters out any undefined items

                if (itemsToCopy.length > 0) {
                    FileOperations.copyAllContents(itemsToCopy);
                }
                this.end(); 
                // End selection mode after copying
            

            } else if (action === 'delete-selection') { // <-- ADD THIS ELSE IF BLOCK
                // Delegate the complex deletion logic to FileOperations
                FileOperations.deleteSelected();
            } else if (action === 'cancel-selection') {
                this.end();
            }
        });
    },

    /*B"H*/
// ACTION: Replace the 'start' method in selection-manager.js.

/**
 * Begins the selection process. This is the definitive, healed version.
 * It is now self-reliant, fetching the original right-click event directly
 * from the application's State. It then immediately selects the initial item
 * and summons the selection menu, restoring all expected behavior.
 * @param {object} initialItem - The first item to be selected.
 */
start(initialItem) {
    if (State.isSelectionModeActive) return;

    // We fetch the sacred event from memory, not from a parameter.
    const event = State.contextEvent;
    if (!event) {
        UI.showToast("Cannot start selection: context is missing.", "error");
        console.error("SelectionManager.start failed: State.contextEvent is null.");
        return;
    }

    State.isSelectionModeActive = true;
    
    // THE EXPECTED BEHAVIOR, RESTORED:
    // We immediately toggle the first item, making it selected.
    this.toggle(initialItem); 
    
    // We summon the menu, passing the true event.
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
        DOM.selectionMenu.innerHTML = /*html*/ `
            <span class="selection-count">${count} item${count === 1 ? '' : 's'} selected</span>
            <hr class="menu-separator">
            <button class="menu-button" data-action="copy-selection" title="Copy Selected Items" ${count === 0 ? 'disabled' : ''}>
                <svg class="svg-icon"><use href="#icon-copy"></use></svg><span class="menu-button-label"> Copy</span>
            </button>
            
            <!-- V-- ADD THIS BUTTON --V -->
            <button class="menu-button" data-action="copy-contents-selection" title="Copy Contents of Selected Items" ${count === 0 ? 'disabled' : ''}>
                <svg class="svg-icon"><use href="#icon-clipboard"></use></svg><span class="menu-button-label"> Copy Contents</span>
            </button>
            <!-- ^-- END OF ADDITION --^ -->

            <button class="menu-button danger" data-action="delete-selection" title="Delete Selected Items" ${count === 0 ? 'disabled' : ''}>
                <svg class="svg-icon"><use href="#icon-trash"></use></svg><span class="menu-button-label"> Delete</span>
            </button>
            <button class="menu-button" data-action="cancel-selection" title="Cancel Selection">
                <svg class="svg-icon"><use href="#icon-x"></use></svg><span class="menu-button-label"> Cancel</span>
            </button>
        `;
    },
    
    /*B"H*/
// ACTION: Replace the 'positionMenu' method in js/selection-manager.js.

/**
 * Positions the selection menu. This is the definitive fix. It no longer trusts
 * the 'event' parameter passed to it. Instead, it reads the true, original
 * event directly from the application's State, where it was stored at the
 * moment of the right-click. This makes it immune to the broken chain of
 * communication and permanently resolves the "event is null" error.
 */
positionMenu() {
    // We ignore any event passed as a parameter and go to the source of truth.
    const event = State.contextEvent;
    
    // A safety check, a moment of caution before acting.
    if (!event) {
        console.error("Cannot position selection menu; the context event was not found in the State.");
        return;
    }

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