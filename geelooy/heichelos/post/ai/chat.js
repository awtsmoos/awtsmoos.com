//B"H
import { injectAIChatCSS } from "../styles/aiChatStyles.js";
import { markdownToHtml } from "../parsing.js";
import { stripTags } from "../functions/utils.js";
import { AwtsmoosPrompt } from "/scripts/awtsmoos/api/utils.js";
import { addTab } from "/heichelos/post/postFunctions.js";

var history = [];
var activeCommentId = null; 
var chatTitle = "Chat with Awtsmoos AI";
var currentTab = null;

/**
 * @method renderAIChat
 * @description B"H - Renders the AI Chat with dynamic context refreshing.
 */
export function renderAIChat({ tab }) {
    injectAIChatCSS();
    currentTab = tab;
    tab.awtsmoosType = "ai chat"; // B"H - Allow indexSwitch to identify us
    tab.innerHTML = "";
    
    const container = document.createElement("div");
    container.className = "ai-chat-container";
    
    const controls = document.createElement("div");
    controls.className = "ai-controls";
    
    const leftControls = document.createElement("div");
    leftControls.className = "ai-controls-left";

    const titleInput = document.createElement("input");
    titleInput.type = "text";
    titleInput.className = "ai-title-input";
    titleInput.value = chatTitle;
    titleInput.placeholder = "Chat Title...";
    titleInput.oninput = (e) => { chatTitle = e.target.value; };

    const contextCheckbox = document.createElement("input");
    contextCheckbox.type = "checkbox";
    contextCheckbox.checked = true; 
    contextCheckbox.id = "ai-context-toggle";
    
    const contextLabel = document.createElement("label");
    contextLabel.htmlFor = "ai-context-toggle";
    contextLabel.className = "ai-context-label";
    
    /**
     * @method updateLabels
     * @description Updates context labels without clearing the chat history.
     */
    function updateLabels() {
        const s = new URLSearchParams(location.search);
        const idx = s.get("idx");
        const hasSpecificContext = idx !== null;
        
        if (!hasSpecificContext) {
            contextLabel.textContent = "Analyzing: Full Post";
            contextCheckbox.style.display = "none";
        } else {
            contextCheckbox.style.display = "inline-block";
            if (contextCheckbox.checked) {
                const rawText = getContextContent(idx);
                const cleanText = stripTags(rawText).replace(/\s+/g, " ").trim();
                const preview = cleanText.length > 20 ? cleanText.substring(0, 20) + "..." : cleanText;
                contextLabel.textContent = `Sec ${parseInt(idx) + 1}: "${preview}"`;
                contextLabel.title = cleanText; 
            } else {
                contextLabel.textContent = "Full Post";
                contextLabel.title = "";
            }
        }
    }
    
    // Register global refresher for indexSwitch
    window.refreshAIChatContext = updateLabels;
    updateLabels();
    contextCheckbox.onchange = updateLabels;
    
    leftControls.appendChild(titleInput);
    leftControls.appendChild(contextCheckbox);
    leftControls.appendChild(contextLabel);
    controls.appendChild(leftControls);

    const saveBtn = document.createElement("button");
    saveBtn.className = "ai-save-btn";
    saveBtn.innerText = activeCommentId ? "Update Saved Chat" : "Save to Comments";
    
    saveBtn.onclick = async () => {
        saveBtn.disabled = true;
        saveBtn.innerText = "Saving...";
        const s = new URLSearchParams(location.search);
        const idx = s.get("idx");
        await saveChat(history, idx !== null ? idx : "root");
        saveBtn.innerText = activeCommentId ? "Update Saved Chat" : "Save to Comments";
        saveBtn.disabled = false;
    };
    controls.appendChild(saveBtn);

    container.appendChild(controls);

    const messagesDiv = document.createElement("div");
    messagesDiv.className = "ai-messages";
    container.appendChild(messagesDiv);

    history.forEach(msg => appendMessage(msg.role, msg.text, messagesDiv));

    if (history.length === 0) {
        appendMessage("ai", "B\"H! I am ready to help you explore this Torah content. What would you like to know?", messagesDiv);
    }

    const inputArea = document.createElement("div");
    inputArea.className = "ai-input-area";
    
    const textarea = document.createElement("textarea");
    textarea.className = "ai-input-box";
    textarea.placeholder = "Ask a question...";
    textarea.rows = 1;
    
    textarea.addEventListener('input', function() {
        this.style.height = 'auto';
        this.style.height = (this.scrollHeight) + 'px';
    });

    textarea.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendBtn.click();
        }
    });

    const sendBtn = document.createElement("button");
    sendBtn.className = "ai-send-btn";
    sendBtn.innerHTML = "➤";
    
    sendBtn.onclick = async () => {
        const text = textarea.value.trim();
        if (!text) return;
        
        textarea.value = "";
        textarea.style.height = 'auto';
        
        appendMessage("user", text, messagesDiv);
        history.push({ role: "user", text });
        
        const s = new URLSearchParams(location.search);
        const idx = s.get("idx");
        const useSection = (idx !== null) && contextCheckbox.checked;
        const contextText = getContextContent(useSection ? idx : null);
        
        const aiMsgDiv = appendMessage("ai", "", messagesDiv, true);
        const contentDiv = aiMsgDiv.querySelector(".content");
        
        try {
            const prompt = constructPrompt(text, contextText, history);
            let streamedResponse = "";
            
            const finalResponse = await window.awtsmoosAi({
                prompt: prompt,
                onstream: (chunk) => {
                    const txt = extractTextFromChunk(chunk);
                    if (txt) {
                        streamedResponse += txt;
                        contentDiv.innerHTML = markdownToHtml(streamedResponse);
                        messagesDiv.scrollTop = messagesDiv.scrollHeight;
                    }
                }
            });
            
            const responseText = (typeof finalResponse === 'string' && finalResponse.length > 0) 
                ? finalResponse 
                : streamedResponse;
                
            contentDiv.innerHTML = markdownToHtml(responseText);
            messagesDiv.scrollTop = messagesDiv.scrollHeight;
            
            history.push({ role: "model", text: responseText });
            aiMsgDiv.classList.remove("loading");
            const typingInd = aiMsgDiv.querySelector(".typing-indicator");
            if(typingInd) typingInd.remove();
            
        } catch (e) {
            console.error(e);
            contentDiv.textContent = "Error: Could not reach Awtsmoos AI.";
            aiMsgDiv.classList.remove("loading");
        }
    };

    inputArea.appendChild(textarea);
    inputArea.appendChild(sendBtn);
    container.appendChild(inputArea);
    
    tab.appendChild(container);
    setTimeout(() => messagesDiv.scrollTop = messagesDiv.scrollHeight, 100);
}

