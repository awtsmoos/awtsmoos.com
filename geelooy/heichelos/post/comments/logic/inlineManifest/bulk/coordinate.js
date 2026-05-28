/**
 * B"H
 * @module InlineBulkCoordinate
 * @description
 * Chapter 2: The Awtsmoos cuts away the painted masks. A spark is paragraph-
 * specific only when its own dayuh vessel says `subSection`; every other echo
 * falls silent and the spark gathers once at verse-end.
 */

import {
    buildRealPlacementDayuh,
    getRealCommentSubSection,
    parseRealDayuh
} from "../realCommentCoordinate.js";

/**
 * Normalizes placement metadata without copying poisoned top-level subsection
 * fields into dayuh.
 * @param {object} spark Comment spark from the API.
 * @param {string|number|null} defaultVerseSection Verse requested by loader.
 * @returns {object} Clean dayuh object.
 */
export function normalizeSparkDayuh(spark, defaultVerseSection) {
    if (!spark || typeof spark !== "object") return { verseSection: defaultVerseSection };
    const dayuh = buildRealPlacementDayuh(spark, defaultVerseSection);
    spark.dayuh = dayuh;
    return dayuh;
}

/**
 * Scores a spark by the truth of its own coordinate, not wrapper noise.
 * @param {object} spark Comment spark.
 * @returns {number} Truth score.
 */
export function scoreInlineCoordinate(spark) {
    const dayuh = parseRealDayuh(spark?.dayuh);
    let score = 0;
    if (dayuh.verseSection !== undefined && dayuh.verseSection !== null && dayuh.verseSection !== "root") score += 2;
    if (getRealCommentSubSection({ dayuh }) !== null) score += 3;
    return score;
}

/**
 * Keeps the duplicate whose coordinate is most explicit.
 * @param {object|null} existing Existing spark.
 * @param {object} incoming Incoming spark.
 * @returns {object} Selected spark.
 */
export function chooseTruestDuplicateSpark(existing, incoming) {
    if (!existing) return incoming;
    return scoreInlineCoordinate(incoming) > scoreInlineCoordinate(existing) ? incoming : existing;
}
