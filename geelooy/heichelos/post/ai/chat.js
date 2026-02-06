//B"H
/**
 * AI Chat Logic.
 * Purged of obsolete JS-based CSS injectors.
 */
import { markdownToHtml } from "/heichelos/post/parsing.js";
import { stripTags } from "/heichelos/post/functions/utils.js";
import { AwtsmoosPrompt } from "/scripts/awtsmoos/api/utils.js";

var history = [];
var activeCommentId = null; 
var chatTitle = "Chat with Awtsmoos AI";
var currentTab = null;

/**
 * @method renderAIChat
 * @description B"H - Renders the AI Chat with dynamic context refreshing.
 */
export function renderAIChat({ tab, options = { prefill: "", autoSend: false } }) {
    currentTab = tab;
    tab.awtsmoosType = "ai chat"; 
    tab.innerHTML = "";
    
    const container = document.createElement("div");
    container.className = "ai-chat-container";
    
    // --- Header & Controls ---
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
    
    leftHead.appendChild(title);
    leftHead.appendChild(contextBadge);
    header.appendChild(leftHead);

    // Save Button
    const saveBtn = document.createElement("button");
    saveBtn.className = "ai-save-action-btn";
    saveBtn.innerHTML = "💾 SAVE";
    saveBtn.title = "Save this conversation to comments";
    saveBtn.onclick = async () => {
        if (!history.length) return alert("Nothing to save!");
        saveBtn.disabled = true;
        saveBtn.innerText = "...";
        const s = new URLSearchParams(location.search);
        const idx = s.get("idx") ?? "root";
        await saveChat(history, idx, saveBtn);
    };
    header.appendChild(saveBtn);

    container.appendChild(header);

    // --- Dynamic Context Logic ---
    function updateContext() {
        const s = new URLSearchParams(location.search);
        const idx = s.get("idx");
        
        if (idx !== null) {
            contextBadge.classList.add("active");
            contextBadge.innerText = `Verse ${parseInt(idx) + 1}`;
            const rawText = getContextContent(idx);
            const cleanText = stripTags(rawText).replace(/\s+/g, " ").trim().substring(0, 50);
            contextBadge.title = cleanText + "...";
        } else {
            contextBadge.classList.remove("active");
            contextBadge.innerText = "Full Post";
        }
    }
    
    window.refreshAIChatContext = updateContext;
    updateContext();

    // --- Messages Area ---
    const messagesDiv = document.createElement("div");
    messagesDiv.className = "ai-messages";
    container.appendChild(messagesDiv);

    history.forEach(msg => appendMessage(msg.role, msg.text, messagesDiv));

    if (history.length === 0) {
        appendMessage("ai", "B\"H! I am ready to help you explore this Torah content. What would you like to know?", messagesDiv);
    }

    // --- Input Area ---
    const inputArea = document.createElement("div");
    inputArea.className = "ai-input-area";
    
    const textarea = document.createElement("textarea");
    textarea.className = "ai-input-box";
    textarea.placeholder = "Ask a question...";
    textarea.rows = 1;
    textarea.value = options.prefill || "";
    
    const resizeTx = () => {
        textarea.style.height = 'auto';
        textarea.style.height = (textarea.scrollHeight) + 'px';
    };
    if (textarea.value) resizeTx();
    textarea.addEventListener('input', resizeTx);

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
        resizeTx();
        
        appendMessage("user", text, messagesDiv);
        history.push({ role: "user", text });
        
        const s = new URLSearchParams(location.search);
        const idx = s.get("idx");
        const contextText = getContextContent(idx); 
        
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

    if (options.autoSend && textarea.value) {
        setTimeout(() => sendBtn.click(), 100);
    }
}

export function loadChat(conversation, commentId, title) {
    history = conversation || [];
    activeCommentId = commentId; 
    chatTitle = title || "Chat with Awtsmoos AI";
    openAIChat();
}

export function openAIChat(options = { prefill: "", autoSend: false }) {
    if(window.openPanel) window.openPanel();

    const chatOptions = typeof options === 'string' ? { prefill: options, autoSend: false } : options;

    window.tabManager.addTab({
        header: "Awtsmoos AI",
        content: "",
        async onopen({ actualTab }) {
            renderAIChat({ tab: actualTab, options: chatOptions });
        }
    }).open();
}

