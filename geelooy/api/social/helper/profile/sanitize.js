// B"H
/**
 * @module ProfileSanitize
 * @description
 * Chapter 49: The Awtsmoos polishes raw profile sparks into safe public light.
 * Every field is trimmed, clamped, and shaped before it crosses the API gate.
 */

const NAMED_ENTITIES = { amp: "&", lt: "<", gt: ">", quot: "\"", apos: "'" };

/**
 * B"H 2026-11-19 (social polish): decode HTML entities exactly once, so a
 * stored "&lt;b&gt;" becomes the tag "<b>" and a stored "&amp;lt;" stays
 * the literal text "&lt;" — replacements are never rescanned.
 */
function decodeEntitiesOnce(text) {
    return text.replace(/&(amp|lt|gt|quot|apos);|&#(\d+);|&#x([0-9a-fA-F]+);/g, (match, named, dec, hex) => {
        if (named) return NAMED_ENTITIES[named];
        const code = hex ? parseInt(hex, 16) : parseInt(dec, 10);
        return Number.isFinite(code) && code > 0 && code <= 0x10FFFF ? String.fromCodePoint(code) : match;
    });
}

/**
 * B"H 2026-11-19 (social polish): the old cleanText deleted only the angle
 * brackets, leaving tag names behind as visible text ("<b>אמר</b>" rendered
 * as "bאמר/b", a link's href leaked into alias descriptions). Now: decode
 * entities once, strip whole tags, and keep the surviving plain text —
 * internal whitespace is preserved (comment bodies rely on it); a "<" that
 * does not open a tag (math text like "a < b") is left untouched.
 */
function cleanText(value, max = 500) {
    const decoded = decodeEntitiesOnce(String(value ?? ""));
    return decoded
        .replace(/<!--[\s\S]*?-->/g, " ")
        .replace(/<\/?[a-zA-Z][^>]*>/g, "")
        .trim()
        .slice(0, max);
}

function idList(value) {
    if (Array.isArray(value)) return value.filter(Boolean).map(String);
    if (value && typeof value === "object") return Object.keys(value).filter(Boolean);
    if (typeof value === "string" && value) return [value];
    return [];
}

function readArray(value, max = 12) {
    if (Array.isArray(value)) return value.map(item => cleanText(item, 48)).filter(Boolean).slice(0, max);
    if (typeof value === "string") return value.split(",").map(item => cleanText(item, 48)).filter(Boolean).slice(0, max);
    return [];
}

function parseJsonObject(value) {
    if (value && typeof value === "object") return value;
    if (!value || typeof value !== "string") return {};
    try {
        const parsed = JSON.parse(value);
        return parsed && typeof parsed === "object" ? parsed : {};
    } catch {
        return {};
    }
}

module.exports = { cleanText, idList, readArray, parseJsonObject };
