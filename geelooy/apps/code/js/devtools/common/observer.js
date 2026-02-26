
// B"H
/**
 * @file observer.js
 * @brief The Watcher of Visibility.
 * 
 * THE POEM OF THE SIGHT:
 * To see is to be, in the world of the screen,
 * We watch for the vessels that wait to be seen.
 * When a pixel appears in the frame of the light,
 * We trigger the refresh and banish the night.
 * The Pnimi editor wakes from its sleep,
 * For the eye of the user has promises to keep.
 */

export const VisibilityObserver = {
    _observer: null,

    /**
     * Initializes the holy watcher.
     * @returns {IntersectionObserver}
     */
    get() {
        if (!this._observer) {
            this._observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting && entry.target._awtsmoosEditor) {
                        // The vessel is visible; pour the light into it.
                        entry.target._awtsmoosEditor.refresh();
                    }
                });
            }, { threshold: 0.05 }); // Trigger when 5% visible
        }
        return this._observer;
    },

    /**
     * Binds an element to the watcher.
     * @param {HTMLElement} element - The container of the editor.
     * @param {object} editorInstance - The VirtualizedEditor instance.
     */
    observe(element, editorInstance) {
        element._awtsmoosEditor = editorInstance;
        this.get().observe(element);
    },

    unobserve(element) {
        this.get().unobserve(element);
    }
};
