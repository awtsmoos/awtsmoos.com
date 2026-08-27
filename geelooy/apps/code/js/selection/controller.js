
// B"H
import { State, DOM } from '../state.js';
import { UI } from '../ui.js';
import { SelectionState } from './state.js';
import { SelectionUI } from './ui.js';
import { SelectionDOM } from './dom-sync.js';
import { SelectionActions } from './actions.js';

export const SelectionController = {
    init() {
        if (!DOM.selectionMenu) return;
        DOM.selectionMenu.addEventListener('click', e => {
            const action = e.target.closest('button')?.dataset.action;
            if (action) SelectionActions.handle(action, () => this.end());
        });
    },

    start(initialItem) {
        if (SelectionState.isActive) {
            if (initialItem) this.toggle(initialItem);
            return;
        }
        
        SelectionState.start();
        if (initialItem) this.toggle(initialItem);
        
        const evt = State.contextEvent;
        SelectionUI.show(SelectionState.count);
        SelectionUI.position(evt?.clientX || window.innerWidth/2, evt?.clientY || window.innerHeight/2);
    },

    end() {
        SelectionUI.hide();
        SelectionState.end();
        SelectionDOM.refreshAll(); // Ensure all visuals are cleared
    },

    toggle(item) {
        SelectionState.toggle(item);
        SelectionDOM.toggle(item);
        SelectionUI.updateContent(SelectionState.count);
    },

    add(item) {
        SelectionState.add(item);
        SelectionDOM.add(item);
        SelectionUI.updateContent(SelectionState.count);
    },
    
    refreshVisuals: SelectionDOM.refreshAll
};
