
// B"H
// FILE: js/menus/index.js

import { State } from '../state.js';
// B"H - Rectified Import Path: Explicitly pointing to index.js
import { Actions } from '../actions/index.js'; 
import { Tabs } from '../tabs/index.js';
import { VibeController } from '../vibe/vibe-controller.js';

import { MenuUI } from './ui.js';
import { ContextMenu } from './context.js';
import { MainMenu } from './main.js';
import { TabMenus } from './tabs.js';

export const Menus = {
    registerCustomMenus(menuConfigs) {
        if (!Array.isArray(menuConfigs)) return;
        State.customMenus = menuConfigs;
    },

    // Delegations
    handleDocumentClick: MenuUI.handleDocumentClick,
    hideAll: MenuUI.hideAll,
    
    show: ContextMenu.show.bind(ContextMenu),
    showZipMenu: ContextMenu.showZipMenu.bind(ContextMenu),
    
    showMainMenu: MainMenu.show.bind(MainMenu),
    
    showTabMenu: TabMenus.showTabMenu.bind(TabMenus),
    revealInWorkspace: TabMenus.revealInWorkspace.bind(TabMenus),

    handleAction(action) {
        this.hideAll();
        if (action === 'open-vibe') {
            VibeController.init();
            VibeController.open(State.contextTarget);
        } else if (action === 'reveal-in-workspace') {
            this.revealInWorkspace(State.contextTabTarget);
        } else if (action === 'close-tab-direct') {
            if (State.contextTabTarget) Tabs.close(State.contextTabTarget.id);
        } else {
            Actions.handle(action);
        }
    }
};
