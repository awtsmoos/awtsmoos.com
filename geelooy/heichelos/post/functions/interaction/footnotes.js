// /BH/awtsmoos.com/geelooy/heichelos/post/functions/interaction/footnotes.js
//B"H
/**
 * @file footnotes.js
 * The Keeper of Hidden Wisdom. Every small <sup>/<sub> spark may open the
 * sidebar chamber when its note exists, no matter which footnote garment the
 * post data wears.
 */

import { findFootnoteById, getNormalizedFootnotes, readFootnoteIdFromRef } from "./footnoteData.js";

function getFootnoteRefs() {
    return document.querySelectorAll('#realPost sup, #realPost sub, .footnote-ref, [data-footnote-id], [data-note-id]');
}

async function openFootnoteChamber(id, matching) {
    if (window.openFootnotesPanel) {
        await window.openFootnotesPanel(id);
        setTimeout(() => {
            const item = document.querySelector(`.awtsmoos-list-item[data-footnote-id="${CSS.escape(id)}"]`);
            if (!item) return;
            item.scrollIntoView({ behavior: 'smooth', block: 'center' });
            item.classList.add('active');
            setTimeout(() => item.classList.remove('active'), 2200);
        }, 450);
        return;
    }

    createFootnoteOverlay(matching?.content || matching?.paragraphs?.join("<br>") || "");
}

export function initializeFootnotes() {
    const footnotesMeta = getNormalizedFootnotes(window.post?.dayuh);
    if (!footnotesMeta.length) return;

    const refs = getFootnoteRefs();
    refs.forEach(ref => {
        const id = readFootnoteIdFromRef(ref);
        if (!id) return;

        const matching = findFootnoteById(id, window.post?.dayuh);
        if (!matching) return;

        ref.style.cursor = "pointer";
        ref.dataset.footnoteId = id;
        ref.setAttribute("role", "button");
        ref.setAttribute("tabindex", "0");
        ref.title = ref.title || `Footnote ${id}`;

        const awaken = async (e) => {
            e.preventDefault();
            e.stopPropagation();
            await openFootnoteChamber(id, matching);
        };

        ref.onclick = awaken;
        ref.onkeydown = (e) => {
            if (e.key === "Enter" || e.key === " ") awaken(e);
        };
    });
}

export function createFootnoteOverlay(content) {
    const existing = document.getElementById('footnote-overlay');
    if (existing) existing.remove();
    
    const overlay = document.createElement('div');
    overlay.id = 'footnote-overlay';
    overlay.className = "awtsmoos-footnote-overlay";
    
    const contentBox = document.createElement('div');
    contentBox.className = "awtsmoosFootnote";
    contentBox.innerHTML = content;

    overlay.onclick = () => overlay.remove();
    contentBox.onclick = (e) => e.stopPropagation();

    overlay.appendChild(contentBox);
    document.body.appendChild(overlay);
}