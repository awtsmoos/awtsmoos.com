// B"H
/**
 * @module MenuActions
 * @description
 * Chapter 214: Copy, reply, delete, share, and edit speak the new tongue.
 * A comment may be string, object, dayuh-rich, or legacy-shaped. The action
 * gate extracts readable text, targets the exact API context, and refreshes the
 * sidebar/inline world after mutations.
 */

import { deleteComment, editComment } from "/scripts/awtsmoos/api/utils.js";
import { extractCommentText } from "../logic/unroller.js";
import { handleUpload } from "./media.js";

function parseDayuh(dayuh) {
    if (!dayuh) return {};
    if (typeof dayuh === "object") return dayuh;
    try { return JSON.parse(dayuh) || {}; } catch { return {}; }
}

function textFromAny(value) {
    if (!value) return "";
    if (typeof value === "string") return value;
    if (typeof value === "number" || typeof value === "boolean") return String(value);
    if (Array.isArray(value)) return value.map(textFromAny).filter(Boolean).join("\n");
    const extracted = extractCommentText(value);
    const parts = [extracted.title, ...extracted.paragraphs].filter(Boolean);
    return parts.length ? parts.join("\n") : JSON.stringify(value);
}

function copyTextOf(comment) {
    const dayuh = parseDayuh(comment?.dayuh);
    return textFromAny(comment?.content) || textFromAny(dayuh.content) || textFromAny(dayuh.sections) || textFromAny(comment);
}

async function copyToClipboard(text) {
    try {
        await navigator.clipboard.writeText(text);
        return true;
    } catch (_) {
        const area = document.createElement("textarea");
        area.value = text;
        area.className = "awtsmoos-clipboard-proxy";
        document.body.appendChild(area);
        area.select();
        const ok = document.execCommand("copy");
        area.remove();
        return ok;
    }
}

function mutationContext(comment) {
    const dayuh = parseDayuh(comment?.dayuh);
    const verseSection = dayuh.verseSection ?? comment?.verseSection ?? "root";
    return {
        heichelId: window.post.heichel.id,
        parentType: "post",
        parentId: window.post.id,
        seriesId: window.series?.id || window.post.parentSeriesId,
        postId: window.post.id,
        aliasId: comment?.author || comment?.aliasId || window.curAlias,
        commentId: comment?.id,
        dayuh,
        verseSection
    };
}

async function refreshWorld() {
    if (window.refreshSidebarComments) await window.refreshSidebarComments();
    try {
        const inline = await import("/heichelos/post/comments/logic/inlineManifest.js");
        const aliases = new Set(Array.from(document.querySelectorAll("[data-alias],[data-from-alias]")).map(n => n.dataset.alias || n.dataset.fromAlias).filter(Boolean));
        await Promise.all(Array.from(aliases).map(alias => inline.manifestAliasInline(alias)));
    } catch (_) {}
}

async function shareComment(comment) {
    const url = `${location.origin}${location.pathname}${location.search}#comment-${encodeURIComponent(comment?.id || "")}`;
    if (navigator.share) {
        try { await navigator.share({ title: "Awtsmoos insight", url }); return; } catch (_) {}
    }
    await copyToClipboard(url);
}

function replyHost(el) {
    return el?.closest?.(".awtsmoos-shared-comment-card, .comment-content, .inline-comment") || el?.parentElement || null;
}

async function editCurrentComment(comment) {
    const ctx = mutationContext(comment);
    const current = copyTextOf(comment);
    const next = prompt("Edit this comment", current);
    if (next === null || next === current) return;
    const res = await editComment({
        heichelId: ctx.heichelId,
        parentType: ctx.parentType,
        parentId: ctx.parentId,
        seriesId: ctx.seriesId,
        postId: ctx.postId,
        aliasId: ctx.aliasId,
        commentId: ctx.commentId,
        content: next,
        dayuh: ctx.dayuh,
        get: { verseSection: ctx.verseSection }
    });
    if (res?.error) throw new Error(res.error?.message || res.error);
    await refreshWorld();
}

export async function handleMenuOption(option, comment, el) {
    if (!window.post) return;
    try {
        switch (option) {
            case "Copy": {
                const ok = await copyToClipboard(copyTextOf(comment));
                if (!ok) alert("Problem copying!");
                break;
            }
            case "Share":
                await shareComment(comment);
                break;
            case "Edit":
                await editCurrentComment(comment);
                break;
            case "Delete": {
                if (!confirm("B\"H - Are you certain you wish to return this insight to the void?")) return;
                const ctx = mutationContext(comment);
                const res = await deleteComment({ ...ctx, get: { verseSection: ctx.verseSection } });
                if (res?.success) document.querySelectorAll(`[data-cid="${CSS.escape(String(comment.id))}"]`).forEach(node => node.remove());
                await refreshWorld();
                break;
            }
            case "Reply": {
                const { handleReply } = await import("../render/actions.js");
                const container = replyHost(el);
                if (container) handleReply(comment, container);
                break;
            }
            case "Add Audio":
                await handleUpload(comment, "audio");
                break;
        }
    } catch (error) {
        console.error("B\"H - comment action failed", error);
        alert(error.message || "Comment action failed.");
    }
}
