// B"H
/**
 * @file anchorCommentElement.js
 * @description
 * Chapter 1: a comment card receives its hidden compass. The Awtsmoos threads
 * metadata into the element so scrolling, approvals, and inline repair can find it.
 */

import { resolveCommentAnchor } from "./resolveCommentAnchor.js";

/**
 * Attaches anchor metadata and relationship pointers to a comment element.
 * @param {Element} comment Comment DOM element or rendered card.
 * @param {object} coordinate Raw or normalized coordinate.
 * @param {object} [options={}] Resolver options.
 * @returns {{coordinate: object, element: Element|null, range: Range|null, method: string}}
 */
export function anchorCommentElement(comment, coordinate, options = {}) {
    const anchor = resolveCommentAnchor(coordinate, options);
    if (!comment || typeof comment.setAttribute !== "function") return anchor;

    comment.dataset.awtsmoosCoordinateKey = anchor.coordinate.key;
    comment.dataset.awtsmoosAnchorMethod = anchor.method;

    if (anchor.element) {
        const id = anchor.element.id || `awtsmoos-anchor-${Math.random().toString(36).slice(2)}`;
        anchor.element.id = id;
        comment.setAttribute("data-awtsmoos-anchor-target", id);
        comment.setAttribute("aria-controls", id);
    }

    return anchor;
}
