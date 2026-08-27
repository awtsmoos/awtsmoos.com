
// B"H
/**
 * @file indexer/tokenizer.js
 * @description
 *  The Scribe of Word-Sparks.
 *  This angel's sole purpose is to take the continuous flow of speech and 
 *  shatter it into its atomic components—the individual words. It purifies 
 *  them, casting them to lowercase and discarding the silent void between them, 
 *  so they can be indexed in the Great Book of Names.
 */
module.exports = {
    /**
     * @function tokenize
     * @description
     *  Shatters a string into a unique set of lowercase alphanumeric tokens.
     * @param {string} text The continuous flow of speech.
     * @returns {Set<string>} The unique sparks of language.
     */
    tokenize(text) {
        if (!text) return new Set();
        const str = String(text).toLowerCase();
        const tokens = str.split(/[^a-z0-9]+/);
        const set = new Set();
        for (const t of tokens) {
            if (t.length > 0) set.add(t);
        }
        return set;
    }
};
