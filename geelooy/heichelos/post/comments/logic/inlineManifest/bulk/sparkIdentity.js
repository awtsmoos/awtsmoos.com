/**
 * B"H
 * @module InlineBulkSparkIdentity
 * @description
 * Every spark needs a name before it can stand in the DOM. When the API does
 * not hand us one, this module burns a stable signature from its content.
 */

/**
 * Creates a deterministic base36 hash from text.
 * @param {string} str Textual essence to hash.
 * @returns {string} Stable positive hash.
 */
export function generateSparkHash(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash;
    }
    return Math.abs(hash).toString(36);
}

/**
 * Ensures a spark has a DOM-safe identity and author before rendering.
 * @param {object} spark Mutable comment spark.
 * @param {string} alias Commentator alias.
 * @returns {object} The same spark, named and author-filled.
 */
export function ensureSparkIdentity(spark, alias) {
    const trueId = spark.id || spark.commentId || spark.postId;
    const verseKey = spark.dayuh?.verseSection ?? "root";
    const text = JSON.stringify(spark.content || "");
    spark.id = trueId || `awtsmoos-${generateSparkHash(text)}-${verseKey}`;
    if (!spark.author) spark.author = alias;
    return spark;
}
