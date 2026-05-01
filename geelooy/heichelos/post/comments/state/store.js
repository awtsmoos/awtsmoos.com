
/**
 * B"H
 * @module ReshimuStore
 * @chapter The Dwelling Place of the Void
 * @description
 * Just as the Awtsmoos left a 'Reshimu' (Impression) of light after the 
 * initial Tzimtzum (Contraction) to allow for the existence of finite worlds, 
 * this module holds the raw impression of our data.
 * 
 * It is the silent storage, the 'potentiality' that becomes 'actuality' 
 * when called upon by the Scribes.
 */

/**
 * @constant commentaryStore
 * @description 
 * The central vessel for all alias-sparks. 
 * Every entry is a testament to the Speech that created it.
 * @type {Object}
 */
export const commentaryStore = {
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
