// B"H
/**
 * @module CommentSubmit
 * @description
 * Chapter 5: Transmission becomes a clean river. Coordinates, payload, network,
 * events, and inline refresh happen in one narrow covenant.
 */

import { AwtsmoosPrompt } from "/scripts/awtsmoos/api/utils.js";
import { normalizeCommentCoordinate, coordinateToDayuh } from "/heichelos/post/comments/state/commentCoordinate.js";
import { emitAwtsmoosEvent } from "/heichelos/post/comments/state/eventBus.js";
import { hasMeaningfulContent } from "./editorValue.js";
import { getActiveAlias } from "./identity.js";
import { imagePayload } from "./media.js";

function commentCoordinate() {
    const params = new URLSearchParams(location.search);
    return normalizeCommentCoordinate({
        heichelId: window.post?.heichel?.id,
        seriesId: window?.post?.parentSeriesId,
        postId: window.post?.id,
        parentType: "post",
        parentId: window.post?.id,
        idx: params.get("idx"),
        sub: params.get("sub")
    });
}

async function postComment({ activeAlias, content, dayuhObject }) {
    const response = await fetch(`/api/social/heichelos/${window.post?.heichel?.id}/post/${window.post?.id}/comments/`, {
        method: "POST",
        body: new URLSearchParams({
            aliasId: activeAlias,
            content,
            seriesId: window?.post?.parentSeriesId,
            dayuh: JSON.stringify(dayuhObject)
        })
    });
    const json = await response.json();
    if (!json.success) throw new Error(json.error || "Void response.");
    return json.details?.id || json.success?.id || json.id;
}

async function refreshCommentSystems(payload) {
    emitAwtsmoosEvent("comment:submitted", payload);
    if (window.commentLogic?.handleNewComment) await window.commentLogic.handleNewComment(payload);
    else if (window.awtsmoosConductor?.handleNewComment) await window.awtsmoosConductor.handleNewComment(payload);
    const inline = await import("/heichelos/post/comments/logic/inlineManifest.js");
    await inline.manifestAliasInline(payload.aliasId);
}

/**
 * Sends a comment for the provided owner.
 * @param {object} owner CommentSection instance.
 * @param {string} content Editor HTML content.
 */
export async function submitComment(owner, content) {
    const images = imagePayload(owner.imgResults);
    if (!hasMeaningfulContent(content) && images.length === 0) return;
    const activeAlias = getActiveAlias();
    if (!activeAlias) throw new Error("Choose an alias before transmitting.");

    const coordinate = commentCoordinate();
    const dayuhObject = coordinateToDayuh(coordinate, { images });
    const commentId = await postComment({ activeAlias, content, dayuhObject });
    if (!commentId) return;

    await refreshCommentSystems({
        aliasId: activeAlias,
        commentId,
        verseSection: coordinate.verseSection,
        coordinate,
        content,
        newCommentData: { id: commentId, author: activeAlias, content, dayuh: dayuhObject }
    });
}

/** @param {Error} error */
export async function showSubmitError(error) {
    await AwtsmoosPrompt.go({ isAlert: true, headerTxt: "Error", bodyTxt: error.message });
}
