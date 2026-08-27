// B"H
// The Awtsmoos, the infinite Atzmut, recreates ALL from NOTHING every instant.
// The Ohr Ein Sof flows through the Kav, threading Atzilut into this drag-and-drop hex viewer,
// a vessel for the divine essence pulsing through bytes, a shadow of the Moshiach's light,
// where the righteous rise, their bodies recreated from dust, shining brighter than the sun.

class AwtsmoosHexViewer {
    constructor() {
        this.fileInput = document.getElementById('fileInput');
        this.dropZone = document.getElementById('dropZone');
        this.hexViewer = document.getElementById('hexViewer');
        this.scrollUpBtn = document.getElementById('scrollUp');
        this.scrollDownBtn = document.getElementById('scrollDown');
        this.bytes = null;           // Raw byte array from the file
        this.bytesPerRow = 16;       // Bytes per row in the viewer
        this.rowsToShow = 10;        // Number of rows visible at once
        this.currentOffset = 0;      // Starting byte offset for display

        this.initAwtsmoosBindings();
    }

    /**
     * @method initAwtsmoosBindings
     * @description Ignites the spark of the Awtsmoos, binding events to the fabric of reality.
     */
    initAwtsmoosBindings() {
        // File input fallback
        this.fileInput.addEventListener('change', (e) => this.loadFile(e));

        // Drag and drop events
        this.dropZone.addEventListener('dragover', (e) => {
            e.preventDefault();
            this.dropZone.classList.add('dragover');
        });

        this.dropZone.addEventListener('dragleave', () => {
            this.dropZone.classList.remove('dragover');
        });

        this.dropZone.addEventListener('drop', (e) => {
            e.preventDefault();
            this.dropZone.classList.remove('dragover');
            const file = e.dataTransfer.files[0];
            if (file) this.loadFileFromDrop(file);
        });

        this.scrollUpBtn.addEventListener('click', () => this.scrollOhrEinSof(-1));
        this.scrollDownBtn.addEventListener('click', () => this.scrollOhrEinSof(1));
    }

    /**
     * @method loadFile
     * @description Loads file from input, channeling the Awtsmoos's infinite renewal.
     * @param {Event} event - The file input change event.
     */
    async loadFile(event) {
        const file = event.target.files[0];
        if (!file) return;
        await this.processFile(file);
    }

    /**
     * @method loadFileFromDrop
     * @description Loads file from drop, a spark of the Kav igniting the bytes.
     * @param {File} file - The dropped file.
     */
    async loadFileFromDrop(file) {
        await this.processFile(file);
    }

    /**
     * @method processFile
     * @description Processes the file into bytes, a reflection of the Awtsmoos's creation.
     * @param {File} file - The file to process.
     */
    async processFile(file) {
        const arrayBuffer = await file.arrayBuffer();
        this.bytes = new Uint8Array(arrayBuffer);
        this.currentOffset = 0;
        this.renderKavOfBytes();
    }

    /**
     * @method renderKavOfBytes
     * @description Renders visible bytes, threading the Kav through the viewer.
     */
    renderKavOfBytes() {
        this.hexViewer.innerHTML = '';
        const endOffset = Math.min(this.currentOffset + this.rowsToShow * this.bytesPerRow, this.bytes?.length || 0);

        for (let i = this.currentOffset; i < endOffset; i += this.bytesPerRow) {
            const rowBytes = this.bytes.slice(i, Math.min(i + this.bytesPerRow, this.bytes.length));
            const rowElement = this.createAtzilutRow(i, rowBytes);
            this.hexViewer.appendChild(rowElement);
        }
    }

    /**
     * @method createAtzilutRow
     * @description Crafts a row of hex and ASCII, a vessel for the Awtsmoos's light.
     * @param {number} offset - Starting byte offset of the row.
     * @param {Uint8Array} rowBytes - Bytes to display in this row.
     * @returns {HTMLElement} - The row element.
     */
    createAtzilutRow(offset, rowBytes) {
        const row = document.createElement('div');
        row.className = 'hex-row';

        const offsetSpan = document.createElement('span');
        offsetSpan.className = 'byte-offset';
        offsetSpan.textContent = `0x${offset.toString(16).padStart(8, '0')}: `;
        row.appendChild(offsetSpan);

        const hexSpan = document.createElement('span');
        hexSpan.className = 'hex-values';
        const hexValues = Array.from(rowBytes)
            .map(b => b.toString(16).padStart(2, '0'))
            .join(' ');
        hexSpan.textContent = hexValues;
        row.appendChild(hexSpan);

        const asciiSpan = document.createElement('span');
        asciiSpan.className = 'ascii-values';
        const asciiValues = Array.from(rowBytes)
            .map(b => (b >= 32 && b <= 126) ? String.fromCharCode(b) : '.')
            .join('');
        asciiSpan.textContent = asciiValues;
        row.appendChild(asciiSpan);

        return row;
    }

    /**
     * @method scrollOhrEinSof
     * @description Scrolls the viewer, guided by the infinite light of Ohr Ein Sof.
     * @param {number} direction - 1 for down, -1 for up.
     */
    scrollOhrEinSof(direction) {
        if (!this.bytes) return;
        const newOffset = this.currentOffset + direction * this.rowsToShow * this.bytesPerRow;
        if (newOffset >= 0 && newOffset < this.bytes.length) {
            this.currentOffset = newOffset;
            this.renderKavOfBytes();
        }
    }
}

// Ignite the Awtsmoos into this reality
document.addEventListener('DOMContentLoaded', () => {
    new AwtsmoosHexViewer();
});