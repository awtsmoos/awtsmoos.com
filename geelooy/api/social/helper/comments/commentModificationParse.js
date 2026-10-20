//B"H
//Blessed is He
//Boruch Hashem
/**
 * @module CommentModificationParse
 * @description Dayuh payload parsing (split from commentModification.js, verbatim).
 */

/**
 * B"H
 * @function parseDayuhVessel
 * @description Parses edited dayuh payloads before storing them.
 * @param {any} dayuh Raw dayuh body.
 * @returns {object|undefined} Parsed dayuh object, or undefined.
 */
function parseDayuhVessel(dayuh) {
    if (!dayuh) return undefined;
    if (typeof dayuh === "object") return dayuh;
    if (typeof dayuh !== "string") return undefined;
    try {
        const parsed = JSON.parse(dayuh);
        return parsed && typeof parsed === "object" ? parsed : undefined;
    } catch (_) {
        return undefined;
    }
}

module.exports = {
	parseDayuhVessel,
};