export function loadChat(conversation, commentId, title) {
    history = conversation || [];
    activeCommentId = commentId; 
    chatTitle = title || "Chat with Awtsmoos AI";
    openAIChat();
}

export function openAIChat() {
    if(window.openPanel) window.openPanel();
    window.tabManager.addTab({
        header: "Awtsmoos AI",
        async onopen({ actualTab }) {
            renderAIChat({ tab: actualTab });
        }
    }).open();
}

function appendMessage(role, text, container, isLoading = false) {
    const msgDiv = document.createElement("div");
    msgDiv.className = `ai-message ${role}`;
    
    const content = document.createElement("div");
    content.className = "content";
    content.innerHTML = role === "user" ? text.replace(/\n/g, "<br>") : markdownToHtml(text);
    msgDiv.appendChild(content);

    if (isLoading) {
        const indicator = document.createElement("div");
        indicator.className = "typing-indicator";
        indicator.innerHTML = "<span></span><span></span><span></span>";
        msgDiv.appendChild(indicator);
    }

    container.appendChild(msgDiv);
    container.scrollTop = container.scrollHeight;
    return msgDiv;
}

function getContextContent(idx) {
    if (idx !== null && window.sectionDayuh && window.sectionDayuh[idx]) {
        let sec = window.sectionDayuh[idx];
        return Array.isArray(sec) ? sec.flat(Infinity).join("\n") : sec;
    }
    if (window.sectionDayuh) {
        return window.sectionDayuh.flat(Infinity).join("\n\n");
    }
    return document.getElementById("realPost")?.innerText || "";
}

function constructPrompt(currentMsg, context, hist) {
    let cleanContext = stripTags(context);
    let prompt = `B"H\nYou are a helpful, knowledgeable Torah assistant analyzing the following text:\n\n---\n${cleanContext}\n---\n\n`;
    if (hist.length > 1) { 
        prompt += "Conversation History:\n";
        hist.slice(0, -1).forEach(h => {
            prompt += `${h.role === 'user' ? 'User' : 'AI'}: ${h.text}\n`;
        });
        prompt += "\n";
    }
    prompt += `User: ${currentMsg}\nAI:`;
    return prompt;
}

function extractTextFromChunk(chunk) {
    const data = Array.isArray(chunk) ? chunk[0] : chunk;
    return data?.candidates?.[0]?.content?.parts?.[0]?.text || "";
}

async function saveChat(chatHistory, verseSection) {
    if (!chatHistory || chatHistory.length === 0) {
        return AwtsmoosPrompt.go({ isAlert: true, headerTxt: "Chat is empty!" });
    }
    if (!window.curAlias) {
        return AwtsmoosPrompt.go({ isAlert: true, headerTxt: "You must be logged in with an alias to save comments." });
    }
    try {
        const heichelId = window.post?.heichel?.id;
        const postId = window.post?.id;
        const dayuhObject = {
            conversation: chatHistory,
            verseSection: verseSection === "root" ? "root" : parseInt(verseSection)
        };
        const content = chatTitle || "Chat with Awtsmoos AI";
        const method = activeCommentId ? "PUT" : "POST";
        const bodyParams = {
            aliasId: window.curAlias,
            seriesId: window?.post?.parentSeriesId,
            dayuh: JSON.stringify(dayuhObject),
            content: content
        };
        if (activeCommentId) {
            bodyParams.commentId = activeCommentId;
            bodyParams.verseSection = verseSection === "root" ? "root" : parseInt(verseSection);
        }
        const response = await fetch(location.origin + `/api/social/heichelos/${heichelId}/post/${postId}/comments/`, {
            method: method,
            body: new URLSearchParams(bodyParams),
        });
        const json = await response.json();
        if (json.success) {
            const newCommentId = json.details?.id || activeCommentId;
            activeCommentId = newCommentId; 
            const newCommentData = { id: newCommentId, author: window.curAlias, content: content, dayuh: dayuhObject };
            await window.commentLogic.handleNewComment({
                aliasId: window.curAlias,
                verseSection: verseSection,
                commentId: newCommentId,
                newCommentData: newCommentData
            });
            AwtsmoosPrompt.go({ isAlert: true, headerTxt: "Chat saved successfully!" });
        } else {
            AwtsmoosPrompt.go({ isAlert: true, headerTxt: "Failed to save: " + (json.error || "Unknown error") });
        }
    } catch (e) {
        console.error("Save chat error:", e);
        AwtsmoosPrompt.go({ isAlert: true, headerTxt: "Network error saving chat." });
    }
}
