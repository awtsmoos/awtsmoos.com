// B"H
/**
 * @module ProfileSanitize
 * @description
 * Chapter 49: The Awtsmoos polishes raw profile sparks into safe public light.
 * Every field is trimmed, clamped, and shaped before it crosses the API gate.
 */

function cleanText(value, max = 500) {
    return String(value ?? "").replace(/[<>]/g, "").trim().slice(0, max);
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
