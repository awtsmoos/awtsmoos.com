// B"H
/** @module AiChatSave */
import { AwtsmoosPrompt } from "/scripts/awtsmoos/api/utils.js";
import { aiChatState, setActiveCommentId } from "./state.js";

function resetSaveButton(btn, text = "💾 SAVE") {
    btn.disabled = false;
    btn.innerText = text;
}

async function notifyNewSavedComment({ currentAlias, verseSection, newId, bodyParams, dayuhObject }) {
    if (!window.awtsmoosConductor?.handleNewComment) return;
    await window.awtsmoosConductor.handleNewComment({
        aliasId: currentAlias,
        verseSection: verseSection === "root" ? "root" : parseInt(verseSection),
        commentId: newId,
        newCommentData: { id: newId, author: currentAlias, content: bodyParams.content, dayuh: dayuhObject }
    });
}

function showSavedPrompt(currentAlias, newId) {
    AwtsmoosPrompt.go({
        headerTxt: "Chat Immortalized!",
        bodyTxt: "Your conversation has been saved as a comment on this verse.",
        options: [
            {
                text: "View Comment",
                action: async () => {
                    if (!window.openCommentsPanelToAlias) return;
                    await window.openCommentsPanelToAlias(currentAlias);
                    setTimeout(() => {
                        const el = document.querySelector(`.comment-content[data-cid="${newId}"]`);
                        if (el) {
                            el.scrollIntoView({ behavior: "smooth", block: "center" });
                            el.classList.add("highlight-flash");
                        }
                    }, 500);
                }
            },
            { text: "Continue Chatting" }
        ]
    });
}

/**
 * Persists the chat as a comment, updating or creating as needed.
 * @param {Array<object>} chatHistory Chat turns.
 * @param {string} verseSection Target verse or root.
 * @param {HTMLButtonElement} btn Save button.
 * @returns {Promise<void>}
 */
export async function saveChat(chatHistory, verseSection, btn) {
    const currentAlias = window.curAlias;
    if (!currentAlias) {
        resetSaveButton(btn);
        return alert("Log in to save!");
    }

    const dayuhObject = { conversation: chatHistory, verseSection: verseSection === "root" ? "root" : parseInt(verseSection) };
    const bodyParams = {
        aliasId: currentAlias,
        seriesId: window?.post?.parentSeriesId,
        dayuh: JSON.stringify(dayuhObject),
        content: aiChatState.chatTitle || "AI Conversation"
    };
    if (aiChatState.activeCommentId) bodyParams.commentId = aiChatState.activeCommentId;

    try {
        const heichelId = window.post?.heichel?.id;
        const postId = window.post?.id;
        const response = await fetch(`/api/social/heichelos/${heichelId}/post/${postId}/comments/`, {
            method: aiChatState.activeCommentId ? "PUT" : "POST",
            body: new URLSearchParams(bodyParams)
        });
        const json = await response.json();
        resetSaveButton(btn, "SAVED");
        setTimeout(() => btn.innerText = "💾 SAVE", 2000);
        if (!json.success) return alert("Error: " + json.error);
        const newId = json.details?.id || aiChatState.activeCommentId;
        setActiveCommentId(newId);
        await notifyNewSavedComment({ currentAlias, verseSection, newId, bodyParams, dayuhObject });
        showSavedPrompt(currentAlias, newId);
    } catch (error) {
        console.error(error);
        resetSaveButton(btn);
        alert("Network Error");
    }
}
