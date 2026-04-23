
// B"H
import { State } from '../state.js';
import { getItemUniquePath } from '../workspaces/index.js';

export const SelectionState = {
    isActive: () => State.isSelectionModeActive,
    start: () => State.isSelectionModeActive = true,
    end: () => { State.isSelectionModeActive = false; State.selectedItems.clear(); },
    count: () => State.selectedItems.size,
    toggle(item) {
        const key = getItemUniquePath(item);
        if (State.selectedItems.has(key)) State.selectedItems.delete(key);
        else State.selectedItems.set(key, item);
    },
    add(item) { State.selectedItems.set(getItemUniquePath(item), item); },
    getItems: () => Array.from(State.selectedItems.values())
};
