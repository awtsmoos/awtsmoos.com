// B"H
/**
 * @module HeichelSafeText
 * @description
 * Chapter 416: The serpent-tag was swallowed before it could speak.
 *
 * The Awtsmoos creates text, tags, and the silence between them every instant.
 * This tiny gate accepts legacy descriptions that were saved as escaped HTML,
 * decodes their harmless words, removes executable chambers, and returns only
 * human-readable breath. No script is executed; no angle-bracket fossil is
 * displayed as a wound on the Heichel wall.
 */

const EXECUTABLE_BLOCK = /<\s*(script|style|iframe|object|embed|link|meta|template|noscript)\b[\s\S]*?<\s*\/\s*\1\s*>/gi;
const LONE_EXECUTABLE_TAG = /<\s*\/?\s*(script|style|iframe|object|embed|link|meta|template|noscript)\b[^>]*>/gi;
const ANY_TAG = /<[^>]+>/g;

export function safeDisplayText(value, fallback = "") {
    const decoded = decodeEntities(String(value ?? ""));
    const normalized = decoded.replace(/\u0000/g, "").trim();
    if (!normalized || /^(undefined|null)$/i.test(normalized)) return fallback;
    return normalized
        .replace(EXECUTABLE_BLOCK, " ")
        .replace(LONE_EXECUTABLE_TAG, " ")
        .replace(ANY_TAG, " ")
        .replace(/\bon[a-z]+\s*=\s*(['"]).*?\1/gi, " ")
        .replace(/javascript\s*:/gi, " ")
        .replace(/\s+/g, " ")
        .trim() || fallback;
}

function decodeEntities(text) {
    if (!/[&][a-zA-Z#0-9]+;/.test(text)) return text;
    if (typeof document !== "undefined") {
        const box = document.createElement("textarea");
        box.innerHTML = text;
        return box.value;
    }
    return text
        .replace(/&lt;/g, "<")
        .replace(/&gt;/g, ">")
        .replace(/&amp;/g, "&")
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'");
}
