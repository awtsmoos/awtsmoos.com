
// B"H
/**
 * @file chat-ui.js
 * @brief The Visual Tabernacle of AI Dialogue.
 */

import { MarkdownParser } from '../modules/markdown-parser.js';
import { ResponseParser } from '../modules/ResponseParser.js';

export const ChatUI = {
    /**
     * @function renderHistory
     * @description Re-builds the entire chat history.
     */
    renderHistory(container, history, tab, controller) {
        const hist = container.querySelector('#vibe-chat-history');
        if (!hist) return;
        
        const msgs = history.filter(m => m.role !== 'system');
        hist.innerHTML = '';
        
        msgs.forEach(msg => {
            this.appendMessage(msg, hist, tab, controller);
        });
        
        hist.scrollTop = hist.scrollHeight;
    },

    /**
     * @function appendMessage
     * @description Injects a single message into the history.
     */
    appendMessage(msg, container, tab, controller) {
        const div = document.createElement('div');
        div.className = `vibe-message ${msg.role}`;
        
        if (msg.role === 'user') {
            div.innerHTML = MarkdownParser.parse(msg.content);
        } else {
            this._renderModelMessage(div, msg.content, tab, controller);
        }
        
        container.appendChild(div);
    },

    /**
     * @private
     * @function _renderModelMessage
     * @description Renders model text and manifest cards.
     */
    _renderModelMessage(div, content, tab, controller) {
        div.innerHTML = '';
        
        // B"H - Tag string concatenation for safe XML transfer
        const tagS = "<" + "chan" + "ge>";
        const tagE = "</" + "chan" + "ge>";

        let lastIdx = 0;
        
        while (true) {
            const sIdx = content.indexOf(tagS, lastIdx);
            
            if (sIdx === -1) {
                const remaining = content.substring(lastIdx).trim();
                if (remaining) {
                    const textDiv = document.createElement('div');
                    textDiv.className = 'vibe-model-text'; 
                    textDiv.innerHTML = MarkdownParser.parse(remaining);
                    div.appendChild(textDiv);
                }
                break;
            }

            const beforeText = content.substring(lastIdx, sIdx).trim();
            if (beforeText) {
                const textDiv = document.createElement('div');
                textDiv.className = 'vibe-model-text'; 
                textDiv.innerHTML = MarkdownParser.parse(beforeText);
                div.appendChild(textDiv);
            }

            const eIdx = content.indexOf(tagE, sIdx);
            if (eIdx === -1) {
                // Streaming block
                const incomplete = content.substring(sIdx);
                const obj = this._parseCardData(incomplete, false);
                if (obj) div.appendChild(this._createCard(obj, tab, controller));
                break;
            }

            // Complete block
            const fullBlock = content.substring(sIdx, eIdx + tagE.length);
            const obj = this._parseCardData(fullBlock, true);
            if (obj) div.appendChild(this._createCard(obj, tab, controller));
            
            lastIdx = eIdx + tagE.length;
        }
    },

    /**
     * @private
     * @function _parseCardData
     * @description Extracts metadata from a block of AI XML.
     */
    _parseCardData(block, isComplete) {
        const extract = (tag) => {
            const s = "<" + tag + ">";
            const e = "</" + tag + ">";
            const si = block.indexOf(s);
            if (si === -1) return "";
            const ei = block.indexOf(e, si);
            if (ei === -1) return block.substring(si + s.length).trim();
            return block.substring(si + s.length, ei).trim();
        };

        const file = extract("file");
        if (!file) return null;

        let rawContent = extract("content");
        if (!rawContent && block.includes("<content>")) {
            rawContent = block.substring(block.indexOf("<content>") + 9);
        }

        return {
            path: file,
            operation: extract("operation") || "write",
            description: extract("description") || "Rectification applied.",
            content: rawContent || "",
            isComplete: isComplete
        };
    },

    /**
     * @private
     * @function _createCard
     * @description Manifests the physical card and handles auto-scroll.
     */
    _createCard(file, tab, controller) {
        const card = document.createElement('div');
        card.className = "vibe-manifest-card";
        
        const sessionRoot = tab.vibeSession.path || tab.vibeSession.rootPath || "/";
        const absolutePath = ResponseParser._normalizePath(sessionRoot, file.path);
        
        const fileName = absolutePath.split("/").pop() || "vessel";
        const status = file.isComplete ? '✓' : '...';

        if (!file.isComplete) {
            card.innerHTML = `
                <div class="vibe-card-header" style="border-bottom: 1px solid rgba(0, 246, 255, 0.2); padding-bottom: 5px; margin-bottom: 5px;">
                    <span class="vibe-card-path" title="${absolutePath}">Manifesting: ${fileName}</span>
                    <span class="vibe-card-status" style="animation: pulse 1s infinite alternate; color: var(--neon-lime);">${status}</span>
                </div>
                <div class="vibe-stream-box" style="max-height: 250px; overflow-y: auto; background: rgba(0,0,0,0.4); padding: 8px; border-radius: 4px; border: 1px dashed var(--color-border);">
                    <pre style="margin: 0; font-family: var(--font-code); font-size: 0.85em; color: var(--neon-cyan); white-space: pre-wrap; word-wrap: break-word;"><code>${file.content.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')}</code></pre>
                </div>
            `;
            
            // B"H - INNER AUTO SCROLL
            const box = card.querySelector('.vibe-stream-box');
            if (box) {
                requestAnimationFrame(() => {
                    box.scrollTop = box.scrollHeight;
                });
            }
        } else {
            // COMPLETE CARD
            card.innerHTML = `
                <div class="vibe-card-header">
                    <span class="vibe-card-path" title="${absolutePath}">${fileName}</span>
                    <span class="vibe-card-status">${status}</span>
                </div>
                <div class="vibe-card-desc">${file.operation.toUpperCase()}: ${file.description}</div>
            `;

            if (file.operation !== 'delete') {
                card.onclick = (e) => {
                    e.stopPropagation();
                    controller.previewFile(tab, absolutePath);
                };
            }
        }
        
        return card;
    },

    /**
     * @function updateLastMessage
     * @description Updates the most recent message with new stream content and handles sticky scroll.
     */
    updateLastMessage(container, content, tab, controller) {
        const lastMsg = container.lastElementChild;
        
        // B"H - STICKY SCROLL THRESHOLD
        const isAtBottom = (container.scrollHeight - container.scrollTop - container.clientHeight) < 150;

        if (!lastMsg || !lastMsg.classList.contains('model')) {
            this.appendMessage({ role: 'model', content }, container, tab, controller);
        } else {
            this._renderModelMessage(lastMsg, content, tab, controller);
        }

        if (isAtBottom) {
            container.scrollTop = container.scrollHeight;
        }
    }
};
