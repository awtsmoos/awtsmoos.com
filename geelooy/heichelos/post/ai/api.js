// /BH/awtsmoos.com/geelooy/heichelos/post/ai/api.js
//B"H
/**
 * AI Chat API & Logic.
 */
import { AwtsmoosPrompt } from "/scripts/awtsmoos/api/utils.js";
import { stripTags } from "/heichelos/post/functions/utils.js";
import { markdownToHtml } from "/heichelos/post/parsing.js";
import { getHistory, setHistory, setActiveCommentId } from "./chat.js";
import { normalizeCommentCoordinate, coordinateToDayuh } from "/heichelos/post/comments/state/commentCoordinate.js";
import { emitAwtsmoosEvent } from "/heichelos/post/comments/state/eventBus.js";
import { normalizeCommentCoordinate, coordinateToDayuh } from "/heichelos/post/comments/state/commentCoordinate.js";
import { emitAwtsmoosEvent } from "/heichelos/post/comments/state/eventBus.js";

function getContextContent(idx) {
    if (idx !== null && window.sectionDayuh?.[idx]) {
        let sec = window.sectionDayuh[idx];
        return Array.isArray(sec) ? sec.flat(Infinity).join("\n") : sec;
    }
    return window.sectionDayuh?.flat(Infinity).join("\n\n") || document.getElementById("realPost")?.innerText || "";
}

function constructPrompt(currentMsg, context, hist) {
    let cleanContext = stripTags(context);
    let prompt = `B"H\nYou are a helpful, knowledgeable Torah assistant analyzing the following text:\n\n---\n${cleanContext}\n---\n\n`;
    if (hist.length > 1) { 
        prompt += "Conversation History:\n";
        hist.slice(0, -1).forEach(h => { prompt += `${h.role === 'user' ? 'User' : 'AI'}: ${h.text}\n`; });
        prompt += "\n";
    }
    prompt += `User: ${currentMsg}\nAI:`;
    return prompt;
}

function extractTextFromChunk(chunk) {
    if (typeof chunk === 'object' && chunk !== null) return chunk?.candidates?.[0]?.content?.parts?.[0]?.text || "";
    if (typeof chunk === 'string' && chunk.includes("[AIS_METADATA")) return "";
    try {
        const d = JSON.parse(chunk);
        if(Array.isArray(d)) return d[0]?.candidates?.[0]?.content?.parts?.[0]?.text || "";
        return d?.candidates?.[0]?.content?.parts?.[0]?.text || "";
    } catch(e) {}
    const trimmed = chunk.trim();
    if (trimmed.startsWith('{') || trimmed.startsWith('[') || trimmed.includes('"candidates":')) return "";
    return chunk; 
}

export async function handleSend(text, aiMsgDiv, messagesDiv) {
    const contentDiv = aiMsgDiv.querySelector(".content");
    try {
        const idx = new URLSearchParams(location.search).get("idx");
        const contextText = getContextContent(idx);
        const history = getHistory();
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
        
        const responseText = (typeof finalResponse === 'string' && finalResponse.length > 0) ? finalResponse : streamedResponse;
        contentDiv.innerHTML = markdownToHtml(responseText);
        messagesDiv.scrollTop = messagesDiv.scrollHeight;
        
        const newHistory = getHistory();
        newHistory.push({ role: "model", text: responseText });
        setHistory(newHistory);
        
    } catch (e) {
        console.error(e);
        contentDiv.textContent = "Error: Could not reach Awtsmoos AI.";
    } finally {
        aiMsgDiv.classList.remove("loading");
        const typingInd = aiMsgDiv.querySelector(".typing-indicator");
        if(typingInd) typingInd.remove();
    }
}

export async function saveChat(chatHistory, verseSection, activeCommentId, chatTitle, btn) {
    const currentAlias = window.curAlias;
    if (!currentAlias) {
        btn.disabled = false;
        btn.innerText = "💾 SAVE";
        return alert("Log in to save!");
    }
    
    const coordinate = normalizeCommentCoordinate({
        heichelId: window.post?.heichel?.id,
        seriesId: window.post?.parentSeriesId,
        postId: window.post?.id,
        parentType: "post",
        parentId: window.post?.id,
        verseSection
    });
    const dayuhObject = coordinateToDayuh(coordinate, {
        conversation: chatHistory
    });
    
    const method = activeCommentId ? "PUT" : "POST";
    const bodyParams = {
        aliasId: currentAlias, seriesId: window.post?.parentSeriesId,
        dayuh: JSON.stringify(dayuhObject), content: chatTitle || "AI Conversation"
    };
    if (activeCommentId) bodyParams.commentId = activeCommentId;

    try {
        const response = await fetch(`/api/social/heichelos/${window.post.heichel.id}/post/${window.post.id}/comments/`, {
            method: method, body: new URLSearchParams(bodyParams),
        });
        const json = await response.json();
        
        btn.disabled = false;
        btn.innerText = "SAVED";
        setTimeout(() => btn.innerText = "💾 SAVE", 2000);

        if (json.success) {
            const newId = json.details?.id || activeCommentId;
            setActiveCommentId(newId);
            
            const payload = {
                aliasId: currentAlias,
                verseSection: dayuhObject.verseSection,
                commentId: newId,
                newCommentData: { id: newId, author: currentAlias, content: bodyParams.content, dayuh: dayuhObject },
                coordinate
            };

            emitAwtsmoosEvent("ai-comment:saved", {
                aliasId: currentAlias,
                commentId: newId,
                coordinate,
                title: bodyParams.content
            });

            if (window.commentLogic?.handleNewComment) {
                await window.commentLogic.handleNewComment(payload);
            } else if (window.awtsmoosConductor?.handleNewComment) {
                await window.awtsmoosConductor.handleNewComment(payload);
            }

            const inline = await import("/heichelos/post/comments/logic/inlineManifest.js");
            await inline.manifestAliasInline(currentAlias);

            AwtsmoosPrompt.go({
                headerTxt: "Chat Immortalized!",
                bodyTxt: "Your conversation has been saved as a comment on this verse.",
                options: [ { text: "View Comment" }, { text: "Continue Chatting" } ]
            });
        } else {
            alert("Error: " + json.error);
        }
    } catch (e) {
        btn.disabled = false;
        btn.innerText = "💾 SAVE";
        alert("Network Error");
    }
}
