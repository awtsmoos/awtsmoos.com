
// B"H
import { DOM } from '../state.js';

export const SelectionUI = {
    showAt(x, y, count) {
        this.updateContent(count);
        DOM.selectionMenu.classList.add('visible');
        const r = DOM.selectionMenu.getBoundingClientRect();
        let px = x + 20, py = y;
        if (px + r.width > window.innerWidth) px = window.innerWidth - r.width - 10;
        if (py + r.height > window.innerHeight) py = window.innerHeight - r.height - 10;
        DOM.selectionMenu.style.left = `${Math.max(10, px)}px`;
        DOM.selectionMenu.style.top = `${Math.max(10, py)}px`;
    },
    hide: () => DOM.selectionMenu.classList.remove('visible'),
    updateContent(count) {
        DOM.selectionMenu.innerHTML = `
            <div class="selection-header-vertical">
                <span>${count} Selected</span>
                <button class="cancel-icon-btn" data-action="cancel">×</button>
            </div>
            <div class="selection-list-vertical">
                <button data-action="copy">Copy (To Paste)</button>
                <button data-action="copy-md">Copy as .MD (Text)</button>
                <button data-action="download-md">Download as .MD</button>
                <hr class="selection-menu-sep" />
                <button data-action="copy-zip">Copy as ZIP</button>
                <button data-action="download-zip">Download ZIP</button>
                <hr class="selection-menu-sep" />
                <button data-action="delete" class="danger">Delete</button>
            </div>`;
    }
};
