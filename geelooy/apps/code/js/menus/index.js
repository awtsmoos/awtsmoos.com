
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

    // B"H - THE GRAND RECTIFICATION: Point directly to the true Actions Nexus.
    handleAction(action) {
        this.hideAll();
        import('../actions/index.js').then(m => {
            m.Actions.handle(action, State.contextTarget);
        });
    }
};
