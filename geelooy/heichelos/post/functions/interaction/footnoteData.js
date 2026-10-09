//B"H
/**
 * @file footnoteData.js
 * @description
 * Footnote vessels arrive in many garments: dayuh.footnotes, dayuh.meta.footnotes,
 * arrays, maps, paragraph lists, content strings, and nested packets. This module
 * reveals one stable shape for renderers and click handlers.
 */

const FOOTNOTE_KEYS = ["footnotes", "הערות", "notes"];

function stringifyId(value, fallback) {
    if (value === undefined || value === null || value === "") return String(fallback);
    // B"H fix: stronger normalization for dedup —
    // strips brackets, trailing periods, extra whitespace, leading zeros.
    const cleaned = String(value)
        .replace(/[\[\]\(\)]/g, "")
        .replace(/[.\s]+$/g, "")
        .trim()
        .replace(/^0+(\d)/, "$1");
    return cleaned || String(fallback);
}

function collectTextParts(value, out = []) {
    if (value === undefined || value === null) return out;
    if (typeof value === "string" || typeof value === "number") {
        const txt = String(value).trim();
        if (txt) out.push(txt);
        return out;
    }
    if (Array.isArray(value)) {
        value.forEach(item => collectTextParts(item, out));
        return out;
    }
    if (typeof value === "object") {
        collectTextParts(value.content, out);
        collectTextParts(value.text, out);
        collectTextParts(value.html, out);
        collectTextParts(value.paragraphs, out);
        collectTextParts(value.paragraph, out);
        collectTextParts(value.body, out);
        collectTextParts(value.value, out);
    }
    return out;
}

function candidateContainers(dayuh) {
    const roots = [dayuh, dayuh?.meta, dayuh?.dayuh, window.post, window.post?.dayuh, window.post?.dayuh?.meta];
    const containers = [];

    for (const root of roots) {
        if (!root || typeof root !== "object") continue;
        for (const key of FOOTNOTE_KEYS) {
            if (root[key]) containers.push(root[key]);
        }
    }

    return containers;
}

function normalizeContainer(container) {
    if (!container) return [];
    if (Array.isArray(container)) return container;
    if (typeof container === "object") {
        return Object.entries(container).map(([key, value]) => {
            if (value && typeof value === "object" && !Array.isArray(value)) {
                return { id: value.id ?? key, ...value };
            }
            return { id: key, content: value };
        });
    }
    return [];
}

/**
 * Returns normalized footnotes in the shape { id, paragraphs, content, raw }.
 * @param {object} dayuh Post dayuh packet.
 * @returns {Array<{id:string, paragraphs:string[], content:string, raw:any}>}
 */
export function getNormalizedFootnotes(dayuh = window.post?.dayuh) {
    const seen = new Set();
    const normalized = [];

    for (const container of candidateContainers(dayuh)) {
        const list = normalizeContainer(container);
        list.forEach((note, index) => {
            const id = stringifyId(note?.id ?? note?.number ?? note?.key, index + 1);
            if (seen.has(id)) return;
            const paragraphs = collectTextParts(note).filter(Boolean);
            // B"H fix: skip completely empty notes (no text in any shape).
            if (!paragraphs.length) {
                seen.add(id); // mark seen so it isn't re-added from another container
                return;
            }
            normalized.push({
                id,
                paragraphs,
                content: paragraphs.join("\n"),
                raw: note
            });
            seen.add(id);
        });
    }

    // B"H fix: sort numerically by footnote ID so the panel order matches
    // the reading order (fixes "51 before 47-50").
    normalized.sort((a, b) => {
        const aNum = parseInt(a.id, 10);
        const bNum = parseInt(b.id, 10);
        if (!isNaN(aNum) && !isNaN(bNum)) return aNum - bNum;
        return String(a.id).localeCompare(String(b.id));
    });

    return normalized;
}

export function findFootnoteById(id, dayuh = window.post?.dayuh) {
    const wanted = stringifyId(id, "");
    return getNormalizedFootnotes(dayuh).find(note => note.id === wanted);
}

export function readFootnoteIdFromRef(ref) {
    if (!ref) return "";
    return stringifyId(
        ref.dataset?.footnoteId ||
        ref.dataset?.noteId ||
        ref.getAttribute("data-id") ||
        ref.getAttribute("href")?.replace(/^#/, "") ||
        ref.textContent,
        ""
    );
}
