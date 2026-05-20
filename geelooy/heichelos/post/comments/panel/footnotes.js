
//B"H
/**
 * @file footnotes.js
 * @description
 * Renders the footnotes side panel using the Genesis Engine, after normalizing
 * all known footnote packet shapes into one luminous list.
 */

import { GenesisEngine } from "../../functions/dom/GenesisEngine.js";
import { getNormalizedFootnotes } from "../../functions/interaction/footnoteData.js";

function paragraphChildren(note) {
    const paragraphs = note.paragraphs?.length ? note.paragraphs : [note.content || ""];
    return paragraphs.map(text => ({
        tag: 'p',
        attr: { class: 'footnote-paragraph' },
        text: String(text)
    }));
}

export function renderFootnotesPanel(actualTab) {
    actualTab.innerHTML = "";
    const footnotes = getNormalizedFootnotes(window.post?.dayuh);
    
    if (!footnotes.length) {
        const emptyPlan = {
            tag: 'div',
            attr: { style: 'padding:20px; text-align:center; color:#888; font-weight: 700;' },
            text: 'No footnotes found for this post.'
        };
        actualTab.appendChild(GenesisEngine.manifest(emptyPlan));
        return;
    }

    const listPlan = {
        tag: 'div',
        attr: { class: 'footnotes-list' },
        children: footnotes.map(note => {
            const idVal = note.id;
            return {
                tag: 'div',
                attr: { class: 'awtsmoos-list-item footnote-item', 'data-footnote-id': idVal },
                events: {
                    click: (e) => {
                        e.stopPropagation();
                        const ref = document.querySelector(`sup[data-footnote-id="${CSS.escape(idVal)}"], sub[data-footnote-id="${CSS.escape(idVal)}"], .footnote-ref[data-footnote-id="${CSS.escape(idVal)}"]`);
                        if (ref) {
                            ref.scrollIntoView({ behavior: 'smooth', block: 'center' });
                            ref.classList.add('active-footnote-match');
                            setTimeout(() => ref.classList.remove('active-footnote-match'), 2000);
                            
                            if (window.innerWidth <= 900) {
                                import("../../logic/listeners.js").then(m => m.toggleSidebar(false));
                            }
                        }
                    }
                },
                children: [
                    {
                        tag: 'div',
                        attr: { class: 'footnote-id' },
                        text: String(idVal)
                    },
                    {
                        tag: 'div',
                        attr: { class: 'footnote-text' },
                        children: paragraphChildren(note)
                    }
                ]
            };
        })
    };

    actualTab.appendChild(GenesisEngine.manifest(listPlan));
}
