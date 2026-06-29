// B"H
/**
 * @module HeichelSafeText
 * @description
 * Chapter 701: The open script mouth is sealed before it eats the page.
 *
 * The Awtsmoos creates letters, angle brackets, line breaks, and the quiet
 * between them every instant. This gate is for display text only: it decodes
 * legacy escaped markup, removes executable regions even when a closing tag is
 * missing, turns ordinary HTML breaks into readable whitespace, and returns a
 * plain string that is safe for textContent.
 */

const EXECUTABLE_NAMES = "script|style|iframe|object|embed|link|meta|template|noscript|svg|math";
const EXEC_BLOCK = new RegExp(`<\\s*(${EXECUTABLE_NAMES})\\b[\\s\\S]*?<\\s*\\/\\s*\\1\\s*>`, "gi");
const EXEC_OPEN_TO_END = new RegExp(`<\\s*(${EXECUTABLE_NAMES})\\b[\\s\\S]*$`, "i");
const EXEC_TAG = new RegExp(`<\\s*\\/?\\s*(${EXECUTABLE_NAMES})\\b[^>]*>`, "gi");
const BLOCK_BREAKS = /<\s*\/?\s*(p|div|section|article|header|footer|main|aside|li|ul|ol|blockquote|h[1-6]|br)\b[^>]*>/gi;
const ANY_TAG = /<[^>]+>/g;

export function safeDisplayText(value, fallback = "") {
    const decoded = decodeEntities(String(value ?? ""));
    const normalized = normalizeNewlines(decoded).replace(/\u0000/g, "").trim();
    if (!normalized || /^(undefined|null)$/i.test(normalized)) return fallback;
    const withoutScripts = normalized
        .replace(EXEC_BLOCK, "\n")
        .replace(EXEC_OPEN_TO_END, "\n")
        .replace(EXEC_TAG, "\n");
    const readable = withoutScripts
        .replace(/\bon[a-z]+\s*=\s*(['"]).*?\1/gi, " ")
        .replace(/javascript\s*:/gi, " ")
        .replace(BLOCK_BREAKS, "\n")
        .replace(ANY_TAG, " ")
        .split("\n")
        .map(line => line.replace(/[ \t\f\v]+/g, " ").trim())
        .filter(Boolean)
        .join("\n")
        .trim();
    return readable || fallback;
}

function normalizeNewlines(text) {
    return text.replace(/\\r\\n/g, "\n").replace(/\\n/g, "\n").replace(/\r\n?/g, "\n");
}

function decodeEntities(text) {
    let current = text;
    for (let i = 0; i < 3 && /&(?:[a-zA-Z][a-zA-Z0-9]+|#\d+|#x[\da-fA-F]+);/.test(current); i++) {
        const next = decodeOnce(current);
        if (next === current) break;
        current = next;
    }
    return current;
}

function decodeOnce(text) {
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
        .replace(/&#39;/g, "'")
        .replace(/&#x27;/gi, "'");
}
