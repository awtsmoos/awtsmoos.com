
// B"H
/**
 * @module HistoryManager
 * @description
 * The Divine Navigator (Merkavah) of URL and State.
 *
 * This module ensures that the "Way" is always known. It maps the 
 * internal navigation state to the browser's URL, allowing for 
 * deep-linking and state preservation across refreshes.
 *
 * "The path is set, the goal is clear; the Way is known, both far and near."
 */
import { AppStore } from '../../state/store.js';

export const HistoryManager = {
    /**
     * B"H
     * Captures the current state and projects it onto the URL.
     */
    sync() {
        const { currentPage, activeChatId, viewingUserId } = AppStore.navigation;
        const { activePostId, activeThreadId } = AppStore;

        let path = `#/${currentPage}`;
        
        if (currentPage === 'profile' && viewingUserId) path += `/u/${viewingUserId}`;
        if (activePostId) path += `/post/${activePostId}`;
        if (activeThreadId) path += `/thread/${activeThreadId}`;
        if (activeChatId) path += `/chat/${activeChatId}`;

        if (window.location.hash !== path) {
            window.history.pushState({ 
                page: currentPage, 
                user: viewingUserId,
                post: activePostId,
                thread: activeThreadId,
                chat: activeChatId
            }, '', path);
        }
    },

    /**
     * B"H
     * Interprets the URL and restores the internal state.
     */
    restore() {
        const hash = window.location.hash || '#/home';
        const parts = hash.split('/').filter(Boolean);
        
        // Basic Page Routing
        if (parts[0]) AppStore.navigation.currentPage = parts[0].replace('#', '');

        // Contextual Restoration
        for (let i = 0; i < parts.length; i++) {
            if (parts[i] === 'u') AppStore.navigation.viewingUserId = parts[i+1];
            if (parts[i] === 'post') AppStore.activePostId = parts[i+1];
            if (parts[i] === 'thread') AppStore.activeThreadId = parts[i+1];
            if (parts[i] === 'chat') AppStore.navigation.activeChatId = parts[i+1];
        }

        console.log("B\"H - State restored from Path:", hash);
    }
};

// Listen for the back-and-forth flow of history
window.addEventListener('popstate', () => {
    HistoryManager.restore();
    if (window.AppGlobals && window.AppGlobals.render) window.AppGlobals.render();
});
