
/**
 * B"H
 * @module CommentHolderFactory
 * @chapter The Folding Universe
 * @description
 * Creates the retractable Gate for marginal insights.
 * Just as a vessel contains the light but can be closed to focus,
 * this holder organizes the Guardian's transmissions in the margin.
 */

import { BlueprintManifestor } from "../../logic/manifestation/BlueprintManifestor.js";

/**
 * @function makeInlineCommentHolder
 * @description Forges the physical gateway for an Alias in the margin.
 */
export function makeInlineCommentHolder(alias, parent, idx) {
    const blueprint = {
        tag: 'div',
        attr: { class: 'commentator inline-holder', 'data-alias': alias, 'data-idx': idx },
        children: [
            {
                tag: 'button',
                attr: { class: 'inline-summary-btn' },
                children: [`💬 insights (@${alias})`],
                ref: 'toggleBtn',
                events: {
                    click: (e) => {
                        const btn = e.currentTarget;
                        const list = btn.nextElementSibling;
                        const isHidden = getComputedStyle(list).display === "none";
                        list.style.display = isHidden ? "flex" : "none";
                        btn.classList.toggle("active", isHidden);
                    }
                }
            },
            {
                tag: 'div',
                attr: { class: 'comments-holder-inline', style: 'display: none;' },
                ref: 'list'
            }
        ]
    };

    return BlueprintManifestor.manifest(blueprint);
}
