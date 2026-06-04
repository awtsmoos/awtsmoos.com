// B"H
/**
 * @module ScribeScaffold
 * @description
 * Chapter 185: The scroll becomes a palace held in memory, not a crowd in DOM.
 * The Awtsmoos keeps every verse in RAM, but gives physical bodies only to the
 * reader's current chamber and its buffer courtyards. Above the virtual river a
 * stable title crown stays real, so the post name never disappears when chunks
 * sleep and awaken.
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
    count.textContent = totalItems ? `${totalItems} living sections` : "Living scroll";

    crown.append(small, title, count);
    return crown;
}

export class ScribeScaffold {
    /**
     * @constant CHUNK_SIZE
     * @description Two verses per physical chunk keeps the DOM light while still
     * giving inline comments enough neighboring structure to anchor safely.
     */
    static CHUNK_SIZE = 2;

    /**
     * Creates the virtual scaffolding within the main viewport.
     * @param {HTMLElement} parent The `realPost` element.
     * @param {number} totalItems Total count of sections in the Dayuh.
     * @param {{post?:object,series?:object}} context Post title context.
     * @returns {HTMLElement} The virtual scroll container.
     */
    static construct(parent, totalItems, context = {}) {
        parent.innerHTML = "";
        parent.dataset.awtsmoosVirtualDom = "ram-backed";
        parent.appendChild(makeTitleCrown(context.post, context.series, totalItems));

        const scrollContainer = document.createElement("div");
        scrollContainer.id = "virtual-scroll-container";
        scrollContainer.className = "awtsmoos-virtual-scroll awtsmoos-mobile-scroll";
        scrollContainer.dataset.virtualMode = "windowed-verses";
        scrollContainer.dataset.totalItems = String(totalItems || 0);
        parent.appendChild(scrollContainer);

        const totalChunks = Math.ceil(totalItems / this.CHUNK_SIZE);
        for (let c = 0; c < totalChunks; c++) {
            const chunk = document.createElement("div");
            chunk.className = "scroll-chunk";
            chunk.dataset.chunkId = c;
            chunk.dataset.awtsmoosVirtualChunk = "sleeping";
            chunk.style.minHeight = `${this.CHUNK_SIZE * 420}px`;
            chunk.style.contain = "layout style paint";
            scrollContainer.appendChild(chunk);
        }

        return scrollContainer;
    }

    /**
     * Maps a section index to its chunk id.
     * @param {number} index Section index.
     * @returns {number} Chunk id.
     */
    static findChunkByItemIndex(index) {
        return Math.floor(index / this.CHUNK_SIZE);
    }
}
