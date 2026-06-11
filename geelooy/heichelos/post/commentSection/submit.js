// B"H
/**
 * @module CommentSubmit
 * @description
 * Chapter 201: The reader remains the reader.
 *
 * We keep the old post-comment endpoint as the source path for existing inline
 * and sidebar logic, while also mirroring the same comment into the rich entity
 * comment tree when available. If the new mirror resists, the old reader still
 * succeeds. Root, verse, subsection, images, title, and sectioned comments all
 * travel in the old dayuh vessel and in explicit new fields.
 */

import { AwtsmoosPrompt } from "/scripts/awtsmoos/api/utils.js";
import { normalizeCommentCoordinate, coordinateToDayuh } from "/heichelos/post/comments/state/commentCoordinate.js";
import { emitAwtsmoosEvent } from "/heichelos/post/comments/state/eventBus.js";
import { hasMeaningfulContent } from "./editorValue.js";
import { getActiveAlias } from "./identity.js";
import { imagePayload } from "./media.js";

function currentCoordinate(owner) {
    if (owner?.scopeMode === "root") return normalizeCommentCoordinate({
        heichelId: window.post?.heichel?.id,
        seriesId: window?.post?.parentSeriesId,
        postId: window.post?.id,
        parentType: "post",
        parentId: window.post?.id,
        idx: null,
        sub: null
    });
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

function extraSections(owner) {
    return Array.from(owner?.sectionList?.querySelectorAll?.(".awtsmoos-comment-extra-section") || [])
        .map((section, index) => ({
            id: section.dataset?.sectionId || `reader_section_${index + 1}`,
            title: section.querySelector(".awtsmoos-extra-section-title")?.value?.trim() || "",
            content: section.querySelector(".awtsmoos-extra-section-text")?.value?.trim() || ""
        }))
        .filter(section => section.title || section.content);
}

function asAssetPayload(images) {
    return images.map((image, index) => ({
        id: image.id || image.assetId || image.img || `reader_image_${index + 1}`,
        type: "image",
        publicPath: image.img || image.medium || image.thumbnail || "",
        alt: image.alt || "Reader image"
    })).filter(asset => asset.publicPath);
}

function oldCommentBody({ activeAlias, content, dayuhObject, coordinate }) {
    return new URLSearchParams({
        aliasId: activeAlias,
        content,
        seriesId: window?.post?.parentSeriesId || "root",
        verseSection: coordinate.verseSection || "root",
        subsectionId: coordinate.subSection ?? coordinate.sub ?? "",
        dayuh: JSON.stringify(dayuhObject)
    });
}

async function postOldComment({ activeAlias, content, dayuhObject, coordinate }) {
    const response = await fetch(`/api/social/heichelos/${window.post?.heichel?.id}/post/${window.post?.id}/comments/`, {
        method: "POST",
        body: oldCommentBody({ activeAlias, content, dayuhObject, coordinate })
    });
    const json = await response.json();
    if (!json.success) throw new Error(json.error?.message || json.error || "Void response.");
    return json.details?.id || json.success?.id || json.commentId || json.id;
}

async function mirrorRichComment({ activeAlias, content, dayuhObject, coordinate, assets, sections }) {
    try {
        const response = await fetch(`/api/social/heichelos/${window.post?.heichel?.id}/posts/${window.post?.id}/comment-tree`, {
            method: "POST",
            body: new URLSearchParams({
                aliasId: activeAlias,
                seriesId: window?.post?.parentSeriesId || "root",
                content,
                verseSection: coordinate.verseSection || "root",
                subsectionId: coordinate.subSection ?? coordinate.sub ?? "",
                assets: JSON.stringify(assets),
                sections: JSON.stringify(sections),
                links: JSON.stringify(dayuhObject.links || [])
            })
        });
        const json = await response.json();
        return json.success || null;
    } catch (error) {
        console.warn("B\"H - rich comment mirror resisted; old reader comment already lives", error);
        return null;
    }
}

async function refreshSidebar(activeAlias) {
    try {
        const panel = await import("/heichelos/post/comments/panel/fetching.js");
        panel.clearSidebarCommentCache?.();
    } catch (_) {}
    try {
        const target = window.rootLevelCommentatorTab?.actual || window.tabParent;
        if (target && window.makeCommentatorList) await window.makeCommentatorList(target, true);
        if (window.currentAliasTabContainer && window.openCommentsOfAlias && window.currentAliasBeingViewed) {
            await window.openCommentsOfAlias({ alias: window.currentAliasBeingViewed, actualTab: window.currentAliasTabContainer, post: window.post });
        }
    } catch (error) {
        console.warn("B\"H - sidebar refresh resisted", error);
    }
    return activeAlias;
}

async function refreshCommentSystems(payload) {
    emitAwtsmoosEvent("comment:submitted", payload);
    if (window.commentLogic?.handleNewComment) await window.commentLogic.handleNewComment(payload);
    else if (window.awtsmoosConductor?.handleNewComment) await window.awtsmoosConductor.handleNewComment(payload);
    try {
        const inline = await import("/heichelos/post/comments/logic/inlineManifest.js");
        await inline.manifestAliasInline(payload.aliasId);
    } catch (_) {}
    await refreshSidebar(payload.aliasId);
}

/** @param {object} owner @param {string} content */
export async function submitComment(owner, content) {
    const images = imagePayload(owner.imgResults);
    const title = owner.titleInput?.value?.trim() || "";
    const sections = extraSections(owner);
    const hasSections = sections.some(section => section.title || section.content);
    if (!hasMeaningfulContent(content) && images.length === 0 && !title && !hasSections) return;
    const activeAlias = getActiveAlias();
    if (!activeAlias) throw new Error("Choose an alias before transmitting.");

    const coordinate = currentCoordinate(owner);
    const assets = asAssetPayload(images);
    const dayuhObject = coordinateToDayuh(coordinate, { images, assets });
    if (title) dayuhObject.title = title;
    if (sections.length) dayuhObject.sections = sections;
    const commentId = await postOldComment({ activeAlias, content, dayuhObject, coordinate });
    if (!commentId) return;
    const richMirror = await mirrorRichComment({ activeAlias, content, dayuhObject, coordinate, assets, sections });
    await refreshCommentSystems({
        aliasId: activeAlias,
        commentId,
        richCommentId: richMirror?.id || "",
        verseSection: coordinate.verseSection,
        subsectionId: coordinate.subSection ?? coordinate.sub ?? "",
        coordinate,
        content,
        newCommentData: { id: commentId, author: activeAlias, content, dayuh: dayuhObject, assets, sections }
    });
}

/** @param {Error} error */
export async function showSubmitError(error) {
    await AwtsmoosPrompt.go({ isAlert: true, headerTxt: "Error", bodyTxt: error.message });
}
