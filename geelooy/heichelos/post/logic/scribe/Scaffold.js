
/**
 * B"H
 * @module ScribeScaffold
 * @chapter The Dimensions of Infinity
 * @description
 * If all parts of a long scroll were revealed at once, the browser's 
 * capacity would shatter. The ScribeScaffold creates 'Chunks'—placeholder 
 * vessels that allow the user to perceive the true height of the 
 * infinite scroll without taxing the system.
 */

export class ScribeScaffold {
    /**
     * @constant CHUNK_SIZE
     * @description The number of Verses (sections) held by a single physical chunk.
     */
    static CHUNK_SIZE = 12;

    /**
     * @method construct
     * @description 
     * Creates the virtual scaffolding within the main viewport.
     * 
     * @param {HTMLElement} parent - The 'realPost' element.
     * @param {number} totalItems - Total count of sections in the Dayuh.
     * @returns {HTMLElement} - The virtual scroll container.
     */
    static construct(parent, totalItems) {
        parent.innerHTML = "";
        
        const scrollContainer = document.createElement("div");
        scrollContainer.id = "virtual-scroll-container";
        parent.appendChild(scrollContainer);

        const totalChunks = Math.ceil(totalItems / this.CHUNK_SIZE);
        
        for (let c = 0; c < totalChunks; c++) {
            const chunk = document.createElement("div");
            chunk.className = "scroll-chunk";
            chunk.dataset.chunkId = c;
            
            // B"H - Establishing the Border of Potentiality.
            // Placeholder height ensures the scrollbar behaves accurately.
            chunk.style.minHeight = `${this.CHUNK_SIZE * 65}px`; 
            chunk.style.contain = "content"; 
            
            scrollContainer.appendChild(chunk);
        }

        return scrollContainer;
    }

    /**
     * @method findChunkByItemIndex
     */
    static findChunkByItemIndex(index) {
        return Math.floor(index / this.CHUNK_SIZE);
    }
}
