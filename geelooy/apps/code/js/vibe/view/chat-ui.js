
// B"H
// FILE: js/vibe/view/chat-ui.js

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
        
        // B"H - Markers
        const sM = ResponseParser.START_MARKER;
        const eM = ResponseParser.END_MARKER;
        const tagS = "<change>";
        const tagE = "</change>";

        let lastIdx = 0;
        
        while (true) {
            const sIdx = content.indexOf(tagS, lastIdx);
            
            if (sIdx === -1) {
                const remaining = content.substring(lastIdx).trim();
                if (remaining) {
                    const textDiv = document.createElement('div');
                    textDiv.innerHTML = MarkdownParser.parse(remaining);
                    div.appendChild(textDiv);
                }
                break;
            }

            const beforeText = content.substring(lastIdx, sIdx).trim();
            if (beforeText) {
                const textDiv = document.createElement('div');
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

        return {
            path: file,
            operation: extract("operation") || "write",
            description: extract("description") || "Rectification applied.",
            isComplete: isComplete
        };
    },

    _createCard(file, tab, controller) {
        const card = document.createElement('div');
        card.className = "vibe-manifest-card";
        
        const fileName = file.path.split("/").pop() || "vessel";
        const status = file.isComplete ? '✓' : '...';

        card.innerHTML = `
            <div class="vibe-card-header">
                <span class="vibe-card-path">${fileName}</span>
                <span class="vibe-card-status">${status}</span>
            </div>
            <div class="vibe-card-desc">${file.operation.toUpperCase()}: ${file.description}</div>
        `;

        if (file.isComplete && file.operation !== 'delete') {
            card.onclick = () => controller.previewFile(tab, file.path);
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
        if (container.scrollHeight - container.scrollTop <= container.clientHeight + 150) {
            container.scrollTop = container.scrollHeight;
        }
    }
};
