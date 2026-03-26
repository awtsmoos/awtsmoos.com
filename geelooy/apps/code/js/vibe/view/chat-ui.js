
// B"H
import { MarkdownParser } from '../modules/markdown-parser.js';
import { ResponseParser } from '../modules/ResponseParser.js';

export const ChatUI = {
    renderHistory(container, history, tab, controller) {
        const hist = container.querySelector('#vibe-chat-history');
        if (!hist) return;
        const msgs = history.filter(m => m.role !== 'system');
        hist.innerHTML = '';
        msgs.forEach(msg => this.appendMessage(msg, hist, tab, controller));
        hist.scrollTop = hist.scrollHeight;
    },

    appendMessage(msg, container, tab, controller) {
        const div = document.createElement('div');
        div.className = `vibe-message ${msg.role}`;
        if (msg.role === 'user') div.innerHTML = MarkdownParser.parse(msg.content);
        else this._renderModelMessage(div, msg.content, tab, controller);
        container.appendChild(div);
    },

    _renderModelMessage(div, content, tab, controller) {
        div.innerHTML = '';
        // B"H - Shatter the tags to prevent XML loops
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
                const obj = this._parseCardData(content.substring(sIdx), false);
                if (obj) div.appendChild(this._createCard(obj, tab, controller));
                break;
            }
            
            const obj = this._parseCardData(content.substring(sIdx, eIdx + tagE.length), true);
            if (obj) div.appendChild(this._createCard(obj, tab, controller));
            lastIdx = eIdx + tagE.length;
        }
    },

    _parseCardData(block, isComplete) {
        const extract = (tag) => {
            const s = "<" + tag + ">", e = "</" + tag + ">";
            const si = block.indexOf(s); if (si === -1) return "";
            const ei = block.indexOf(e, si);
            return (ei === -1 ? block.substring(si + s.length) : block.substring(si + s.length, ei)).trim();
        };
        const file = extract("fi" + "le"); 
        if (!file) return null;
        
        let rawContent = extract("cont" + "ent");
        const cS = "<cont" + "ent>";
        if (!rawContent && block.includes(cS)) {
            rawContent = block.substring(block.indexOf(cS) + 9);
        }
        
        return { 
            path: file, 
            operation: extract("operat" + "ion") || "write", 
            description: extract("descrip" + "tion") || "", 
            content: rawContent || "", 
            isComplete 
        };
    },

    _createCard(file, tab, controller) {
        const card = document.createElement('div');
        card.className = "vibe-manifest-card";
        const sessionRoot = tab.vibeSession.path || tab.vibeSession.rootPath || "/";
        const absolutePath = ResponseParser._normalizePath(sessionRoot, file.path);
        const fileName = absolutePath.split("/").pop() || "vessel";

        if (!file.isComplete) {
            card.innerHTML = `
                <div class="vibe-card-header"><span class="vibe-card-path">Manifesting: ${fileName}</span><span class="vibe-card-status">...</span></div>
                <div class="vibe-stream-box" style="max-height: 250px; overflow-y: auto; background: rgba(0,0,0,0.4); padding: 8px; border-radius: 4px; border: 1px dashed var(--color-border);">
                    <pre style="margin: 0; font-family: var(--font-code); font-size: 0.85em; color: var(--neon-cyan); white-space: pre-wrap; word-wrap: break-word;"><code>${file.content.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')}</code></pre>
                </div>`;
            const box = card.querySelector('.vibe-stream-box');
            if (box) requestAnimationFrame(() => box.scrollTop = box.scrollHeight);
        } else {
            card.innerHTML = `<div class="vibe-card-header"><span class="vibe-card-path">${fileName}</span><span class="vibe-card-status">✓</span></div><div class="vibe-card-desc">${file.operation.toUpperCase()}: ${file.description}</div>`;
            card.onclick = (e) => { e.stopPropagation(); controller.previewFile(tab, absolutePath); };
        }
        return card;
    }
};
