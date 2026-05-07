
/**
 * B"H
 * @module ReshimuStore
 * @chapter The Dwelling Place of the Record
 * @description
 * This module holds the 'Reshimu' (Impression) of the data. 
 * We have added the 'masterCommentCache' to store all comments for the 
 * current post, ensuring that both the Sidebar and the Margins draw 
 * from the same unified pool of Light.
 */

/**
 * @constant commentaryStore
 * @description 
 * The central vessel for all alias-sparks. 
 * Every entry is a testament to the Speech that created it.
 * @type {Object}
 */
export const commentaryStore = {
    /** 
     * @type {Array|null} 
     * B"H - Master list of every comment for the current post.
     */
    masterCommentCache: null,

    /** @type {Object|null} */
    aliases: null,

    /** @type {Object} */
    loadedInlineVerses: {}
};

/**
 * @function getAliasesFromStore
 * @description Retrieves the Guardians of Speech currently manifest in the store.
 * @returns {Object|null}
 */
export function getAliasesFromStore() {
    return commentaryStore.aliases;
}
