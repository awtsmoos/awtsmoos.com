// B"H
/**
 * @module ApprovalText
 * @description
 * Chapter 6: Preview words are stripped without raw DOM sinks. HTML shadows are
 * removed by text rhythm so the approval card remains safe and readable.
 */

/** @param {object} comment @returns {string} */
export function previewText(comment) {
    const html = comment?.content || comment?.dayuh?.content || "";
    return String(html)
        .replace(/<[^>]*>/g, " ")
        .replace(/\s+/g, " ")
        .trim()
        .slice(0, 240) || "Submitted insight";
}

/** @param {object} comment @returns {string} */
export function coordinateText(comment) {
    const verse = comment?.dayuh?.verseSection ?? comment?.verseSection ?? "root";
    const sub = comment?.dayuh?.subSection;
    return sub === undefined || sub === null
        ? `Section ${verse}`
        : `Section ${verse}, paragraph ${Number(sub) + 1}`;
}
