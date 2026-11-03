// B"H
/**
 * @module CommentReplyAction
 * @description
 * Chapter 217: Reply becomes a real scribe chamber.
 * It handles object-shaped comments, allows a title and extra sections, writes
 * through the same post comments API, and stores replyToId in dayuh so the new
 * social comment system can index the branch without brittle assumptions.
 */

import { AwtsmoosPrompt } from "/scripts/awtsmoos/api/utils.js";
import { createWysiwygEditor } from "/heichelos/post/logic/wysiwyg.js";
import { routeSeriesId } from "../../commentSection/payload.js";

function getActiveAlias() {
    const alias = window.curAlias || localStorage.getItem("lastAliasUsed") || localStorage.getItem("awtsmoos-alias") || "";
    if (alias) window.curAlias = alias;
    return alias;
}

function parseDayuh(dayuh) {
    if (!dayuh) return {};
    if (typeof dayuh === "object") return dayuh;
    try { return JSON.parse(dayuh) || {}; } catch { return {}; }
}

function authorOf(comment) {
    return comment?.author || comment?.aliasId || comment?.owner || "unknown";
}

function makeReplyHeader(originalComment, replyContainer) {
    const header = document.createElement("div");
    header.className = "reply-header";
    const replyLabel = document.createElement("span");
    replyLabel.innerText = `Replying to @${authorOf(originalComment)}`;
    const closeBtn = document.createElement("button");
    closeBtn.className = "close-reply";
    closeBtn.type = "button";
    closeBtn.innerText = "×";
    closeBtn.onclick = () => replyContainer.remove();
    header.append(replyLabel, closeBtn);
    return header;
}

function makeTitleInput() {
    const input = document.createElement("input");
    input.type = "text";
    input.className = "awtsmoos-reply-title-input";
    input.placeholder = "Optional reply title / dibbur…";
    return input;
}

function sectionValues(list) {
    return Array.from(list.querySelectorAll(".awtsmoos-reply-section")).map(section => ({
        title: section.querySelector(".awtsmoos-extra-section-title")?.value?.trim() || "",
        text: section.querySelector(".awtsmoos-extra-section-text")?.value?.trim() || ""
    })).filter(section => section.title || section.text);
}

function addReplySection(list) {
    const section = document.createElement("section");
    section.className = "awtsmoos-reply-section";
    const title = document.createElement("input");
    title.className = "awtsmoos-extra-section-title";
    title.placeholder = "Section title";
    const text = document.createElement("textarea");
    text.className = "awtsmoos-extra-section-text";
    text.placeholder = "Reply section text or markdown…";
    const remove = document.createElement("button");
    remove.className = "awtsmoos-remove-section-btn reply-remove-section";
    remove.type = "button";
    remove.textContent = "Remove section";
    remove.onclick = () => section.remove();
    section.append(title, text, remove);
    list.appendChild(section);
}

function makeSectionControls() {
    const wrap = document.createElement("div");
    wrap.className = "awtsmoos-reply-section-wrap";
    const list = document.createElement("div");
    list.className = "awtsmoos-reply-section-list";
    const add = document.createElement("button");
    add.type = "button";
    add.className = "reply-add-section";
    add.textContent = "+ Add reply section";
    add.onclick = () => addReplySection(list);
    wrap.append(list, add);
    return { wrap, list };
}

function dayuhForReply(originalComment, title, sections) {
    const originalDayuh = parseDayuh(originalComment?.dayuh);
    const verseSection = originalDayuh.verseSection ?? originalComment?.verseSection ?? "root";
    const dayuh = { verseSection, replyToId: originalComment?.id };
    const sub = originalDayuh.subSection ?? originalDayuh.sub;
    if (sub !== undefined && sub !== null) dayuh.subSection = sub;
    if (title) dayuh.title = title;
    if (sections.length) dayuh.sections = sections;
    return dayuh;
}

async function refreshAfterReply({ activeAlias, dayuh, commentId, content, skipThreadRefresh = false }) {
    const payload = {
        aliasId: activeAlias,
        verseSection: dayuh.verseSection,
        commentId,
        newCommentData: { id: commentId, author: activeAlias, content, dayuh }
    };
    if (!skipThreadRefresh) {
        if (window.awtsmoosConductor?.handleNewComment) await window.awtsmoosConductor.handleNewComment(payload);
        else if (window.commentLogic?.handleNewComment) await window.commentLogic.handleNewComment(payload);
    }
    if (window.refreshSidebarComments) await window.refreshSidebarComments();
    try {
        const inline = await import("/heichelos/post/comments/logic/inlineManifest.js");
        await inline.manifestAliasInline(activeAlias);
        await inline.manifestAliasInline(authorOf({ author: activeAlias }));
    } catch (_) {}
}

const REPLY_TIMEOUT_MS = 45000;

