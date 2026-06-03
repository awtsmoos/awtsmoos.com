// B"H
/**
 * @module ActiveCoordinateTracker
 * @description
 * Chapter 163: The current verse is written into memory by sight.
 * The Awtsmoos watches the reader's center-line, chooses the closest visible
 * subsection only when it is actually visible, highlights it, and records
 * `idx`/`sub` into the URL for exact refresh restoration.
 */

import { updateQueryStringParameter } from "../../functions/utils.js";

let observer = null;
let scrollHandler = null;
let raf = 0;
let lastKey = "";

function allSections() {
    return Array.from(document.querySelectorAll("#realPost .section[data-awtsmoos-idx], #realPost .section[data-idx]"));
}

function allSubs(section) {
    return Array.from(section?.querySelectorAll?.(":scope .sub-awtsmoos[data-awtsmoos-sub], :scope .sub-awtsmoos[data-sub], :scope .sub-awtsmoos[data-idx]") || []);
}

function coordOfSection(section) {
    return section?.dataset?.awtsmoosIdx ?? section?.dataset?.idx ?? null;
}

function coordOfSub(sub) {
    return sub?.dataset?.awtsmoosSub ?? sub?.dataset?.sub ?? sub?.dataset?.idx ?? null;
}

function viewportHeight() {
    return window.innerHeight || document.documentElement.clientHeight || 0;
}

function viewportLine() {
    return viewportHeight() * 0.38;
}

function visibleOverlap(element) {
    const rect = element.getBoundingClientRect();
    return Math.max(0, Math.min(rect.bottom, viewportHeight()) - Math.max(rect.top, 0));
}

function distanceFromLine(element) {
    const rect = element.getBoundingClientRect();
    const line = viewportLine();
    if (rect.top <= line && rect.bottom >= line) return 0;
    return Math.min(Math.abs(rect.top - line), Math.abs(rect.bottom - line));
}

function visibleScore(element) {
    const overlap = visibleOverlap(element);
    if (overlap <= 0) return Number.POSITIVE_INFINITY;
    return distanceFromLine(element) - Math.min(overlap, 260) * 0.035;
}

function bestSubIn(section) {
    const candidates = allSubs(section)
        .map(sub => ({ sub, score: visibleScore(sub), overlap: visibleOverlap(sub) }))
        .filter(item => Number.isFinite(item.score) && item.overlap > 8);
    if (!candidates.length) return null;
    candidates.sort((a, b) => a.score - b.score);
    return candidates[0].sub;
}

function bestSection() {
    const candidates = allSections()
        .map(section => ({ section, score: visibleScore(section) }))
        .filter(item => Number.isFinite(item.score));
    if (!candidates.length) return null;
    candidates.sort((a, b) => a.score - b.score);
    return candidates[0].section;
}

function clearActiveClasses() {
    document.querySelectorAll(".active-reading-section, .active-reading-sub, .awtsmoos-current-reading-section, .awtsmoos-current-reading-sub").forEach(node => {
        node.classList.remove("active-reading-section", "active-reading-sub", "awtsmoos-current-reading-section", "awtsmoos-current-reading-sub");
    });
}

function writeCoordinates(idx, sub) {
    if (idx === null || idx === undefined || idx === "") return;
    const key = `${idx}:${sub ?? ""}`;
    if (key === lastKey) return;
    lastKey = key;
    updateQueryStringParameter("idx", idx);
    if (sub === null || sub === undefined || sub === "") updateQueryStringParameter("sub", null);
    else updateQueryStringParameter("sub", sub);
    window.dispatchEvent(new CustomEvent("awtsmoos:active-coordinate", { detail: { idx, sub } }));
}

function mark(section, sub) {
    if (!section) return;
    clearActiveClasses();
    section.classList.add("active-reading-section", "awtsmoos-current-reading-section");
    if (sub) sub.classList.add("active-reading-sub", "awtsmoos-current-reading-sub");
}

function computeAndApply() {
    raf = 0;
    const section = bestSection();
    if (!section) return;
    const sub = bestSubIn(section);
    const idx = coordOfSection(section);
    const subCoord = sub ? coordOfSub(sub) : null;
    mark(section, sub);
    writeCoordinates(idx, subCoord);
}

function schedule() {
    if (raf) return;
    raf = requestAnimationFrame(computeAndApply);
}

function observeSections() {
    if (typeof IntersectionObserver !== "function") return false;
    observer = new IntersectionObserver(schedule, {
        root: null,
        rootMargin: "-18% 0px -50% 0px",
        threshold: [0, .05, .12, .25, .5, .75, 1]
    });
    allSections().forEach(section => {
        observer.observe(section);
        allSubs(section).forEach(sub => observer.observe(sub));
    });
    return true;
}

/** Starts the active-coordinate tracker after the reader DOM exists. */
export function startActiveCoordinateTracker() {
    stopActiveCoordinateTracker();
    const ok = observeSections();
    scrollHandler = schedule;
    window.addEventListener("scroll", scrollHandler, { passive: true });
    window.addEventListener("resize", scrollHandler, { passive: true });
    if (!ok) document.addEventListener("scroll", scrollHandler, { passive: true });
    schedule();
    setTimeout(schedule, 240);
    setTimeout(schedule, 900);
    return stopActiveCoordinateTracker;
}

/** Stops the tracker so tests/navigation can reinitialize cleanly. */
export function stopActiveCoordinateTracker() {
    observer?.disconnect?.();
    observer = null;
    if (scrollHandler) {
        window.removeEventListener("scroll", scrollHandler);
        window.removeEventListener("resize", scrollHandler);
        document.removeEventListener("scroll", scrollHandler);
    }
    scrollHandler = null;
    if (raf) cancelAnimationFrame(raf);
    raf = 0;
}
