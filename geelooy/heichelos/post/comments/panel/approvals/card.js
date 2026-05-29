// B"H
/**
 * @module ApprovalCard
 * @description
 * Chapter 6: Each submitted spark receives a card, a coordinate, and two gates:
 * deny or approve. Navigation avoids buttons and follows the text itself.
 */

import { navigateApprovalCoordinate } from "../coordinateNavigator.js";
import { optimisticDecision } from "./mutation.js";
import { coordinateText, previewText } from "./text.js";

/** @param {object} comment @param {HTMLElement} list @returns {object} */
export function renderCard(comment, list) {
    const commentId = comment.id || comment.commentId;
    return {
        tag: "article",
        attr: { class: "approval-card awtsmoos-list-item", "data-comment-id": commentId || "" },
        events: { click: event => { if (!event.target.closest("button")) navigateApprovalCoordinate(comment); } },
        children: [renderTop(comment), { tag: "p", attr: { class: "approval-preview" }, text: previewText(comment) }, renderActions(comment, list)]
    };
}

function renderTop(comment) {
    return {
        tag: "div",
        attr: { class: "approval-card-top" },
        children: [
            { tag: "div", attr: { class: "approval-author" }, text: `@${comment.aliasId || comment.author || "unknown"}` },
            { tag: "div", attr: { class: "approval-coordinate" }, text: coordinateText(comment) }
        ]
    };
}

function actionButton(comment, list, action, label) {
    return {
        tag: "button",
        attr: { class: `approval-${action}`, type: "button" },
        text: label,
        events: {
            click: async event => {
                event.stopPropagation();
                await optimisticDecision({ comment, action, card: event.currentTarget.closest("article"), list });
            }
        }
    };
}

function renderActions(comment, list) {
    return {
        tag: "div",
        attr: { class: "approval-actions" },
        children: [actionButton(comment, list, "deny", "Deny"), actionButton(comment, list, "approve", "Approve")]
    };
}
