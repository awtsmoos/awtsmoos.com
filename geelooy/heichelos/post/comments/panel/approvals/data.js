// B"H
/**
 * @module ApprovalData
 * @description
 * Chapter 6: The approval river receives clean data channels. Alias, fetching,
 * normalization, coordinates, and mutation calls live here.
 */

import { emitAwtsmoosEvent } from "../../state/eventBus.js";
import { approvalCoordinate } from "../coordinateNavigator.js";

/** @returns {string} Active reviewing alias. */
export function activeAlias() {
    const alias = window.curAlias || localStorage.getItem("lastAliasUsed") || "";
    if (alias) window.curAlias = alias;
    return alias;
}

/** @returns {Promise<object>} Submitted comments payload. */
export async function fetchSubmissions() {
    const aliasId = activeAlias();
    if (!aliasId) return { error: "Choose an alias before reviewing approvals." };
    const url = `/api/social/heichelos/${window.post?.heichel?.id}/submittedComments?${new URLSearchParams({ aliasId })}`;
    const res = await fetch(url);
    return res.json();
}

/** @param {object} payload @returns {Array<object>} */
export function normalizeSubmitted(payload) {
    const raw = payload?.comments || payload?.success || [];
    if (Array.isArray(raw)) return raw;
    if (!raw || typeof raw !== "object") return [];
    return Object.entries(raw).map(([id, value]) => ({ id, ...(value || {}) }));
}

/** @param {object} comment @returns {object} */
export function coordinateFor(comment) {
    return approvalCoordinate(comment);
}

/** @param {object} comment @param {string} action @returns {Promise<object>} */
export async function decide(comment, action) {
    const commentId = comment.id || comment.commentId;
    const aliasId = activeAlias();
    const coordinate = coordinateFor(comment);
    const url = `/api/social/heichelos/${window.post?.heichel?.id}/submittedComments/${action}`;
    const res = await fetch(url, { method: "POST", body: new URLSearchParams({ aliasId, commentId }) });
    const json = await res.json();
    if (!json?.error && window.commentLogic?.handleNewComment && action === "approve") {
        await window.commentLogic.handleNewComment({ aliasId, coordinate });
    }
    emitAwtsmoosEvent(action === "approve" ? "comment:approved" : "comment:denied", {
        aliasId, commentId, coordinate, response: json
    });
    return json;
}