function appendMessage(role, text, container, isLoading = false) {
    const msgDiv = document.createElement("div");
    msgDiv.className = `ai-message ${role}`;
    
    const icon = document.createElement("div");
    icon.className = "ai-msg-icon";
    icon.innerHTML = role === "user" ? "👤" : "✨";
    msgDiv.appendChild(icon);

    const bubble = document.createElement("div");
    bubble.className = "ai-msg-bubble";

    const content = document.createElement("div");
    content.className = "content";
    content.innerHTML = role === "user" ? text.replace(/\n/g, "<br>") : markdownToHtml(text);
    bubble.appendChild(content);

    if (isLoading) {
        const indicator = document.createElement("div");
        indicator.className = "typing-indicator";
        indicator.innerHTML = "<span></span><span></span><span></span>";
        bubble.appendChild(indicator);
    }

    msgDiv.appendChild(bubble);
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
    // 1. If it's already an object, safely extract content
    if (typeof chunk === 'object' && chunk !== null) {
        return chunk?.candidates?.[0]?.content?.parts?.[0]?.text || "";
    }
    
    // 2. Filter out explicit metadata/debug tags that might leak
    if (typeof chunk === 'string') {
        if(chunk.includes("[AIS_METADATA")) return "";
    } else {
        return "";
    }

    // 3. Try parsing the entire chunk as JSON
    try {
        const d = JSON.parse(chunk);
        // Handle array of candidates or single response
        if(Array.isArray(d)) {
             return d[0]?.candidates?.[0]?.content?.parts?.[0]?.text || "";
        }
        return d?.candidates?.[0]?.content?.parts?.[0]?.text || "";
    } catch(e) {}

    // 4. Try parsing line-by-line (NDJSON or streaming list)
    const lines = chunk.split('\n');
    let extractedText = "";
    let parsedAny = false;

    for(const line of lines) {
        const clean = line.trim().replace(/^,+|^\[|\]$/g, ''); // Remove leading comma/brackets
        if(!clean) continue;
        try {
            const d = JSON.parse(clean);
            const txt = d?.candidates?.[0]?.content?.parts?.[0]?.text;
            if(txt) {
                extractedText += txt;
                parsedAny = true;
            }
        } catch(e) {}
    }

    if(parsedAny) return extractedText;

    // 5. Fallback for raw text ONLY if it doesn't look like partial JSON
    const trimmed = chunk.trim();
    if (trimmed.startsWith('{') || trimmed.startsWith('[') || trimmed.includes('"candidates":')) {
        return ""; // Suppress partial JSON to avoid artifacts
    }

    return chunk; 
}

async function saveChat(chatHistory, verseSection, btn) {
    const currentAlias = window.curAlias;
    if (!currentAlias) {
        btn.disabled = false;
        btn.innerText = "💾 SAVE";
        return alert("Log in to save!");
    }
    const heichelId = window.post?.heichel?.id;
    const postId = window.post?.id;
    
    const dayuhObject = {
        conversation: chatHistory,
        verseSection: verseSection === "root" ? "root" : parseInt(verseSection)
    };
    
    const method = activeCommentId ? "PUT" : "POST";
    const bodyParams = {
        aliasId: currentAlias,
        seriesId: window?.post?.parentSeriesId,
        dayuh: JSON.stringify(dayuhObject),
        content: chatTitle || "AI Conversation"
    };
    
    if (activeCommentId) {
        bodyParams.commentId = activeCommentId;
    }

    try {
        const response = await fetch(`/api/social/heichelos/${heichelId}/post/${postId}/comments/`, {
            method: method,
            body: new URLSearchParams(bodyParams),
        });
        const json = await response.json();
        
        btn.disabled = false;
        btn.innerText = "SAVED";
        setTimeout(() => btn.innerText = "💾 SAVE", 2000);

        if (json.success) {
            const newId = json.details?.id || activeCommentId;
            activeCommentId = newId;
            
            // Notify system of new comment
            if(window.awtsmoosConductor?.handleNewComment) {
                await window.awtsmoosConductor.handleNewComment({
                    aliasId: currentAlias,
                    verseSection: verseSection === "root" ? "root" : parseInt(verseSection),
                    commentId: newId,
                    newCommentData: { id: newId, author: currentAlias, content: bodyParams.content, dayuh: dayuhObject }
                });
            }

            AwtsmoosPrompt.go({
                headerTxt: "Chat Immortalized!",
                bodyTxt: "Your conversation has been saved as a comment on this verse.",
                options: [
                    {
                        text: "View Comment",
                        action: async () => {
                            if(window.openCommentsPanelToAlias) {
                                await window.openCommentsPanelToAlias(currentAlias);
                                setTimeout(() => {
                                    const el = document.querySelector(`.comment-content[data-cid="${newId}"]`);
                                    if(el) {
                                        el.scrollIntoView({behavior:"smooth", block:"center"});
                                        el.classList.add("highlight-flash");
                                    }
                                }, 500);
                            }
                        }
                    },
                    { text: "Continue Chatting" }
                ]
            });
        } else {
            alert("Error: " + json.error);
        }
    } catch (e) {
        console.error(e);
        btn.disabled = false;
        btn.innerText = "💾 SAVE";
        alert("Network Error");
    }
}
