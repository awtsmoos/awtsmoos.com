
// B"H
import { SelectionState } from './state.js';
import { SelectionUI } from './ui.js';
import { SelectionDOM } from './dom-sync.js';
import { SelectionActions } from './actions.js';
import { State, DOM } from '../state.js';

export const SelectionManager = {
    initialize() {
        if (!DOM.selectionMenu) return;
        if (DOM.selectionMenu.dataset.bound) return;
        DOM.selectionMenu.addEventListener('click', e => {
            const btn = e.target.closest('button');
            if (btn?.dataset.action) SelectionActions.handle(btn.dataset.action, () => this.end());
        });
        DOM.selectionMenu.dataset.bound = "true";
    },
    start(item) {
        this.initialize();
        if (SelectionState.isActive()) { if (item) this.toggle(item); return; }
        SelectionState.start();
        if (item) this.toggle(item);
        const evt = State.contextEvent;
        SelectionUI.showAt(evt?.clientX || window.innerWidth/2, evt?.clientY || window.innerHeight/2, SelectionState.count());
    },
    end() { SelectionUI.hide(); SelectionDOM.clearAll(State.domItemMap); SelectionState.end(); },
    toggle(item) {
        SelectionState.toggle(item);
        SelectionDOM.refresh(State.selectedItems, State.domItemMap);
        SelectionUI.updateContent(SelectionState.count());
    },
    add(item) { 
        SelectionState.add(item); 
        SelectionDOM.refresh(State.selectedItems, State.domItemMap); 
        SelectionUI.updateContent(SelectionState.count()); 
    },
    refreshVisuals() {
        SelectionDOM.refresh(State.selectedItems, State.domItemMap);
    }
};
