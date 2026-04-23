
// B"H
/**
 * @file dom-cache.js
 * @brief A localized census of the Vibe View's physical vessels.
 */
export const VibeDOMCache = {
    _cache: {},

    /**
     * @function populate
     * @description Scans for the required DOM nodes.
     * @returns {boolean} True if all vessels are found.
     */
    populate(container) {
        this._cache.container = container;
        this._cache.sendBtn = container.querySelector('#vibe-send-btn');
        this._cache.tokenBtn = container.querySelector('#vibe-token-btn');
        this._cache.resetBtn = container.querySelector('#vibe-reset-btn');
        this._cache.mgrBtn = container.querySelector('#vibe-mgr-btn');
        this._cache.sidebarToggle = container.querySelector('#vibe-sidebar-toggle-btn');
        this._cache.tabs = container.querySelectorAll('.vibe-sb-tab');
        
        return this._cache.sendBtn && this._cache.tokenBtn && this._cache.tabs.length > 0;
    },

    get(key) {
        return this._cache[key];
    }
};
