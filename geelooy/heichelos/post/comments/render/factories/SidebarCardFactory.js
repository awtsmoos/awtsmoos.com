
/**
 * B"H
 * @module SidebarCardFactory
 * @chapter The Assembly of the Insight-Tabernacle
 * @description
 * The sidebar is the repository of history and collective wisdom. 
 * This factory creates the primary 'Card' through which seekers
 * interact with a Guardian's full transmission.
 */

import { BlueprintManifestor } from "../../logic/manifestation/BlueprintManifestor.js";
import { populateCommentElement } from "../corePopulation.js";
import { handleMenuOption } from "../actions.js";
import { isAliasInline } from "../../state/inline/RegistryLogic.js";
import { expandPathToComment } from "../tree.js";

/**
 * @function makeHTMLFromComment
 * @description Manifests a sidebar card from the raw JSON of an insight.
 */
export function makeHTMLFromComment(comment) {
    if (!comment) return document.createComment("Silence");

    const blueprint = {
        tag: 'div',
        attr: { class: 'comment-content awtsmoos-card', 'data-cid': comment.id },
        children: [
            {
                tag: 'div',
                attr: { class: 'comment-text-root' },
                ref: 'textContainer'
            },
            {
                tag: 'div',
                attr: { class: 'comment-toolbar' },
                children: [
                    createLocateBtn(comment),
                    createActionMenu(comment)
                ]
            }
        ]
    };

    const manifest = BlueprintManifestor.manifest(blueprint);
    const textTarget = manifest.querySelector('.comment-text-root');
    
    // Fill the vessel with the Scribe's word
    populateCommentElement(comment, textTarget);

    return manifest;
}

function createLocateBtn(comment) {
    if (!isAliasInline(comment.author)) return null;
    return {
        tag: 'button',
        attr: { class: 'btn small locate-trigger', style: 'text-transform: none !important;' },
        children: ['📍 Locate'],
        events: {
            click: (e) => {
                e.stopPropagation();
                const inlineEl = document.querySelector(`.inline-comment[data-cid="${comment.id}"]`);
                if (inlineEl) {
                    expandPathToComment(inlineEl);
                    inlineEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    inlineEl.classList.add('signal-active');
                }
            }
        }
    };
}

function createActionMenu(comment) {
    return {
        tag: 'div',
        attr: { class: 'menu-chariot' },
        children: [
            { tag: 'button', attr: { class: 'menu-btn' }, children: ['⋮'] },
            {
                tag: 'div',
                attr: { class: 'menu-dropdown hidden' },
                children: ['Copy', 'Delete'].map(opt => ({
                    tag: 'div',
                    attr: { class: 'menu-item', style: 'text-transform: none !important;' },
                    children: [opt],
                    events: { click: (e) => {
                        e.stopPropagation();
                        handleMenuOption(opt, comment, e.target);
                    }}
                }))
            }
        ],
        events: {
            click: (e) => {
                const drop = e.currentTarget.querySelector('.menu-dropdown');
                drop.classList.toggle('hidden');
            }
        }
    };
}
