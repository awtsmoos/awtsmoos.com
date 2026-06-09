// B"H
/**
 * @module VirtualScrollCoordinates
 * @description
 * Chapter 275: The URL receives the reader's footprint without moving them.
 *
 * This vessel marks the currently visible subsection and mirrors its coordinate
 * into the query string. It removes only CSS classes, never DOM nodes, so the
 * append-only scroll covenant remains whole.
 */

import { visibleSubsection } from "./VirtualScrollVisibility.js";

const asNumber = (value, fallback = 0) => {
    const parsed = Number.parseInt(value, 10);
    return Number.isFinite(parsed) ? parsed : fallback;
};

export function markVisibleCoordinate(cursorVerse = 0) {
    const node = visibleSubsection();
    document.querySelectorAll(".awtsmoos-current-section, .awtsmoos-current-subsection").forEach(el => {
        el.classList.remove("awtsmoos-current-section", "awtsmoos-current-subsection");
    });
    if (!node) return null;
    node.classList.add("awtsmoos-current-subsection");
    node.closest(".section")?.classList.add("awtsmoos-current-section");
    const idx = asNumber(node.dataset.awtsmoosIdx, cursorVerse);
    const sub = asNumber(node.dataset.awtsmoosSub, 0);
    const url = new URL(location.href);
    url.searchParams.set("idx", String(idx));
    url.searchParams.set("sub", String(sub));
    history.replaceState(history.state, "", url);
    window.dispatchEvent(new CustomEvent("awtsmoos:coordinates", { detail: { idx, sub } }));
    return { idx, sub };
}
