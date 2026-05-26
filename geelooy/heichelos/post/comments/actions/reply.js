// /BH/awtsmoos.com/geelooy/heichelos/post/comments/actions/reply.js
//B"H
import { AwtsmoosPrompt } from "/scripts/awtsmoos/api/utils.js";
import { createWysiwygEditor } from "/heichelos/post/logic/wysiwyg.js";

/**
 * B"H
 * @function getActiveAlias
 * @description
 * Reads every current alias vessel the reader already uses, so reply creation
 * works for fresh sessions, persisted profile selection, and API-key-backed
 * browser smoke tests without pretending the seeker vanished.
 * @returns {string} The active alias id, or an empty string.
 */
function getActiveAlias() {
    const alias = window.curAlias || localStorage.getItem("lastAliasUsed") || localStorage.getItem("awtsmoos-alias") || "";
    if (alias) window.curAlias = alias;
    return alias;
}

/**
 * B"H
 * @function makeReplyHeader
 * @description
 * Builds the reply heading without brittle inline HTML, keeping the close gate
 * clean across encodings while the comment tree branches like spoken light.
 * @param {Object} originalComment - The comment being answered.
 * @param {HTMLElement} replyContainer - The reply vessel to close.
 * @returns {HTMLElement} The mounted header element.
 */
function makeReplyHeader(originalComment, replyContainer) {
    const header = document.createElement("div");
    header.className = "reply-header";

    const replyLabel = document.createElement("span");
    replyLabel.innerText = `Replying to @${originalComment.author || "unknown"}`;

    const closeBtn = document.createElement("button");
    closeBtn.className = "close-reply";
    closeBtn.innerText = "x";
    closeBtn.onclick = () => replyContainer.remove();

    header.append(replyLabel, closeBtn);
    return header;
}

export function handleReply(originalComment, containerElement) {
    const activeAlias = getActiveAlias();
    if (!activeAlias) {
        return AwtsmoosPrompt.go({ isAlert: true, headerTxt: "Login Required", bodyTxt: "Please sign in to reply." });
    }

    if (containerElement.querySelector(".awtsmoos-reply-box")) return;

    const replyContainer = document.createElement("div");
    replyContainer.className = "awtsmoos-reply-box";

    const snippet = originalComment.content
        ? originalComment.content.substring(0, 50).replace(/\n/g, " ")
        : "Media content";

    replyContainer.appendChild(makeReplyHeader(originalComment, replyContainer));

    const { editorWrapper, contentArea } = createWysiwygEditor();
    contentArea.dataset.placeholder = "Transmit your response...";
    replyContainer.appendChild(editorWrapper);

    const submitBtn = document.createElement("button");
    submitBtn.className = "reply-submit";
    submitBtn.innerText = "Transmit Reply";
    replyContainer.appendChild(submitBtn);

    submitBtn.onclick = async () => {
        const text = contentArea.innerText.trim();
        const html = contentArea.innerHTML;
        if (!text && !contentArea.querySelector("img")) return;

        submitBtn.disabled = true;
        submitBtn.innerText = "Transmitting...";

        const replyContent = `> [Reply to @${originalComment.author}](#comment-${originalComment.id}): ${snippet}...\n\n${html}`;
        const verseSection = originalComment.dayuh?.verseSection ?? originalComment.verseSection ?? "root";
        const subSection = originalComment.dayuh?.subSection;
        const dayuh = { verseSection, replyToId: originalComment.id };
        if (subSection !== undefined && subSection !== null) dayuh.subSection = subSection;

        try {
            const endpoint = `/api/social/heichelos/${window.post.heichel.id}/post/${window.post.id}/comments/`;
            const response = await fetch(endpoint, {
                method: "POST",
                body: new URLSearchParams({
                    aliasId: activeAlias,
                    seriesId: window.post.parentSeriesId,
                    content: replyContent,
                    dayuh: JSON.stringify(dayuh)
                })
            });
            const res = await response.json();

            if (res && (res.success || res.status === "success" || res.ok)) {
                replyContainer.remove();
                const newId = res.details?.id || res.success?.id || res.id || res.postId || res.commentId;
                if (!newId && window.reloadRoot) window.reloadRoot();
                if (newId && window.awtsmoosConductor?.handleNewComment) {
                    await window.awtsmoosConductor.handleNewComment({
                        aliasId: activeAlias,
                        verseSection,
                        commentId: newId,
                        newCommentData: {
                            id: newId,
                            author: activeAlias,
                            content: replyContent,
                            dayuh
                        }
                    });
                }
            } else {
                const errMsg = res?.error?.message || res?.error || "Unknown Server Error";
                alert("Failed: " + errMsg);
                submitBtn.disabled = false;
                submitBtn.innerText = "Transmit Reply";
            }
        } catch (e) {
            console.error("B\"H - Reply Error:", e);
            alert("Network error.");
            submitBtn.disabled = false;
            submitBtn.innerText = "Transmit Reply";
        }
    };

    containerElement.appendChild(replyContainer);
    setTimeout(() => contentArea.focus(), 100);
}
