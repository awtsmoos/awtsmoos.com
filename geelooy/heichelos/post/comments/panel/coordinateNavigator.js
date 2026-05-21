// B"H
/**
 * @file coordinateNavigator.js
 * @description
 * The approval queue needs a tiny compass. This module scrolls to the resolved
 * coordinate and marks the vessel without binding panel code to anchor internals.
 */

import { normalizeCommentCoordinate } from "../state/commentCoordinate.js";
import { resolveCommentAnchor } from "../inline/anchors/index.js";

/**
 * Normalizes a submitted comment into the post-reader coordinate shape.
 * @param {object} comment Submitted comment payload.
 * @returns {object} Normalized coordinate.
 */
export function approvalCoordinate(comment = {}) {
    return normalizeCommentCoordinate({
        ...comment,
        dayuh: comment.dayuh,
        heichelId: window.post?.heichel?.id,
        seriesId: window.post?.parentSeriesId,
        postId: window.post?.id
    });
}

/**
 * Scrolls to a comment coordinate and marks its vessel briefly.
 * @param {object} comment Submitted comment payload.
 * @returns {boolean} True when a DOM element was found.
 */
export function navigateApprovalCoordinate(comment = {}) {
    const anchor = resolveCommentAnchor(approvalCoordinate(comment));
    if (!anchor.element) return false;

    anchor.element.scrollIntoView({ behavior: "smooth", block: "center" });
    anchor.element.classList.add("awtsmoos-approval-target");

    setTimeout(() => {
        anchor.element?.classList?.remove("awtsmoos-approval-target");
    }, 2200);

    return true;
}
