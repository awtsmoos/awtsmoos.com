// B"H
// FILE: js/vibe/view/chat-ui.js

import { MarkdownParser } from '../modules/markdown-parser.js';
import pnimi from '/scripts/awtsmoos/coding/pnimi.js';

export const ChatUI = {
    renderHistory(container, history, tab, controller) {
        const hist = container.querySelector('#vibe-chat-history');
        if (!hist) return;
        
        const msgs = history.filter(m => m.role !== 'system');
        
        hist.innerHTML = '';
        msgs.forEach(m => this.appendMessage(m, hist, tab, controller));
        
        hist.scrollTop = hist.scrollHeight;
    },

    appendMessage(msg, container, tab, controller) {
        const div = document.createElement('div');
        div.className = `vibe-message ${msg.role}`;
        
        if (msg.role === 'user') {
            div.innerHTML = MarkdownParser.parse(msg.content);
        } else {
            // For model messages, we wrap content in a container to allow partial updates
            // B"H - Add a unique ID based on timestamp or index if available to track it?
            // For now, we trust the DOM order for the streaming message.
            this._renderModelMessage(div, msg.content, tab, controller);
        }
        
        container.appendChild(div);
        
        if (msg.role !== 'user') {
            this._hydrateCodeBlocks(div);
        }
    },

    // B"H - Enhanced Real-time Update to prevent flicker
    updateLastMessage(container, content, tab, controller) {
        const lastMsg = container.lastElementChild;
        if (!lastMsg || !lastMsg.classList.contains('model')) return;
        
        // 1. Parse the new content
        // We split by <change> blocks to isolate text vs cards
        const parts = content.split(/(<change>[\s\S]*?(?:<\/change>|$))/g);
        
        // 2. Diffing Strategy
        // We iterate through parts and the existing children of the message bubble.
        // If a child matches the type (text vs card) and key (path), we update it.
        // Otherwise we replace/append.
        
        let childIndex = 0;
        
        parts.forEach(part => {
            if (!part.trim()) return;
            
            const existingChild = lastMsg.children[childIndex];
            
            if (part.startsWith('<change>')) {
                const fileObj = this._parseSingleChangeBlock(part);
                
                if (fileObj) {
                    // Check if existing child is a card for the same file
                    if (existingChild && existingChild.classList.contains('vibe-manifest-card') && 
                        existingChild.dataset.path === fileObj.path) {
                        
                        // UPDATE EXISTING CARD (No flicker!)
                        const statusEl = existingChild.querySelector('.vibe-card-status');
                        const descEl = existingChild.querySelector('.vibe-card-desc');
                        
                        const newStatusHTML = fileObj.isComplete ? '✓' : '<span class="vibe-typing-indicator">...</span>';
                        if (statusEl.innerHTML !== newStatusHTML) statusEl.innerHTML = newStatusHTML;
                        
                        const newDesc = fileObj.description || fileObj.operation;
                        if (descEl.textContent !== newDesc) descEl.textContent = newDesc;
                        
                        if (fileObj.isComplete) existingChild.classList.remove('writing');
                        else existingChild.classList.add('writing');
                        
                    } else {
                        // Create New Card
                        const newCard = this._createCard(fileObj, tab, controller);
                        if (existingChild) {
                            lastMsg.replaceChild(newCard, existingChild);
                        } else {
                            lastMsg.appendChild(newCard);
                        }
                    }
                } else {
                    // Fallback for malformed
                    if (existingChild && existingChild.tagName === 'PRE') {
                        existingChild.textContent = part;
                    } else {
                        const pre = document.createElement('pre');
                        pre.textContent = part;
                        if(existingChild) lastMsg.replaceChild(pre, existingChild);
                        else lastMsg.appendChild(pre);
                    }
                }
            } else {
                // Text Content
                const newHTML = MarkdownParser.parse(part);
                if (existingChild && existingChild.tagName === 'DIV' && !existingChild.classList.contains('vibe-manifest-card')) {
                    if (existingChild.innerHTML !== newHTML) {
                        existingChild.innerHTML = newHTML;
                        this._hydrateCodeBlocks(existingChild);
                    }
                } else {
                    const textDiv = document.createElement('div');
                    textDiv.innerHTML = newHTML;
                    this._hydrateCodeBlocks(textDiv);
                    if(existingChild) lastMsg.replaceChild(textDiv, existingChild);
                    else lastMsg.appendChild(textDiv);
                }
            }
            childIndex++;
        });
        
        // Remove excess children if content shrank (rare in stream, but possible)
        while (lastMsg.children.length > childIndex) {
            lastMsg.removeChild(lastMsg.lastChild);
        }

        // Auto-scroll logic
        const isAtBottom = container.scrollHeight - container.scrollTop <= container.clientHeight + 100;
        if (isAtBottom) {
            container.scrollTop = container.scrollHeight;
        }
    },

    _renderModelMessage(div, content, tab, controller) {
        div.innerHTML = ''; // Initial render wipes (safe)
        const parts = content.split(/(<change>[\s\S]*?(?:<\/change>|$))/g);

        parts.forEach(part => {
            if (!part.trim()) return;

            if (part.startsWith('<change>')) {
                const fileObj = this._parseSingleChangeBlock(part);
                if (fileObj) {
                    div.appendChild(this._createCard(fileObj, tab, controller));
                } else {
                    const pre = document.createElement('pre');
                    pre.textContent = part;
                    div.appendChild(pre);
                }
            } else {
                const textDiv = document.createElement('div');
                textDiv.innerHTML = MarkdownParser.parse(part);
                div.appendChild(textDiv);
            }
        });
    },

    _parseSingleChangeBlock(block) {
        const fileObj = {
            path: null,
            operation: 'write',
            description: 'Generating...',
            isComplete: false
        };

        const fileMatch = block.match(/<file>([\s\S]*?)(?:<\/file>|<|$)/);
        if (fileMatch) fileObj.path = fileMatch[1].trim();

        const opMatch = block.match(/<operation>([\s\S]*?)(?:<\/operation>|<|$)/);
        if (opMatch) fileObj.operation = opMatch[1].trim().toLowerCase();

        const descMatch = block.match(/<description>([\s\S]*?)(?:<\/description>|<|$)/);
        if (descMatch) fileObj.description = descMatch[1].trim();

        if (block.includes('</change>')) fileObj.isComplete = true;

        if (!fileObj.path) return null;
        return fileObj;
    },

    _createCard(file, tab, controller) {
        const card = document.createElement('div');
        card.className = `vibe-manifest-card ${file.operation === 'delete' ? 'delete' : ''} ${file.isComplete ? '' : 'writing'}`;
        
        // B"H - Identification for diffing
        card.dataset.path = file.path; 
        
        const statusIcon = file.isComplete ? '✓' : '<span class="vibe-typing-indicator">...</span>';
        
        card.innerHTML = `
            <div class="vibe-card-header">
                <span class="vibe-card-path" title="${file.path}">${file.path}</span>
                <span class="vibe-card-status">${statusIcon}</span>
            </div>
            <div class="vibe-card-desc">${file.description || file.operation}</div>
        `;
        
        if (file.operation !== 'delete') {
            card.onclick = (e) => { 
                e.stopPropagation(); 
                controller.previewFile(tab, file.path); 
            };
        }
        
        return card;
    },

    _hydrateCodeBlocks(container) {
        if (typeof pnimi === 'undefined') return;
        const blocks = container.querySelectorAll('.vibe-code-container');
        blocks.forEach(block => {
            if (block.dataset.hydrated) return; // Prevent double hydration
            const lang = block.dataset.lang || 'js';
            const pre = block.querySelector('pre');
            try { 
                new pnimi(pre, lang); 
                block.dataset.hydrated = 'true';
            } catch(e) {}
        });
    },

    showStreamingMessage(container) {
        const div = document.createElement('div');
        div.className = 'vibe-message model';
        div.innerHTML = '<span style="color:var(--color-text-tertiary); font-style:italic;">Divine Intellect is manifesting...</span>';
        container.appendChild(div);
        container.scrollTop = container.scrollHeight;
        return div;
    }
};