// B"H
/**
 * @module NavigationFooter
 * @description
 * Chapter 187: The Previous and Next gates know the true road.
 * They no longer point to a naked relative number. Each gate rewrites the
 * current series URL to the neighbor chapter, clears verse/sub refresh anchors,
 * and carries the traveler to the top crown of the next revelation.
 */

import { GenesisEngine } from "../dom/GenesisEngine.js";

function cleanSearch() {
    const params = new URLSearchParams(location.search);
    ["idx", "sub", "verse", "verseIndex", "section", "sectionIndex", "paragraph", "para"].forEach(key => params.delete(key));
    const text = params.toString();
    return text ? `?${text}` : "";
}

function chapterHref(targetIndex) {
    const parts = location.pathname.split("/").filter(Boolean).map(decodeURIComponent);
    const marker = parts.indexOf("series");
    if (marker !== -1 && parts[marker + 2] !== undefined) {
        parts[marker + 2] = String(targetIndex);
        return `/${parts.map(encodeURIComponent).join("/")}${cleanSearch()}`;
    }
    return String(targetIndex);
}

function gate(id, label, index, direction) {
    return {
        tag: "a",
        attr: {
            id,
            class: `awtsmoos-chapter-gate awtsmoos-chapter-gate-${direction}`,
            href: chapterHref(index),
            "data-target-chapter": String(index),
            "aria-label": label
        },
        children: [
            { tag: "span", attr: { class: "awtsmoos-chapter-gate-arrow" }, text: direction === "previous" ? "←" : "→" },
            { tag: "span", attr: { class: "awtsmoos-chapter-gate-label" }, text: label },
            { tag: "span", attr: { class: "awtsmoos-chapter-gate-number" }, text: `Chapter ${index + 1}` }
        ]
    };
}

/**
 * Forges the DOM elements for chapter navigation.
 * @returns {HTMLElement} Navigation block.
 */
export function makeNavBars(post, seriesParent, indexInSeries) {
    if (!seriesParent || !Array.isArray(seriesParent.posts)) return document.createTextNode("");

    const cur = parseInt(indexInSeries, 10) || 0;
    const length = seriesParent.posts.length;
    const hasPrevious = cur > 0;
    const hasNext = cur < length - 1;

    const plan = {
        tag: "nav",
        attr: { class: "awtsmoos-chapter-nav", "aria-label": "Chapter navigation" },
        children: [
            { tag: "div", attr: { class: "awtsmoos-chapter-nav-status" }, children: [
                { tag: "span", text: "Chapter" },
                { tag: "strong", text: `${cur + 1}` },
                { tag: "span", text: `/ ${length}` }
            ] }
        ]
    };

    if (hasPrevious) plan.children.push(gate("last", "Previous", cur - 1, "previous"));
    if (hasNext) plan.children.push(gate("next", "Next", cur + 1, "next"));
    return GenesisEngine.manifest(plan);
}