async function postReply({ activeAlias, content, dayuh }) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), REPLY_TIMEOUT_MS);
    let response;
    try {
        response = await fetch(`/api/social/heichelos/${window.post.heichel.id}/post/${window.post.id}/comments/`, {
            method: "POST",
            body: new URLSearchParams({
                aliasId: activeAlias,
                // The series coordinate comes from the route the post is
                // actually read under, not a window global default.
                seriesId: routeSeriesId(),
                content,
                dayuh: JSON.stringify(dayuh)
            }),
            signal: controller.signal
        });
    } catch (error) {
        if (error?.name === "AbortError") {
            const timeout = new Error("The server took too long to answer. Your reply may still have posted — check the thread before reposting.");
            timeout.code = "COMMENT_SUBMIT_TIMEOUT";
            throw timeout;
        }
        throw error;
    } finally {
        clearTimeout(timer);
    }
    const res = await response.json();
    if (!(res?.success || res?.status === "success" || res?.ok)) throw new Error(res?.error?.message || res?.error || "Unknown Server Error");
    return res.details?.id || res.success?.id || res.id || res.postId || res.commentId;
}

function showReplyError(replyContainer, error) {
    let line = replyContainer.querySelector(".awtsmoos-reply-error");
    if (!line) {
        line = document.createElement("div");
        line.className = "awtsmoos-reply-error";
        line.setAttribute("role", "alert");
        replyContainer.appendChild(line);
    }
    line.textContent = String(error?.message || error || "Reply failed.");
    line.hidden = false;
}

function hideReplyError(replyContainer) {
    const line = replyContainer.querySelector(".awtsmoos-reply-error");
    if (line) {
        line.hidden = true;
        line.textContent = "";
    }
}

export function handleReply(originalComment, containerElement) {
    const activeAlias = getActiveAlias();
    if (!activeAlias) return AwtsmoosPrompt.go({ isAlert: true, headerTxt: "Login Required", bodyTxt: "Please sign in to reply." });
    if (!containerElement || containerElement.querySelector(".awtsmoos-reply-box")) return;

    const replyContainer = document.createElement("div");
    replyContainer.className = "awtsmoos-reply-box";
    const titleInput = makeTitleInput();
    const { editorWrapper, contentArea, sourceArea } = createWysiwygEditor();
    const { wrap: sectionWrap, list: sectionList } = makeSectionControls();
    contentArea.dataset.placeholder = "Transmit your response…";

    const submitBtn = document.createElement("button");
    submitBtn.className = "reply-submit";
    submitBtn.type = "button";
    submitBtn.innerText = "Transmit Reply";

    replyContainer.append(makeReplyHeader(originalComment, replyContainer), titleInput, editorWrapper, sectionWrap, submitBtn);
    submitBtn.onclick = async () => {
        if (submitBtn.disabled) return;
        // Gather everything BEFORE disabling anything: reading the editor
        // after the button was disabled used to be able to throw and leave
        // the composer wedged in its disabled state with no error shown.
        let html, text, title, sections;
        try {
            html = sourceArea?.style.display !== "none" ? sourceArea.value : contentArea.innerHTML;
            text = contentArea.innerText.trim() || String(sourceArea?.value || "").replace(/<[^>]*>/g, "").trim();
            title = titleInput.value.trim();
            sections = sectionValues(sectionList);
        } catch (error) {
            showReplyError(replyContainer, error);
            return;
        }
        if (!text && !title && !sections.length && !contentArea.querySelector("img")) {
            showReplyError(replyContainer, new Error("Write a reply first — nothing was sent."));
            return;
        }
        // The stored body is the author's own text, nothing else. The reply
        // relationship travels in dayuh.replyToId; the old code prepended a
        // markdown quote + parent snippet INTO the stored content, which is
        // how replies ended up displaying as raw internal markup.
        const dayuh = dayuhForReply(originalComment, title, sections);
        hideReplyError(replyContainer);
        submitBtn.disabled = true;
        submitBtn.innerText = "Transmitting...";
        try {
            const commentId = await postReply({ activeAlias, content: html, dayuh });
            // Show the new reply in place when possible instead of
            // depending on a full thread refetch surviving a slow server.
            let inserted = false;
            try {
                const { createCommentCard } = await import("/heichelos/post/social/CommentCard.js");
                const card = await createCommentCard({
                    id: commentId,
                    author: activeAlias,
                    aliasId: activeAlias,
                    content: html,
                    dayuh,
                    createdAt: Date.now(),
                    replies: []
                });
                if (card) {
                    containerElement.appendChild(card);
                    inserted = true;
                }
            } catch (_) {}
            replyContainer.remove();
            await refreshAfterReply({ activeAlias, dayuh, commentId, content: html, skipThreadRefresh: inserted });
        } catch (error) {
            console.error("B\"H - Reply Error:", error);
            showReplyError(replyContainer, error);
        } finally {
            // The composer (and its drafted text) survives failures; the
            // button always returns to a usable state.
            if (submitBtn.isConnected) {
                submitBtn.disabled = false;
                submitBtn.innerText = "Transmit Reply";
            }
        }
    };

    containerElement.appendChild(replyContainer);
    setTimeout(() => titleInput.focus(), 80);
}
