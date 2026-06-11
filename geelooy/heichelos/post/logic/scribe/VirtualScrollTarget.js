// B"H
/**
 * @module VirtualScrollTarget
 * @description
 * Chapter 279: Target landing respects the true scroll river. If the reader is
 * inside a mobile/internal scroll vessel, URL restoration moves that vessel;
 * otherwise it moves the document. It never creates or removes reader content.
 */

import { parseScrollTarget } from "./VirtualScrollMath.js";
import { scrollRoot, scrollTopOf, setScrollTop } from "./VirtualScrollRoot.js";

const asNumber = (value, fallback = 0) => {
    const parsed = Number.parseInt(value, 10);
    return Number.isFinite(parsed) ? parsed : fallback;
};

function firstParam(params, names) {
    for (const name of names) {
        const value = params.get(name);
        if (value !== null && value !== undefined && value !== "") return value;
    }
    return null;
}

export function targetFromQuery(query) {
    const params = query instanceof URLSearchParams ? query : new URLSearchParams(String(query || ""));
    const math = parseScrollTarget(params);
    const idx = firstParam(params, ["idx", "verse", "verseIndex", "section", "sectionIndex"]);
    const sub = firstParam(params, ["sub", "subsection", "subSection", "subIdx", "paragraph", "para"]);
    return {
        idx: idx === null ? math.idx : asNumber(idx, 0),
        sub: sub === null || sub === "null" ? math.sub : asNumber(sub, 0)
    };
}

export function exactTarget(idx, sub) {
    const section = document.querySelector(`.section[data-awtsmoos-idx="${idx}"]`);
    if (!section) return null;
    if (sub !== null && Number.isFinite(sub)) return window.__awtsmoosRevealSubsection?.(idx, sub) || section;
    return section;
}

export function scrollToTarget(target) {
    const root = scrollRoot();
    const header = document.querySelector(".awtsmoos-integrated-header")?.getBoundingClientRect().height || 0;
    const rootTop = root.getBoundingClientRect?.().top || 0;
    const current = scrollTopOf(root);
    const top = target.getBoundingClientRect().top - rootTop + current - Math.max(36, header + 18);
    setScrollTop(root, top);
}
