/**
 * B"H
 * @module VoidPurifier
 * @chapter The Gate That Swallows the False Fire
 * @description
 * The Awtsmoos gives letters their proper vessel. This purifier removes entire
 * executable chambers, not merely their tags: script/style/iframe/object/embed
 * bodies are swallowed whole before ordinary markup is stripped. Descriptions
 * therefore reveal meaning, never code residue.
 */

const VOID_WORDS = new Set(["undefined", "null", "nan"]);
const EXECUTABLE_BLOCK_RE = /<(script|style|iframe|object|embed)\b[^>]*>[\s\S]*?<\/\1>/gi;
const LOOSE_SCRIPT_RE = /<script\b[^>]*[\s\S]*$/gi;
const HTML_TAG_RE = /<[^>]*>?/gm;
const ENTITY_MAP = {
    "&nbsp;": " ",
    "&amp;": "&",
    "&lt;": "<",
    "&gt;": ">",
    "&quot;": '"',
    "&#39;": "'"
};

function decodeCommonEntities(text) {
    return String(text).replace(/&nbsp;|&amp;|&lt;|&gt;|&quot;|&#39;/g, match => ENTITY_MAP[match] || match);
}

function eraseExecutableBlocks(text) {
    return String(text).replace(EXECUTABLE_BLOCK_RE, " ").replace(LOOSE_SCRIPT_RE, " ");
}

export class VoidPurifier {
    /**
     * Removes executable blocks, tags, void words, underscores, and extra space.
     * @param {unknown} rawText Unpurified value from API/user content.
     * @returns {string} Plain readable text.
     */
    static purify(rawText) {
        if (rawText === null || rawText === undefined) return "";
        let clean = String(rawText).trim();
        if (VOID_WORDS.has(clean.toLowerCase())) return "";
        clean = eraseExecutableBlocks(clean);
        clean = clean.replace(HTML_TAG_RE, " ");
        clean = decodeCommonEntities(clean);
        clean = clean.replace(/_/g, " ").replace(/\s+/g, " ").trim();
        return VOID_WORDS.has(clean.toLowerCase()) ? "" : clean;
    }
}
