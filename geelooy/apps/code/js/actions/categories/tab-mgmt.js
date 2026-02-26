
// B"H
import { ViewActions } from '../view.js';
import { State } from '../../state.js'; // B"H - THE FIX IS HERE
import { Tabs } from '../../tabs/index.js';
import { FullscreenManager } from '../../app/fullscreen-manager.js';

export const TAB_MANAGEMENT_ACTIONS = {
    'close-other-tabs': () => ViewActions.closeOtherTabs(),
    'close-all-tabs': () => ViewActions.closeAllTabs(),
    'reopen-closed-tab': () => ViewActions.reopenClosedTab(),
    'file-properties': (ctx) => ViewActions.fileProperties(ctx?.item || ctx?.payload?.item || ctx),
    'toggle-pin': () => {
        const tab = State.contextTabTarget;
        if (tab) {
            tab.pinned = !tab.pinned;
            Tabs.render();
        }
    },
    'close-tab-direct': (ctx) => {
        const id = ctx?.tabId || State.activeTabId;
        if(id) Tabs.close(id);
    },
    'fullscreen-tab': () => {
        FullscreenManager.toggleActiveTab();
    }
};
