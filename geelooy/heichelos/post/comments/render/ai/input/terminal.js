// B"H
/** @module AiInlineTerminal */
import { createMessageNode } from "../components.js";
import { parseGeminiError } from "./errors.js";
import { toggleBranchInput } from "./branch.js";

function buildPrompt(history) {
    const contextPrompt = history.map(m => {
        const speaker = m.role === "model" ? "AI" : (m.name ? `@${m.name}` : "User");
        return `${speaker}: ${m.text}`;
    }).join("\n");
    return `B"H\nContext:\n${contextPrompt}\n\n(Respond to the last message)`;
}

async function callAi(history) {
    const response = await window.awtsmoosAi({ prompt: buildPrompt(history) });
    if (!response) throw new Error("Empty response from AI");
    return response;
}

function makeLoadingBlock() {
    const block = document.createElement("div");
    block.className = "ai-thread-block model loading";
    block.innerHTML = `<div class="ai-block-content" style="padding:10px;">Thinking...</div>`;
    return block;
}

function showTerminalError(error, loadingBlock) {
    const errMsg = parseGeminiError(error);
    loadingBlock.innerHTML = `<div class="ai-block-content error" style="padding:10px; color:red; border-left:4px solid red;"><b>Error:</b> ${errMsg}<br><button onclick="this.closest('.ai-thread-block').remove()" style="margin-top:5px; cursor:pointer;">Dismiss</button></div>`;
    loadingBlock.classList.remove("loading");
}

async function saveTerminalHistory(commentId, fullCommentData) {
    const heichelId = window.post?.heichel?.id;
    const postId = window.post?.id;
    await fetch(`/api/social/heichelos/${heichelId}/post/${postId}/comments/`, {
        method: "PUT",
        body: new URLSearchParams({
            commentId,
            aliasId: fullCommentData.author,
            seriesId: window?.post?.parentSeriesId,
            verseSection: fullCommentData.dayuh.verseSection || "root",
            dayuh: JSON.stringify(fullCommentData.dayuh)
        })
    });
}

function appendAiBlock(container, term, aiMsg, history, fullCommentData, commentId) {
    const aiBlock = createMessageNode(aiMsg, history.length - 1, {
        isOwner: true,
        canInteract: true,
        onFork: slot => toggleBranchInput(slot, {
            index: history.length - 1,
            historySnapshot: history,
            originalAuthor: fullCommentData.author,
            parentData: fullCommentData,
            parentId: commentId
        }, {
            renderNewThread: (s, d, i) => import("../structure.js").then(m => m.renderNestedThread(s, d, i, true))
        })
    });
    container.insertBefore(aiBlock, term);
}

function wireTextarea(input, sendBtn) {
    input.addEventListener("input", function() {
        this.style.height = "auto";
        this.style.height = `${this.scrollHeight}px`;
    });
    input.addEventListener("keydown", event => {
        if (event.key === "Enter" && !event.shiftKey) {
            event.preventDefault();
            sendBtn.click();
        }
    });
}

async function submitTerminal({ container, term, input, sendBtn, history, commentId, fullCommentData }) {
    const text = input.value.trim();
    if (!text) return;
    input.disabled = true;
    sendBtn.disabled = true;
    const userMsg = { role: "user", text, name: window.curAlias || "User" };
    const userBlock = createMessageNode(userMsg, history.length, { isOwner: true, canInteract: true });
    const loadingBlock = makeLoadingBlock();
    container.insertBefore(userBlock, term);
    container.insertBefore(loadingBlock, term);

    try {
        const aiResponse = await callAi(history);
        history.push(userMsg);
        const aiMsg = { role: "model", text: aiResponse };
        history.push(aiMsg);
        loadingBlock.remove();
        userBlock.dataset.msgIndex = history.length - 2;
        appendAiBlock(container, term, aiMsg, history, fullCommentData, commentId);
        input.value = "";
        input.style.height = "auto";
        fullCommentData.dayuh.conversation = history;
        await saveTerminalHistory(commentId, fullCommentData);
    } catch (error) {
        console.error("Terminal Error:", error);
        showTerminalError(error, loadingBlock);
        userBlock.remove();
    } finally {
        input.disabled = false;
        sendBtn.disabled = false;
        input.focus();
    }
}

export function renderInlineTerminal(container, history, commentId, fullCommentData) {
    const term = document.createElement("div");
    term.className = "ai-inline-terminal awtsmoos-card";
    const input = document.createElement("textarea");
    input.placeholder = "Continue conversation...";
    input.rows = 1;
    const sendBtn = document.createElement("button");
    sendBtn.className = "ai-send-icon-btn btn awtsmoos-hero-btn";
    sendBtn.innerText = "➤";
    wireTextarea(input, sendBtn);
    sendBtn.onclick = () => submitTerminal({ container, term, input, sendBtn, history, commentId, fullCommentData });
    term.append(input, sendBtn);
    container.appendChild(term);
}
