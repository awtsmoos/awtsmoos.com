
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
 * commands to the Dispatcher to prevent circular dependencies.
 */
export const Menus = {
    hideAll: MenuUI.hideAll,
    show: (e, item) => ContextMenu.show(e, item),
    showMainMenu: (e) => MainMenu.show(e),
    showTabMenu: (e, tab) => TabMenus.showTabMenu(e, tab),

    // This is the nexus point. All menu clicks lead here.
    handleAction(action) {
        this.hideAll();
        // Dynamically import the dispatcher to execute the action.
        // This late binding is the key to architectural purity.
        import('../actions/dispatcher.js').then(m => {
            m.Dispatcher.handle(action, State.contextTarget);
        });
    }
};
