
// B"H
/**
 * @module ThreadActions
 */
import { AppStore } from '../../store.js';
import { HistoryManager } from '../../../core/routing/HistoryManager.js';

export const ThreadActions = {
    navigateToThread(commentId) {
        AppStore.activeThreadId = commentId;
        HistoryManager.sync();
        if (window.AppGlobals && window.AppGlobals.render) window.AppGlobals.render();
    },

    exitThread() {
        AppStore.activeThreadId = null;
        HistoryManager.sync();
        if (window.AppGlobals && window.AppGlobals.render) window.AppGlobals.render();
    }
};
