
// B"H
/**
 * @file chat-ui.js
 * @brief The Visual Tabernacle of AI Dialogue.
 * 
 * THE POEM OF THE CONTAINED STREAM:
 * The Speech of the Awtsmoos pours like a heavy rain,
 * But the vessel of the screen must not break under the strain.
 * We build a box of glass, with a height that we command,
 * To watch the code flow down like hourglass sand.
 * And when the word is finished, the card becomes complete,
 * Anchored in its local home, where intent and action meet.
 */

import { MarkdownParser } from '../modules/markdown-parser.js';
import { ResponseParser } from '../modules/ResponseParser.js';

export const ChatUI = {
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

    _renderModelMessage(div, content, tab, controller) {
        div.innerHTML = '';
        
        const tagS = "<ch" + "ange>";
        const tagE = "</ch" + "ange>";

        let lastIdx = 0;
        
        while (true) {
            const sIdx = content.indexOf(tagS, lastIdx);
            
            if (sIdx === -1) {
                const remaining = content.substring(lastIdx).trim();
                if (remaining) {
                    const textDiv = document.createElement('div');
                    textDiv.className = 'vibe-model-text'; // B"H - Added constraint class
                    textDiv.innerHTML = MarkdownParser.parse(remaining);
                    div.appendChild(textDiv);
                }
                break;
            }

            const beforeText = content.substring(lastIdx, sIdx).trim();
            if (beforeText) {
                const textDiv = document.createElement('div');
                textDiv.className = 'vibe-model-text'; // B"H - Added constraint class
                textDiv.innerHTML = MarkdownParser.parse(beforeText);
                div.appendChild(textDiv);
            }

            const eIdx = content.indexOf(tagE, sIdx);
            if (eIdx === -1) {
                // Streaming Case
                const incomplete = content.substring(sIdx);
                const obj = this._parseCardData(incomplete, false);
                if (obj) div.appendChild(this._createCard(obj, tab, controller));
                break;
            }

            // Complete Block
            const fullBlock = content.substring(sIdx, eIdx + tagE.length);
            const obj = this._parseCardData(fullBlock, true);
            if (obj) div.appendChild(this._createCard(obj, tab, controller));
            
            lastIdx = eIdx + tagE.length;
        }
    },

    _parseCardData(block, isComplete) {
        const extract = (tag) => {
            const s = `<${tag}>`;
            const e = `</${tag}>`;
            const si = block.indexOf(s);
            if (si === -1) return "";
            const ei = block.indexOf(e, si);
            if (ei === -1) return block.substring(si + s.length).trim();
            return block.substring(si + s.length, ei).trim();
        };

        const file = extract("file");
        if (!file) return null;

        // B"H - Extracting streaming content directly for the UI box
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

    _createCard(file, tab, controller) {
        const card = document.createElement('div');
        card.className = "vibe-manifest-card";
        
        // B"H - RECTIFIED PATH LOGIC
        const sessionRoot = tab.vibeSession.path || tab.vibeSession.rootPath || (tab.item ? tab.item.path : "/");
        const absolutePath = ResponseParser._normalizePath(sessionRoot, file.path);
        
        const fileName = absolutePath.split("/").pop() || "vessel";
        const status = file.isComplete ? '✓' : '...';

        if (!file.isComplete) {
            // B"H - THE STREAMING BOX WITH MAX-HEIGHT
            card.innerHTML = `
                <div class="vibe-card-header" style="border-bottom: 1px solid rgba(0, 246, 255, 0.2); padding-bottom: 5px; margin-bottom: 5px;">
                    <span class="vibe-card-path" title="${absolutePath}">Manifesting: ${fileName}</span>
                    <span class="vibe-card-status" style="animation: pulse 1s infinite alternate; color: var(--neon-lime);">${status}</span>
                </div>
                <div class="vibe-stream-box" style="max-height: 250px; overflow-y: auto; background: rgba(0,0,0,0.4); padding: 8px; border-radius: 4px; border: 1px dashed var(--color-border);">
                    <pre style="margin: 0; font-family: var(--font-code); font-size: 0.85em; color: var(--neon-cyan); white-space: pre-wrap; word-wrap: break-word;"><code>${file.content.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</code></pre>
                </div>
            `;
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
                    console.log(`[ChatUI] B"H - Previewing manifested vessel: ${absolutePath}`);
                    controller.previewFile(tab, absolutePath);
                };
            }
        }
        
        return card;
    },

    updateLastMessage(container, content, tab, controller) {
        const lastMsg = container.lastElementChild;
        if (!lastMsg || !lastMsg.classList.contains('model')) {
            this.appendMessage({ role: 'model', content }, container, tab, controller);
            return;
        }

        this._renderModelMessage(lastMsg, content, tab, controller);

        // Auto-scroll
        if (container.scrollHeight - container.scrollTop <= container.clientHeight + 400) {
            container.scrollTop = container.scrollHeight;
        }
    }
};
