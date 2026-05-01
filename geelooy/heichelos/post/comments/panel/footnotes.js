
//B"H
/**
 * @file footnotes.js
 * @description 
 * Renders the footnotes side panel using the Genesis Engine.
 * Purged of `innerHTML` strings.
 */

import { GenesisEngine } from "../../functions/dom/GenesisEngine.js";

export function renderFootnotesPanel(actualTab) {
    actualTab.innerHTML = "";
    const footnotes = window.post?.dayuh?.footnotes;
    
    if(!footnotes || !Array.isArray(footnotes) || footnotes.length === 0) {
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
        children: footnotes.map((note, i) => {
            const idVal = note.id || (i + 1);
            return {
                tag: 'div',
                attr: { class: 'awtsmoos-list-item footnote-item', 'data-footnote-id': idVal },
                events: {
                    click: (e) => {
                        e.stopPropagation();
                        const ref = document.querySelector(`sup[data-footnote-id="${CSS.escape(idVal)}"], .footnote-ref[data-footnote-id="${CSS.escape(idVal)}"]`);
                        if(ref) {
                            ref.scrollIntoView({ behavior: 'smooth', block: 'center' });
                            ref.classList.add('active-footnote-match');
                            setTimeout(() => ref.classList.remove('active-footnote-match'), 2000);
                            
                            if (window.innerWidth <= 900) {
                                import("../../logic/listeners.js").then(m => m.toggleSidebar(false));
                            }
                        }
                    }
                },
                children:[
                    {
                        tag: 'div',
                        attr: { class: 'footnote-id' },
                        text: String(idVal)
                    },
                    {
                        tag: 'div',
                        attr: { style: 'font-size:14px; line-height:1.5;' },
                        text: note.content || ""
                    }
                ]
            };
        })
    };

    actualTab.appendChild(GenesisEngine.manifest(listPlan));
}
