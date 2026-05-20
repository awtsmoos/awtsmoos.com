/**
 * B"H
 * @module InlineBulkCoordinate
 * @description
 * The Awtsmoos reveals every comment through coordinates. This vessel keeps
 * those coordinates honest, parsed, and ranked before DOM placement.
 */

/**
 * Normalizes the many coordinate spellings emitted by comment APIs.
 * @param {any} spark Comment object from the API.
 * @param {string|number|null} defaultVerseSection Verse requested by the loader.
 * @returns {object} Mutable dayuh coordinate vessel.
 */
export function normalizeSparkDayuh(spark, defaultVerseSection) {
    if (!spark || typeof spark !== "object") return { verseSection: defaultVerseSection };

    let dayuh = spark.dayuh;
    if (typeof dayuh === "string") {
        try { dayuh = JSON.parse(dayuh); } catch { dayuh = {}; }
    }
    if (!dayuh || typeof dayuh !== "object") dayuh = {};

    if (dayuh.verseSection === undefined || dayuh.verseSection === null) {
        if (spark.verseSection !== undefined && spark.verseSection !== null) dayuh.verseSection = spark.verseSection;
        else dayuh.verseSection = defaultVerseSection;
    }

    if (dayuh.subSection === undefined || dayuh.subSection === null) {
        if (spark.subSection !== undefined && spark.subSection !== null) dayuh.subSection = spark.subSection;
        else if (spark.sub !== undefined && spark.sub !== null) dayuh.subSection = spark.sub;
        else if (spark.sectionSub !== undefined && spark.sectionSub !== null) dayuh.subSection = spark.sectionSub;
    }

    return dayuh;
}

/**
 * Scores coordinate confidence so duplicates choose the truest vessel.
 * @param {object} spark Candidate comment spark.
 * @returns {number} Confidence score.
 */
export function scoreInlineCoordinate(spark) {
    const dayuh = spark?.dayuh || {};
    let score = 0;
    if (dayuh.verseSection !== undefined && dayuh.verseSection !== null && dayuh.verseSection !== "root") score += 2;
    if (dayuh.subSection !== undefined && dayuh.subSection !== null && dayuh.subSection !== "main") score += 3;
    if (spark?.verseSection !== undefined && spark.verseSection !== null) score += 2;
    if (spark?.subSection !== undefined && spark.subSection !== null) score += 3;
    return score;
}

/**
 * Chooses the better duplicate when mapped API responses echo one ID twice.
 * @param {object|undefined} existing Existing retained spark.
 * @param {object} incoming New candidate spark.
 * @returns {object} The spark whose coordinate should rule placement.
 */
export function chooseTruestDuplicateSpark(existing, incoming) {
    if (!existing) return incoming;
    return scoreInlineCoordinate(incoming) > scoreInlineCoordinate(existing) ? incoming : existing;
}
