/**
 * B"H
 * @module CommentDataUnroller
 * @chapter The Crown No Longer Devours The Soul
 * @description
 * The Awtsmoos breathes a comment through many vessels: arrays from an API,
 * keyed maps of sparks, single bare objects, nested `content`, and old `dayuh`
 * chambers. This module distinguishes a comment from a map before unrolling,
 * then extracts body text from every known field without mistaking the title for
 * the only revelation. The crown remains a crown; the body remains a body.
 */

const BODY_KEYS = ["text", "paragraphs", "body", "plain", "html", "message", "description", "sections", "content"];
const TITLE_KEYS = ["title", "name", "subject", "header"];
const META_KEYS = ["id", "author", "aliasId", "owner", "dayuh", "replyToId", "verseSection"];

function isBlessing(value) {
    return typeof value === "string" && value.includes('B"H');
}

function isPlainObject(value) {
    return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function hasAnyKey(value, keys) {
    return isPlainObject(value) && keys.some(key => Object.prototype.hasOwnProperty.call(value, key));
}

function looksLikeComment(value) {
    if (!isPlainObject(value)) return false;
    if (hasAnyKey(value, META_KEYS)) return true;
    if (hasAnyKey(value, TITLE_KEYS) && hasAnyKey(value, BODY_KEYS)) return true;
    if (hasAnyKey(value, ["content"]) && isPlainObject(value.content) && (hasAnyKey(value.content, TITLE_KEYS) || hasAnyKey(value.content, BODY_KEYS))) return true;
    return false;
}

function purifyArray(arr) {
    return arr.filter(item => !isBlessing(item) && item !== null && item !== undefined);
}

function normalizeParagraph(value) {
    if (value === null || value === undefined) return "";
    if (typeof value === "string") return value;
    if (typeof value === "number" || typeof value === "boolean") return String(value);
    if (Array.isArray(value)) return value.map(normalizeParagraph).filter(Boolean).join("\n");
    if (typeof value === "object") return extractCommentText(value).paragraphs.join("\n");
    return String(value);
}

function asParagraphs(value) {
    if (value === null || value === undefined || value === "") return [];
    if (Array.isArray(value)) return value.map(normalizeParagraph).filter(Boolean);
    if (typeof value === "object") {
        if (!Object.keys(value).some(key => TITLE_KEYS.includes(key) || BODY_KEYS.includes(key))) {
            return Object.values(value).map(normalizeParagraph).filter(Boolean);
        }
        return extractCommentText(value).paragraphs;
    }
    return [normalizeParagraph(value)].filter(Boolean);
}

function firstTitle(content) {
    if (!isPlainObject(content)) return "";
    for (const key of TITLE_KEYS) {
        if (typeof content[key] === "string" && content[key].trim()) return content[key];
    }
    return "";
}

function firstBodyParagraphs(content) {
    if (!isPlainObject(content)) return [];
    for (const key of BODY_KEYS) {
        if (key === "content" && content[key] === content) continue;
        const paragraphs = asParagraphs(content[key]);
        if (paragraphs.length) return paragraphs;
    }
    return [];
}

const LEGACY_REPLY_QUOTE = /^>\s*\[Reply to @[^\]]*\]\(#comment-[^)]*\):?\s*/;

/**
 * Cleans the reply-quote shell older clients baked INTO stored comment
 * bodies (`> [Reply to @x](#comment-<id>): <parent snippet>...`). When the
 * author's own text follows the quote after a blank line, only that text
 * remains; when the quote is all the record holds, the snippet survives as
 * plain prose with the markdown shell removed — the best text available.
 * @param {string} text Stored body text.
 * @returns {string} Human-readable text.
 */
export function cleanLegacyReplyQuote(text) {
    if (typeof text !== "string" || !text) return text || "";
    let out = text;
    // Replies to replies stacked several shells; peel them one at a time.
    while (LEGACY_REPLY_QUOTE.test(out)) {
        const rest = out.replace(LEGACY_REPLY_QUOTE, "");
        const splitAt = rest.search(/\n\s*\n/);
        if (splitAt >= 0) {
            out = rest.slice(splitAt).replace(/^\s+/, "");
            continue;
        }
        out = rest.replace(/\.\.\.$/, "").trim();
        break;
    }
    return out;
}

function unrollMap(target) {
    const unrolledSparks = [];
    Object.values(target).forEach(value => {
        if (Array.isArray(value)) unrolledSparks.push(...purifyArray(value));
        else if (!isBlessing(value) && value !== null && value !== undefined) unrolledSparks.push(value);
    });
    return purifyArray(unrolledSparks);
}

/**
 * Reaches into a potential success/details wrapper and extracts comments.
 * @param {Object|Array} response The raw emanation from the API.
 * @returns {Array} Purified sparks.
 */
export function unrollApiResponse(response) {
    if (!response) return [];
    let target = response;
    if (response.success !== undefined) target = response.success;
    else if (response.details !== undefined) target = response.details;
    if (Array.isArray(target)) return purifyArray(target);
    if (looksLikeComment(target)) return [target];
    if (isPlainObject(target)) return unrollMap(target);
    return target ? [target] : [];
}

/**
 * Finds the textual essence of a comment content vessel.
 * @param {Object|string|Array} content The content field or nested content.
 * @returns {{title: string, paragraphs: string[]}} Title and real body lines.
 */
export function extractCommentText(content) {
    const result = { title: "", paragraphs: [] };
    if (!content) return result;
    if (typeof content === "string") return { title: "", paragraphs: [cleanLegacyReplyQuote(content)].filter(Boolean) };
    if (Array.isArray(content)) return { title: "", paragraphs: asParagraphs(content).map(cleanLegacyReplyQuote).filter(Boolean) };
    if (typeof content !== "object") return { title: "", paragraphs: [String(content)] };
    result.title = firstTitle(content);
    result.paragraphs = firstBodyParagraphs(content);
    if (!result.paragraphs.length) {
        result.paragraphs = Object.entries(content)
            .filter(([key]) => !TITLE_KEYS.includes(key) && !META_KEYS.includes(key))
            .map(([, value]) => normalizeParagraph(value))
            .filter(Boolean);
    }
    result.paragraphs = result.paragraphs.map(cleanLegacyReplyQuote).filter(Boolean);
    return result;
}
