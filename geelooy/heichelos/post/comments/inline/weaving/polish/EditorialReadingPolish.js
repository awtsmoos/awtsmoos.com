// B"H
/**
 * @file EditorialReadingPolish.js
 * @description
 * Chapter 123: The margin receives data, not inline paint.
 * The Awtsmoos now marks cluster position and reading rhythm with attributes
 * only. CSS owns the visible garment; JavaScript only names the constellation.
 */

const HEBREW_RE = /[\u0590-\u05ff]/;
const LATIN_RE = /[A-Za-z]/;

function textFrom(value) {
    if (!value) return "";
    if (typeof value === "string") return value;
    if (Array.isArray(value)) return value.map(textFrom).join(" ");
    if (typeof value === "object") return textFrom(value.text || value.html || value.content || value.body || value.message);
    return String(value);
}

function cleanText(value) {
    return textFrom(value).replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
}

function detectDirection(comment) {
    const text = cleanText(comment?.content || comment?.dayuh?.content || comment?.text || comment?.title);
    const hasHebrew = HEBREW_RE.test(text);
    const hasLatin = LATIN_RE.test(text);
    if (hasHebrew && hasLatin) return "mixed";
    if (hasHebrew) return "rtl";
    return "ltr";
}

function anchorLabel(coords = {}, vessel) {
    const verse = coords.verseSection ?? vessel?.dataset?.idx ?? vessel?.dataset?.inlineAnchorVerse;
    const sub = coords.subSection ?? vessel?.dataset?.sub ?? vessel?.dataset?.inlineAnchorSub;
    const parts = [];
    if (verse !== undefined && verse !== null && verse !== "root") parts.push(`section ${Number(verse) + 1}`);
    if (sub !== undefined && sub !== null && sub !== "main") parts.push(`paragraph ${Number(sub) + 1}`);
    return parts.length ? `Linked to ${parts.join(", ")}` : "Linked to the whole passage";
}

function clusterTone(count) {
    if (count > 4) return "deep";
    if (count > 1) return "clustered";
    return "single";
}

function updateClusterMetrics(gate) {
    const cards = Array.from(gate.querySelectorAll(".awtsmoos-inline-commentary-root"));
    const count = cards.length;
    gate.dataset.clusterSize = String(count);
    gate.dataset.clusterTone = clusterTone(count);
    cards.forEach((card, index) => {
        card.dataset.clusterIndex = String(index + 1);
        card.dataset.inlineClusterOrder = String(index);
    });
}

function setGateDataset(gate, vessel, coords) {
    if (!gate) return;
    gate.dataset.anchorLabel = anchorLabel(coords, vessel);
    gate.dataset.inlineReadingPolished = "true";
    gate.setAttribute("aria-roledescription", "inline marginal commentary cluster");
    gate.setAttribute("aria-label", `${gate.dataset.anchorLabel}; commentary by @${gate.dataset.alias || "commentator"}`);
}

function bindClusterKeyboard(gate) {
    if (!gate || gate.__awtsmoosClusterKeyboardBound) return;
    gate.__awtsmoosClusterKeyboardBound = true;
    gate.addEventListener("keydown", event => {
        if (!event.key.startsWith("Arrow")) return;
        const cards = Array.from(gate.querySelectorAll(".awtsmoos-inline-commentary-root"));
        if (!cards.length) return;
        const current = cards.indexOf(document.activeElement);
        const nextIndex = event.key === "ArrowDown" ? Math.min(cards.length - 1, current + 1) : event.key === "ArrowUp" ? Math.max(0, current - 1) : -1;
        if (nextIndex < 0 || nextIndex === current) return;
        event.preventDefault();
        cards[nextIndex].focus({ preventScroll: false });
    });
}

export function polishGate(gate, vessel, coords = {}) {
    setGateDataset(gate, vessel, coords);
    bindClusterKeyboard(gate);
    updateClusterMetrics(gate);
}

export function polishCard(card, comment, index = 0) {
    if (!card) return;
    const direction = detectDirection(comment);
    const text = cleanText(comment?.content || comment?.dayuh?.content || comment?.text);
    card.dataset.scriptDirection = direction;
    card.dataset.readingLength = text.length > 720 ? "long" : text.length < 120 ? "brief" : "standard";
    card.dataset.inlineInsertionOrder = String(index);
    card.setAttribute("tabindex", "0");
    card.setAttribute("role", "article");
    card.setAttribute("aria-label", `Inline comment ${index + 1} by @${comment?.author || comment?.aliasId || "commentator"}`);
    if (direction === "rtl") card.setAttribute("dir", "rtl");
    else if (direction === "mixed") card.setAttribute("dir", "auto");
}

export function refreshGatePolish(gate) {
    if (gate) updateClusterMetrics(gate);
}
