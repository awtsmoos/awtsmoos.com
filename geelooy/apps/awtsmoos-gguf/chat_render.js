
// B"H
/**
 * Chat Render Module
 * Handles HTML generation for chat bubbles
 */
import { chatUI } from './chat_view.js';
import { parseMarkdown } from './ui_markdown.js';

let currentStreamContent = null;
let isFirstStreamToken = false;

// Helper to get or create width wrapper inside chat history
function getWrapper() {
    if (!chatUI.history) return null;
    let wrapper = chatUI.history.querySelector('.chat-content-width');
    if (!wrapper) {
        wrapper = document.createElement('div');
        wrapper.className = 'chat-content-width';
        chatUI.history.appendChild(wrapper);
    }
    return wrapper;
}

export function scrollToBottom() {
    if (chatUI.history) {
        // Smooth scroll to bottom
        setTimeout(() => {
            chatUI.history.scrollTop = chatUI.history.scrollHeight;
        }, 0);
    }
}

export function createCopyBtn(text) {
    // Stub or hidden element to satisfy legacy imports if any
    const span = document.createElement('span');
    span.style.display = 'none';
    return span;
}

export function appendUserMessage(text) {
    const wrapper = getWrapper();
    if (!wrapper) return;
    
    const row = document.createElement('div');
    row.className = 'msg-row user animate-fade-in';
    
    const bubble = document.createElement('div');
    bubble.className = "chat-bubble user";
    bubble.innerText = text;
    
    row.appendChild(bubble);
    wrapper.appendChild(row);
    scrollToBottom();
}

export function appendSystemMessage(text) {
    const wrapper = getWrapper();
    if (!wrapper) return;

    const row = document.createElement('div');
    row.className = 'msg-row model animate-fade-in';
    
    const bubble = document.createElement('div');
    bubble.className = "chat-bubble model";
    bubble.innerHTML = parseMarkdown(text); // Parse system messages too
    
    row.appendChild(bubble);
    wrapper.appendChild(row);
    scrollToBottom();
}

export function startStreamMessage() {
    const wrapper = getWrapper();
    if (!wrapper) return;
    
    isFirstStreamToken = true;

    const row = document.createElement('div');
    row.className = 'msg-row model animate-fade-in';
    
    const bubble = document.createElement('div');
    bubble.className = 'chat-bubble model min-h-[40px]';
    
    const contentDiv = document.createElement('div');
    contentDiv.className = 'markdown-content';
    contentDiv.rawText = ''; // Store raw text here

    const cursor = document.createElement('span');
    cursor.id = 'stream-cursor';
    
    bubble.appendChild(contentDiv);
    bubble.appendChild(cursor);
    row.appendChild(bubble);
    
    wrapper.appendChild(row);
    currentStreamContent = contentDiv;
    scrollToBottom();
}

export async function streamToken(text) {
    if (!currentStreamContent) return;
    
    if (isFirstStreamToken) {
        if (/^\s+$/.test(text)) return; 
        text = text.replace(/^\s+/, '');
        if (text.length === 0) return;
        isFirstStreamToken = false;
    }
    
    currentStreamContent.rawText += text;
    // B"H - Live markdown parsing
    currentStreamContent.innerHTML = parseMarkdown(currentStreamContent.rawText);

    scrollToBottom();
}

export function endStreamMessage() {
    if (!currentStreamContent) return;
    
    // Final parse
    currentStreamContent.innerHTML = parseMarkdown(currentStreamContent.rawText);

    // Remove cursor from parent bubble
    const bubble = currentStreamContent.parentElement;
    if (bubble) {
        const cursor = bubble.querySelector('#stream-cursor');
        if (cursor) cursor.remove();
    }
    
    currentStreamContent = null;
}