
// B"H
// FILE: js/menus/index.js

import { State } from '../state.js';
import { MenuUI } from './ui.js';
import { ContextMenu } from './context.js';
import { MainMenu } from './main.js';
import { TabMenus } from './tabs.js';

/**
 * --- MENUS FACADE ---
 * The central point for revealing menus. It delegates the handling of
 * commands directly to the Master Actions Nexus.
 */
export const Menus = {
    hideAll: MenuUI.hideAll,
    show: (e, item) => ContextMenu.show(e, item),
    showMainMenu: (e) => MainMenu.show(e),
    showTabMenu: (e, tab) => TabMenus.showTabMenu(e, tab),

    // B"H - THE GRAND RECTIFICATION: 
    // We now harvest the target from either the global context or the tab context,
    // ensuring no spark of intent is lost to the void.
    handleAction(action) {
        this.hideAll();
        
        // Determine the true target. Tab context takes precedence if it exists, otherwise general context.
        let trueTarget = State.contextTarget;
        if (!trueTarget && State.contextTabTarget && State.contextTabTarget.item) {
            trueTarget = State.contextTabTarget.item;
        }

        import('../actions/index.js').then(m => {
            m.Actions.handle(action, trueTarget);
        });
    }
};
