
/**
 * B"H
 * @module InlineCardFactory
 * @chapter The Secret Note in the Margin
 * @description
 * Every Torah scroll has its 'Gilyon'—the margins where insights dwell.
 * This factory creates the 'Marginalia', the sparks that hover 
 * beside the primary text to reveal its hidden depths.
 */

import { BlueprintManifestor } from "../../logic/manifestation/BlueprintManifestor.js";
import { populateCommentElement } from "../corePopulation.js";
import { expandPathToComment } from "../tree.js";

/**
 * @function makeInlineComment
 * @description 
 * Forges the physical vessel for an insight manifest in the 
 * scroll's margins.
 * 
 * @param {Object} comment - The raw letters from the Source.
 * @returns {HTMLElement} - The physicalized gloss.
 */
export function makeInlineComment(comment) {
    if (!comment) return document.createComment("Empty Insight");

    const blueprint = {
        tag: 'div',
        attr: { 
            class: 'inline-comment intense-marginalia awtsmoos-inline-commentary-root',
            'data-cid': comment.id 
        },
        children: [
            {
                tag: 'div',
                attr: { class: 'focus-trigger', title: 'Bring into main focus' },
                children: ['↗'],
                events: {
                    click: (e) => handleMarginalFocus(e, comment)
                }
            },
            {
                tag: 'div',
                attr: { class: 'comment-body-vessel' },
                ref: 'body'
            }
        ]
    };

    // 1. Speak the Blueprint into existence
    const manifest = BlueprintManifestor.manifest(blueprint);
    
    // 2. Populate the body vessel with its content
    const body = manifest.querySelector('.comment-body-vessel');
    populateCommentElement(comment, body);

    return manifest;
}

/**
 * @private
 * @function handleMarginalFocus
 */
async function handleMarginalFocus(e, comment) {
    e.stopPropagation();
    if (!window.openCommentsPanelToAlias) return;

    // Command the sidebar to manifest this specific Guardian
    const container = await window.openCommentsPanelToAlias(comment.author);
    if (container) {
        setTimeout(() => {
            const target = container.querySelector(`.comment-content[data-cid="${comment.id}"]`);
            if (target) {
                expandPathToComment(target);
                target.scrollIntoView({ behavior: 'smooth', block: 'center' });
                target.classList.add('pulse-of-light');
                setTimeout(() => target.classList.remove('pulse-of-light'), 2000);
            }
        }, 400);
    }
}
