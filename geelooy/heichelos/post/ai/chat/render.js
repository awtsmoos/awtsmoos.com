// B"H
/** @module AiChatRender */
import { markdownToHtml } from "/heichelos/post/parsing.js";
import { stripTags } from "/heichelos/post/functions/utils.js";
import { aiChatState, setCurrentTab } from "./state.js";
import { getContextContent, constructPrompt, extractTextFromChunk } from "./context.js";
import { appendMessage } from "./messages.js";
import { saveChat } from "./save.js";

function buildHeader() {
    const header = document.createElement("div");
    header.className = "ai-chat-header";
    const leftHead = document.createElement("div");
    leftHead.style.display = "flex";
    leftHead.style.alignItems = "center";
    leftHead.style.gap = "10px";
    const title = document.createElement("h3");
    title.innerText = "Awtsmoos Insight";
    const contextBadge = document.createElement("span");
    contextBadge.className = "ai-context-badge";
    contextBadge.innerText = "Global Context";
    const saveBtn = document.createElement("button");
    saveBtn.className = "ai-save-action-btn";
    saveBtn.innerHTML = "💾 SAVE";
    saveBtn.title = "Save this conversation to comments";
    leftHead.append(title, contextBadge);
    header.append(leftHead, saveBtn);
    return { header, contextBadge, saveBtn };
}

function refreshContextBadge(contextBadge) {
    const idx = new URLSearchParams(location.search).get("idx");
    if (idx !== null) {
        contextBadge.classList.add("active");
        contextBadge.innerText = `Verse ${parseInt(idx) + 1}`;
        const cleanText = stripTags(getContextContent(idx)).replace(/\s+/g, " ").trim().substring(0, 50);
        contextBadge.title = `${cleanText}...`;
    } else {
        contextBadge.classList.remove("active");
        contextBadge.innerText = "Full Post";
    }
}

function wireInput(textarea, sendBtn) {
    const resize = () => {
        textarea.style.height = "auto";
        textarea.style.height = `${textarea.scrollHeight}px`;
    };
    if (textarea.value) resize();
    textarea.addEventListener("input", resize);
    textarea.addEventListener("keydown", event => {
        if (event.key === "Enter" && !event.shiftKey) {
            event.preventDefault();
            sendBtn.click();
        }
    });
    return resize;
}

async function sendChatMessage({ textarea, resize, messagesDiv }) {
    const text = textarea.value.trim();
    if (!text) return;
    textarea.value = "";
    resize();
    appendMessage("user", text, messagesDiv);
    aiChatState.history.push({ role: "user", text });
    const idx = new URLSearchParams(location.search).get("idx");
    const aiMsgDiv = appendMessage("ai", "", messagesDiv, true);
    const contentDiv = aiMsgDiv.querySelector(".content");

    try {
        let streamedResponse = "";
        const prompt = constructPrompt(text, getContextContent(idx), aiChatState.history);
        const finalResponse = await window.awtsmoosAi({
            prompt,
            onstream: chunk => {
                const txt = extractTextFromChunk(chunk);
                if (!txt) return;
                streamedResponse += txt;
                contentDiv.innerHTML = markdownToHtml(streamedResponse);
                messagesDiv.scrollTop = messagesDiv.scrollHeight;
            }
        });
        const responseText = typeof finalResponse === "string" && finalResponse.length > 0 ? finalResponse : streamedResponse;
        contentDiv.innerHTML = markdownToHtml(responseText);
        messagesDiv.scrollTop = messagesDiv.scrollHeight;
        aiChatState.history.push({ role: "model", text: responseText });
        aiMsgDiv.classList.remove("loading");
        aiMsgDiv.querySelector(".typing-indicator")?.remove();
    } catch (error) {
        console.error(error);
        contentDiv.textContent = "Error: Could not reach Awtsmoos AI.";
        aiMsgDiv.classList.remove("loading");
    }
}

/**
 * Renders the AI chat interface into a tab.
 * @param {{tab: HTMLElement, options?: object}} args Render options.
 * @returns {void}
 */
export function renderAIChat({ tab, options = { prefill: "", autoSend: false } }) {
    setCurrentTab(tab);
    tab.awtsmoosType = "ai chat";
    tab.innerHTML = "";
    const container = document.createElement("div");
    container.className = "ai-chat-container";
    const { header, contextBadge, saveBtn } = buildHeader();
    saveBtn.onclick = async () => {
        if (!aiChatState.history.length) return alert("Nothing to save!");
        saveBtn.disabled = true;
        saveBtn.innerText = "...";
        await saveChat(aiChatState.history, new URLSearchParams(location.search).get("idx") ?? "root", saveBtn);
    };
    container.appendChild(header);
    window.refreshAIChatContext = () => refreshContextBadge(contextBadge);
    window.refreshAIChatContext();
    const messagesDiv = document.createElement("div");
    messagesDiv.className = "ai-messages";
    container.appendChild(messagesDiv);
    aiChatState.history.forEach(msg => appendMessage(msg.role, msg.text, messagesDiv));
    if (aiChatState.history.length === 0) appendMessage("ai", "B\"H! I am ready to help you explore this Torah content. What would you like to know?", messagesDiv);
    const inputArea = document.createElement("div");
    inputArea.className = "ai-input-area";
    const textarea = document.createElement("textarea");
    textarea.className = "ai-input-box";
    textarea.placeholder = "Ask a question...";
    textarea.rows = 1;
    textarea.value = options.prefill || "";
    const sendBtn = document.createElement("button");
    sendBtn.className = "ai-send-btn";
    sendBtn.innerHTML = "➤";
    const resize = wireInput(textarea, sendBtn);
    sendBtn.onclick = () => sendChatMessage({ textarea, resize, messagesDiv });
    inputArea.append(textarea, sendBtn);
    container.appendChild(inputArea);
    tab.appendChild(container);
    setTimeout(() => messagesDiv.scrollTop = messagesDiv.scrollHeight, 100);
    if (options.autoSend && textarea.value) setTimeout(() => sendBtn.click(), 100);
}
