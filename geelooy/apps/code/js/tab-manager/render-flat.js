
// B"H
import { State } from '../state.js';
import { TMUI } from './ui.js';

export const TMFlatRenderer = {
    render(container, filter, onInteract, onContext) {
        State.tabs.forEach((tab, index) => {
            if (filter && !tab.item.name.toLowerCase().includes(filter)) return;
            container.appendChild(TMUI.createCard(tab, index, true, onInteract, onContext));
        });
    }
};
