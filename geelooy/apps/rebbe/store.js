//B"H
/**
 * B"H
 * Root store doorway. One vessel only: every caller reaches the same IndexedDB
 * module instance, so bookmarks, search history, cache, and scrolls share breath.
 */
export * from './modules/store.js';
