// B"H
/**
 * @module ScribeScaffold
 * @description
 * Chapter 3: The dimensions of infinity are folded into measured vessels. The
 * scaffold creates lightweight chunk placeholders, marks the scroll as virtual,
 * and lets the oracle decide which chambers deserve bodies right now.
 */

export class ScribeScaffold {
    /**
     * @constant CHUNK_SIZE
     * @description The number of verse sections held by a physical chunk.
     */
    static CHUNK_SIZE = 12;

    /**
     * Creates the virtual scaffolding within the main viewport.
     * @param {HTMLElement} parent The `realPost` element.
     * @param {number} totalItems Total count of sections in the Dayuh.
     * @returns {HTMLElement} The virtual scroll container.
     */
    static construct(parent, totalItems) {
        parent.innerHTML = "";

        const scrollContainer = document.createElement("div");
        scrollContainer.id = "virtual-scroll-container";
        scrollContainer.className = "awtsmoos-virtual-scroll awtsmoos-mobile-scroll";
        parent.appendChild(scrollContainer);

        const totalChunks = Math.ceil(totalItems / this.CHUNK_SIZE);
        for (let c = 0; c < totalChunks; c++) {
            const chunk = document.createElement("div");
            chunk.className = "scroll-chunk";
            chunk.dataset.chunkId = c;
            chunk.style.minHeight = `${this.CHUNK_SIZE * 65}px`;
            chunk.style.contain = "content";
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
