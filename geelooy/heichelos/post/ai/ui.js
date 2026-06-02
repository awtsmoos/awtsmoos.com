// /BH/awtsmoos.com/geelooy/heichelos/post/ai/ui.js
//B"H
/**
 * AI Chat UI Manifestation.
 */
import { markdownToHtml } from "/heichelos/post/parsing.js";
import { stripTags } from "/heichelos/post/functions/utils.js";
import { handleSend, saveChat } from "./api.js";
import { getHistory, setHistory, getChatTitle, getActiveCommentId } from "./chat.js";

export function renderAIChat({ tab, options = { prefill: "", autoSend: false } }) {
    tab.awtsmoosType = "ai chat"; 
    tab.innerHTML = "";
    
    const container = document.createElement("div");
    container.className = "ai-chat-container";
    
    const header = document.createElement("div");
    header.className = "ai-chat-header";
    
    const leftHead = document.createElement("div");
    leftHead.style.cssText = "display: flex; align-items: center; gap: 10px;";

    const title = document.createElement("h3");
    title.innerText = "Awtsmoos Insight";
    
    const contextBadge = document.createElement("span");
    contextBadge.className = "ai-context-badge";
    
    leftHead.append(title, contextBadge);
    header.appendChild(leftHead);

    const saveBtn = document.createElement("button");
    saveBtn.className = "ai-save-action-btn";
    saveBtn.innerHTML = "💾 SAVE";
    saveBtn.onclick = async () => {
        if (!getHistory().length) return;
        saveBtn.disabled = true;
        saveBtn.innerText = "...";
        const idx = new URLSearchParams(location.search).get("idx") ?? "root";
        await saveChat(getHistory(), idx, getActiveCommentId(), getChatTitle(), saveBtn);
    };
    header.appendChild(saveBtn);
    container.appendChild(header);

    const messagesDiv = document.createElement("div");
    messagesDiv.className = "ai-messages";
    container.appendChild(messagesDiv);

    const updateContext = () => {
        const idx = new URLSearchParams(location.search).get("idx");
        if (idx !== null) {
            contextBadge.classList.add("active");
            contextBadge.innerText = `Verse ${parseInt(idx) + 1}`;
        } else {
            contextBadge.classList.remove("active");
            contextBadge.innerText = "Full Post";
        }
    }
    window.refreshAIChatContext = updateContext;
    updateContext();

    getHistory().forEach(msg => appendMessage(msg.role, msg.text, messagesDiv));
    if (getHistory().length === 0) {
        appendMessage("ai", "B\"H! I am ready to help you explore this Torah content.", messagesDiv);
    }

    const inputArea = document.createElement("div");
    inputArea.className = "ai-input-area";
    
    const textarea = document.createElement("textarea");
    textarea.className = "ai-input-box";
    textarea.placeholder = "Ask a question...";
    textarea.rows = 1;
    textarea.value = options.prefill || "";
    
    const resizeTx = () => {
        textarea.style.height = 'auto';
        textarea.style.height = `${textarea.scrollHeight}px`;
    };
    if (textarea.value) resizeTx();
    textarea.addEventListener('input', resizeTx);

    const sendBtn = document.createElement("button");
    sendBtn.className = "ai-send-btn";
    sendBtn.innerHTML = "➤";
    
    const onSend = async () => {
        const text = textarea.value.trim();
        if (!text) return;
        textarea.value = "";
        resizeTx();

        const currentHistory = getHistory();
        currentHistory.push({ role: "user", text });
        setHistory(currentHistory);
        
        appendMessage("user", text, messagesDiv);
        const aiMsgDiv = appendMessage("ai", "", messagesDiv, true);
        
        await handleSend(text, aiMsgDiv, messagesDiv);
    };

    sendBtn.onclick = onSend;
    textarea.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            onSend();
        }
    });

    inputArea.append(textarea, sendBtn);
    container.appendChild(inputArea);
    
    tab.appendChild(container);
    setTimeout(() => messagesDiv.scrollTop = messagesDiv.scrollHeight, 100);

    if (options.autoSend && textarea.value) {
        setTimeout(onSend, 100);
    }
}

export function appendMessage(role, text, container, isLoading = false) {
    const msgDiv = document.createElement("div");
    msgDiv.className = `ai-message ${role}`;
    
    const icon = document.createElement("div");
    icon.className = "ai-msg-icon";
    icon.innerHTML = role === "user" ? "👤" : "✨";
    
    const bubble = document.createElement("div");
    bubble.className = "ai-msg-bubble";

    const content = document.createElement("div");
    content.className = "content";
    content.innerHTML = role === "user" ? text.replace(/\n/g, "<br>") : markdownToHtml(text);
    bubble.appendChild(content);

    if (isLoading) {
        const indicator = document.createElement("div");
        indicator.className = "typing-indicator awtsmoos-empty-placeholder";
        indicator.innerHTML = "<span></span><span></span><span></span>";
        bubble.appendChild(indicator);
    }

    msgDiv.append(icon, bubble);
    container.appendChild(msgDiv);
    container.scrollTop = container.scrollHeight;
    return msgDiv;
}
