// B"H
/**
 * @file ThreadIntelligence.js
 * @description
 * Chapter 304: The gate speaks once and stops repeating names.
 * The Awtsmoos makes the trigger a quiet count, not another biography or title.
 */

function textFrom(value) {
    if (!value) return "";
    if (typeof value === "string") return value;
    if (Array.isArray(value)) return value.map(textFrom).filter(Boolean).join(" ");
    if (typeof value === "object") return textFrom(value.text || value.html || value.plain || value.content || value.body || value.message);
    return String(value);
}

function stripMarkup(value) {
    return String(value || "").replace(/<[^>]+>/g, " ").replace(/&nbsp;/g, " ").replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/\s+/g, " ").trim();
}

export function getCommentAlias(comment, fallback = "commentator") {
    return comment?.author || comment?.aliasId || comment?.owner || fallback;
}

export function getCommentPreview(comment) {
    return stripMarkup(textFrom(comment?.content) || textFrom(comment?.dayuh?.content) || textFrom(comment?.text));
}

export function getCommentStamp(comment) {
    const candidate = comment?.createdAt || comment?.timestamp || comment?.time || comment?.date || comment?.dayuh?.createdAt;
    if (!candidate) return "recent";
    const date = new Date(candidate);
    if (Number.isNaN(date.getTime())) return String(candidate);
    return new Intl.DateTimeFormat(undefined, { month: "short", day: "numeric" }).format(date);
}

export function connectShelterToVessel(shelter, vessel, coords = {}) {
    if (!shelter || !vessel) return;
    const verse = coords.verseSection ?? vessel.dataset?.idx ?? vessel.dataset?.awtsmoosIdx;
    const sub = coords.subSection ?? vessel.dataset?.sub;
    shelter.classList.add("awtsmoos-inline-anchor-linked");
    shelter.dataset.anchorVerse = verse ?? "root";
    if (sub !== undefined && sub !== null) shelter.dataset.anchorSub = sub;
    vessel.classList.add("awtsmoos-inline-source-vessel");
    if (verse !== undefined && verse !== null) vessel.dataset.inlineAnchorVerse = verse;
    if (sub !== undefined && sub !== null) vessel.dataset.inlineAnchorSub = sub;
}

function countPhrase(count) {
    if (!count) return "No comments yet";
    return count === 1 ? "1 comment" : `${count} comments`;
}

export function hydrateGateSummary(gate, comments = []) {
    if (!gate) return;
    const usable = comments.filter(Boolean);
    const count = usable.length;
    const preview = gate.querySelector(".awtsmoos-inline-trigger-preview");
    const meta = gate.querySelector(".awtsmoos-inline-trigger-meta");
    const title = gate.querySelector(".awtsmoos-inline-trigger-title");
    const sub = gate.querySelector(".awtsmoos-inline-trigger-subtitle");
    if (title) title.textContent = "Comments";
    if (sub) sub.textContent = countPhrase(count);
    if (preview) preview.textContent = "";
    if (meta) meta.textContent = "";
    gate.dataset.inlinePreview = usable[count - 1] ? getCommentPreview(usable[count - 1]) : "";
    gate.dataset.inlineLatestAuthor = usable[count - 1] ? getCommentAlias(usable[count - 1], gate.dataset.alias) : (gate.dataset.alias || "");
}

function setFocusState(node, on) {
    node?.classList?.toggle("awtsmoos-inline-source-focused", !!on);
}

export function bindReadingFocus(gate, vessel) {
    if (!gate || gate.__awtsmoosReadingFocusBound) return;
    gate.__awtsmoosReadingFocusBound = true;
    const enter = () => {
        gate.classList.add("awtsmoos-inline-reading-focus");
        setFocusState(vessel, true);
        document.querySelectorAll(".awtsmoos-inline-shell").forEach(other => {
            if (other !== gate) other.classList.add("awtsmoos-inline-nearby-muted");
        });
    };
    const leave = () => {
        gate.classList.remove("awtsmoos-inline-reading-focus");
        setFocusState(vessel, false);
        document.querySelectorAll(".awtsmoos-inline-nearby-muted").forEach(other => other.classList.remove("awtsmoos-inline-nearby-muted"));
    };
    gate.addEventListener("mouseenter", enter);
    gate.addEventListener("focusin", enter);
    gate.addEventListener("mouseleave", leave);
    gate.addEventListener("focusout", event => { if (!gate.contains(event.relatedTarget)) leave(); });
}
