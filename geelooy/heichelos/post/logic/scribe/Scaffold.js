// B"H
/**
 * @module ScribeScaffold
 * @description
 * Chapter 308: A normal river with coordinate stones.
 * The old name `virtual-scroll-container` remains only because many comment,
 * focus, and diagnostics modules already look for it. It is no longer a virtual
 * scroller. It is one ordinary block that receives every verse immediately.
 */

function textFrom(value, fallback = "") {
    return String(value || fallback || "").trim();
}

function makeMetaLine(post = {}, series = {}) {
    const pieces = [];
    const seriesName = textFrom(series?.prateem?.name || series?.name);
    const author = textFrom(post?.author);
    if (seriesName) pieces.push(seriesName);
    if (author) pieces.push(`@${author}`);
    return pieces.join(" · ");
}

function makeTitleCrown(post = {}, series = {}, totalItems = 0) {
    const crown = document.createElement("header");
    crown.className = "awtsmoos-post-title-crown";
    crown.id = "awtsmoosPostTitleCrown";

    const small = document.createElement("div");
    small.className = "awtsmoos-post-title-kicker";
    small.textContent = makeMetaLine(post, series) || "Awtsmoos Revelation";

    const title = document.createElement("h1");
    title.className = "awtsmoos-post-title-main";
    title.textContent = textFrom(post?.title, "Untitled Scroll");

    const count = document.createElement("div");
    count.className = "awtsmoos-post-title-count";
    count.textContent = totalItems ? `${totalItems} verse gates` : "Living scroll";

    crown.append(small, title, count);
    return crown;
}

export class ScribeScaffold {
    static CHUNK_SIZE = 1;

    /**
     * Builds a normal DOM container. All verse chunks are inserted immediately
     * by the scribe, so scrolling belongs to the browser document.
     * @param {HTMLElement} parent The real post element.
     * @param {number} totalItems Total verse count.
     * @param {{post?:object,series?:object}} context Rendering context.
     * @returns {HTMLElement} Normal content container.
     */
    static construct(parent, totalItems, context = {}) {
        parent.innerHTML = "";
        parent.dataset.awtsmoosVirtualDom = "disabled-normal-dom";
        parent.dataset.awtsmoosScrollMode = "native-document";
        parent.appendChild(makeTitleCrown(context.post, context.series, totalItems));

        const scrollContainer = document.createElement("div");
        scrollContainer.id = "virtual-scroll-container";
        scrollContainer.className = "awtsmoos-normal-scroll awtsmoos-mobile-scroll";
        scrollContainer.dataset.virtualMode = "disabled-all-verses-present";
        scrollContainer.dataset.totalItems = String(totalItems || 0);
        parent.appendChild(scrollContainer);
        return scrollContainer;
    }

    static findChunkByItemIndex(index) {
        return Math.floor(index / this.CHUNK_SIZE);
    }
}
