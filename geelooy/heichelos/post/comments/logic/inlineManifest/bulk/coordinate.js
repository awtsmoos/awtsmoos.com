/**
 * B"H
 * @module InlineBulkCoordinate
 * @description
 * Coordinates must remain truthful. A comment is subsection-specific only when
 * its own `dayuh.subSection` says so. Request metadata, URL sub values, mapped
 * wrapper fields, or old top-level echoes must not promote a verse-level note
 * into every paragraph.
 */

function parseDayuh(raw) {
    if (!raw) return {};
    if (typeof raw === "string") {
        try { return JSON.parse(raw) || {}; } catch { return {}; }
    }
    return typeof raw === "object" ? raw : {};
}

function hasOwnSpecificSub(dayuh) {
    return Object.prototype.hasOwnProperty.call(dayuh, "subSection")
        && dayuh.subSection !== undefined
        && dayuh.subSection !== null
        && dayuh.subSection !== ""
        && dayuh.subSection !== "main"
        && dayuh.subSection !== "root";
}

export function normalizeSparkDayuh(spark, defaultVerseSection) {
    if (!spark || typeof spark !== "object") return { verseSection: defaultVerseSection };

    const dayuh = parseDayuh(spark.dayuh);
    if (dayuh.verseSection === undefined || dayuh.verseSection === null) {
        if (spark.verseSection !== undefined && spark.verseSection !== null) dayuh.verseSection = spark.verseSection;
        else dayuh.verseSection = defaultVerseSection;
    }

    if (!hasOwnSpecificSub(dayuh)) delete dayuh.subSection;
    spark.dayuh = dayuh;
    return dayuh;
}

export function scoreInlineCoordinate(spark) {
    const dayuh = parseDayuh(spark?.dayuh);
    let score = 0;
    if (dayuh.verseSection !== undefined && dayuh.verseSection !== null && dayuh.verseSection !== "root") score += 2;
    if (hasOwnSpecificSub(dayuh)) score += 3;
    return score;
}

export function chooseTruestDuplicateSpark(existing, incoming) {
    if (!existing) return incoming;
    return scoreInlineCoordinate(incoming) > scoreInlineCoordinate(existing) ? incoming : existing;
}
