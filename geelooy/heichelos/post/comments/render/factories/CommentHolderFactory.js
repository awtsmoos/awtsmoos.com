
/**
 * B"H
 * @module CommentHolderFactory
 * @chapter The Folding Universe
 * @description
 * Creates the retractable Gate for marginal insights.
 * Just as a vessel contains the light but can be closed to focus,
 * this holder organizes the Guardian's transmissions directly beneath 
 * the exact paragraph they are commenting on.
 * 
 * We have altered the default state to 'active' and 'flex', ensuring 
 * that when the Awtsmoos commands these vessels to appear on page load, 
 * they do not hide their light behind 'display: none'.
 */

import { BlueprintManifestor } from "../../logic/manifestation/BlueprintManifestor.js";

/**
 * @function makeInlineCommentHolder
 * @description Forges the physical gateway for an Alias in the margin.
 * 
 * @param {string} alias - The identity of the Guardian.
 * @param {HTMLElement} parent - The container.
 * @param {string|number} idx - The coordinate.
 */
export function makeInlineCommentHolder(alias, parent, idx) {
    const blueprint = {
        tag: 'div',
        attr: { class: 'commentator inline-holder', 'data-alias': alias, 'data-idx': idx },
        children:[
            {
                tag: 'button',
                // B"H - Default to active so the light is revealed instantly
                attr: { class: 'inline-summary-btn active' },
                children:[
                    { tag: 'span', children: ['💬'] },
                    { tag: 'span', children: [`Insights (@${alias})`] }
                ],
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
                // B"H - Default to flex so it is visible upon creation
                attr: { class: 'comments-holder-inline', style: 'display: flex;' }
                // The manifestation cards will be appended here by the Weaver
            }
        ]
    };

    return BlueprintManifestor.manifest(blueprint);
}
