// B"H
/** @module AiBranchInput */
import { createMessageNode } from "../components.js";
import { parseGeminiError } from "./errors.js";

function buildHistory(context, text) {
    const history = context.historySnapshot.slice(0, context.index + 1);
    history.push({ role: "user", text, name: window.curAlias || "Guest" });
    return history;
}

function buildOptimisticComment(context, text, history, tempId) {
    const verseSection = context.parentData.dayuh.verseSection ?? "root";
    const subSection = context.parentData.dayuh.subSection;
    return {
        id: tempId,
        author: window.curAlias,
        content: `Branch: "${text.substring(0, 20)}..."`,
        dayuh: {
            conversation: history,
            verseSection,
            subSection,
            forkedFrom: { author: context.originalAuthor, msgIndex: context.index, commentId: context.parentId }
        }
    };
}

function showLoading(timeline) {
    if (!timeline) return null;
    const block = document.createElement("div");
    block.className = "ai-thread-block model loading";
    block.innerHTML = `<div class="ai-block-content" style="padding:10px;">Thinking...</div>`;
    timeline.appendChild(block);
    return block;
}

function showBranchError(error, loadingBlock) {
    const errMsg = parseGeminiError(error);
    if (!loadingBlock) return alert(errMsg);
    loadingBlock.classList.remove("loading");
    loadingBlock.innerHTML = `<div class="ai-block-content error" style="padding:10px; color:red;"><b>Error:</b> ${errMsg}<br><button onclick="this.closest('.ai-thread-block').remove()" style="margin-top:5px; cursor:pointer;">Dismiss</button></div>`;
}

async function askAwtsmoosAi(history) {
    const contextPrompt = history.map(m => {
        const speaker = m.role === "model" ? "AI" : (m.name ? `@${m.name}` : "User");
        return `${speaker}: ${m.text}`;
    }).join("\n");
    const prompt = `B"H\nContext of conversation:\n${contextPrompt}\n\n(Respond to the last message as the AI)`;
    const response = await window.awtsmoosAi({ prompt });
    if (!response) throw new Error("AI returned empty response.");
    return response;
}

async function saveBranch(context, text, history) {
    const verseSection = context.parentData.dayuh.verseSection ?? "root";
    const subSection = context.parentData.dayuh.subSection;
    const payload = {
        aliasId: window.curAlias,
        content: `Branch: "${text.substring(0, 20)}..."`,
        seriesId: window?.post?.parentSeriesId,
        dayuh: JSON.stringify({
            conversation: history,
            verseSection,
            subSection,
            forkedFrom: { author: context.originalAuthor, msgIndex: context.index, commentId: context.parentId }
        })
    };
    const heichelId = window.post?.heichel?.id;
    const postId = window.post?.id;
    const res = await fetch(`/api/social/heichelos/${heichelId}/post/${postId}/comments/`, { method: "POST", body: new URLSearchParams(payload) });
    const json = await res.json();
    if (!json.success) throw new Error("Server Error: " + json.error);
    return { id: json.details?.id, payload };
}

async function finalizeBranch({ timeline, loadingBlock, newThreadWrapper, context, callbacks, optimistic, history, saveResult }) {
    const realId = saveResult.id;
    if (timeline) {
        loadingBlock?.remove();
        const aiBlock = createMessageNode({ role: "model", text: history.at(-1).text }, history.length - 1, {
            isOwner: true,
            canInteract: true,
            onFork: forkSlot => toggleBranchInput(forkSlot, {
                index: history.length - 1,
                historySnapshot: history,
                originalAuthor: window.curAlias,
                parentData: { ...optimistic, id: realId, dayuh: { ...optimistic.dayuh, conversation: history } },
                parentId: realId
            }, callbacks)
        });
        timeline.appendChild(aiBlock);
    }
    if (newThreadWrapper) newThreadWrapper.dataset.nestedId = realId;
    if (window.commentLogic?.handleNewComment) {
        await window.commentLogic.handleNewComment({
            aliasId: window.curAlias,
            verseSection: optimistic.dayuh.verseSection,
            commentId: realId,
            newCommentData: { id: realId, author: window.curAlias, content: saveResult.payload.content, dayuh: JSON.parse(saveResult.payload.dayuh) }
        });
    }
}

export function toggleBranchInput(container, context, callbacks) {
    const existingInput = container.querySelector(":scope > .ai-branch-input-area");
    if (existingInput) return existingInput.remove();

    const branchArea = document.createElement("div");
    branchArea.className = "ai-branch-input-area";
    const input = document.createElement("textarea");
    input.placeholder = `Reply / Branch from @${context.originalAuthor || "User"} (Msg #${context.index + 1})...`;
    const actionsRow = document.createElement("div");
    actionsRow.className = "ai-input-actions";
    const cancelBtn = document.createElement("button");
    cancelBtn.innerText = "CANCEL";
    cancelBtn.className = "ai-btn ai-btn-secondary";
    cancelBtn.onclick = () => branchArea.remove();
    const goBtn = document.createElement("button");
    goBtn.innerText = "SEND REPLY";
    goBtn.className = "ai-btn ai-btn-primary";
    actionsRow.append(cancelBtn, goBtn);
    goBtn.onclick = () => submitBranch(container, branchArea, input, context, callbacks);
    branchArea.append(input, actionsRow);
    container.insertBefore(branchArea, container.firstChild);
    input.focus();
}

async function submitBranch(container, branchArea, input, context, callbacks) {
    const text = input.value.trim();
    if (!text) return;
    branchArea.remove();
    const history = buildHistory(context, text);
    const tempId = "temp-" + Date.now();
    const optimistic = buildOptimisticComment(context, text, history, tempId);
    callbacks?.renderNewThread?.(container, optimistic, tempId);
    const newThreadWrapper = container.querySelector(`.ai-nested-thread[data-nested-id="${tempId}"]`);
    const timeline = newThreadWrapper?.querySelector(".ai-thread-timeline");
    const loadingBlock = showLoading(timeline);
    try {
        history.push({ role: "model", text: await askAwtsmoosAi(history) });
        const saveResult = await saveBranch(context, text, history);
        await finalizeBranch({ timeline, loadingBlock, newThreadWrapper, context, callbacks, optimistic, history, saveResult });
    } catch (error) {
        console.error(error);
        showBranchError(error, loadingBlock);
    }
}
