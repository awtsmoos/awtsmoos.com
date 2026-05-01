
/**
 * B"H
 * @module StatePurifier
 * @chapter The Dissolution of Old Vessels
 * @description
 * Creation is a constant, instantaneous renewal. "He refreshes 
 * every day the work of creation." This module implements the constant 
 * refreshment of memory, ensuring no outdated shell (Kelipah) 
 * blocks the flow of new insights.
 */

import { commentaryStore } from "./store.js";

/**
 * @function invalidateVerseCache
 * @description 
 * Clears the staleness from the record of a specific Verse. 
 * Recreates the space for new Truth to manifest.
 * 
 * @param {string|number} verseSection - The coordinate to purify.
 * @param {Object} [post=null] - The context of the post.
 */
export function invalidateVerseCache(verseSection, post = null) {
    const activePost = post || window.post;
    const verseKey = (verseSection === null || verseSection === undefined) ? "root" : verseSection;

    console.log(`B"H - [State Purifier] Refining vessels for coordinate: ${verseKey}`);

    // 1. Purifying the Main Memory (commentaryStore)
    if (commentaryStore.aliases) {
        Object.keys(commentaryStore.aliases).forEach(key => {
            if (key.startsWith(`${verseKey}-`)) {
                delete commentaryStore.aliases[key];
            }
        });
        delete commentaryStore.aliases[verseKey];
    }
    
    // 2. Purifying the Inline Shadows
    const inlinePrefix = `loaded-${verseKey}-`;
    Object.keys(commentaryStore.loadedInlineVerses).forEach(k => {
        if (k.startsWith(inlinePrefix)) {
            delete commentaryStore.loadedInlineVerses[k];
        }
    });

    // 3. Purifying the External Cache Vessels (API Utilities)
    cleanGlobalCaches(activePost, verseKey);
}

/**
 * @private
 * @function cleanGlobalCaches
 */
function cleanGlobalCaches(post, vk) {
    const hId = post?.heichel?.id;
    const pId = post?.id;
    const sId = post?.parentSeriesId;

    if (!hId || !pId) return;

    // Purge Alias Cache
    const aliasCache = window.aliasCommentsCache?.heichelos?.[hId]?.series?.[sId]?.posts?.[pId];
    if (aliasCache?.verseSections?.[vk]) delete aliasCache.verseSections[vk];
    
    // Purge Content Cache
    const commentsCache = window.commentsOfAliasCache?.heichelos?.[hId]?.series?.[sId]?.posts?.[pId];
    if (commentsCache?.aliases) {
        for (const alias in commentsCache.aliases) {
            if (commentsCache.aliases[alias].verseSections?.[vk]) {
                delete commentsCache.aliases[alias].verseSections[vk];
            }
        }
    }
}
