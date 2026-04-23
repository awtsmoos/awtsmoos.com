
// B"H
import { MarkdownParser } from '../../modules/markdown-parser.js';
import { ResponseParser } from '../../modules/ResponseParser.js';
import { ManifestationPainter } from './components/ManifestationPainter.js';

export const ChatCards = {
    renderModelMessage(div, content, tab, controller) {
        div.innerHTML = '';
        const tagS = "<" + "chan" + "ge>", tagE = "</" + "chan" + "ge>";
        
        if (!content.includes(tagS)) {
            this._appendText(div, content);
            return;
        }

        let lastIdx = 0;
        while (true) {
            const sIdx = content.indexOf(tagS, lastIdx);
            if (sIdx === -1) {
                this._appendText(div, content.substring(lastIdx));
                break;
            }
            
            this._appendText(div, content.substring(lastIdx, sIdx));
            const eIdx = content.indexOf(tagE, sIdx);
            
            if (eIdx === -1) {
                div.appendChild(this._createCard(content.substring(sIdx), false, tab, controller));
                break;
            }
            
            div.appendChild(this._createCard(content.substring(sIdx, eIdx + tagE.length), true, tab, controller));
            lastIdx = eIdx + tagE.length;
        }
    },

    _appendText(div, text) {
        const trim = text.trim();
        if (!trim) return;
        const textDiv = document.createElement('div');
        textDiv.className = 'vibe-model-text'; 
        textDiv.innerHTML = MarkdownParser.parse(trim);
        div.appendChild(textDiv);
    },

    _parseStreamingData(block) {
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
            content: rawContent || ""
        };
    },

    _createCard(block, isComplete, tab, controller) {
        const card = document.createElement('div');
        card.className = "vibe-manifest-card";
        
        const sessionRoot = tab.vibeSession.path || tab.vibeSession.rootPath || "/";
        let change;
        
        if (isComplete) {
            const parsed = ResponseParser.parseChanges(block, sessionRoot);
            change = parsed.length > 0 ? parsed[0] : null;
        } else {
            change = this._parseStreamingData(block);
            if (change) {
                // Ensure absolute path resolution just like ResponseParser
                change.path = ResponseParser._normalizePath(sessionRoot, change.path);
            }
        }
        
        ManifestationPainter.paint(card, isComplete);

        if (!change) {
            card.innerHTML = `<span style="font-size:0.8em; opacity:0.5;">Crystallizing...</span>`;
            return card;
        }

        const fileName = change.path.split("/").pop() || "vessel";

        if (!isComplete) {
            card.innerHTML = `
                <div class="vibe-card-header">
                    <span class="vibe-card-path" style="color:var(--neon-cyan); font-weight:bold;">Manifesting: ${fileName}</span>
                    <span class="vibe-card-status" style="font-size:0.7em; opacity:0.6;">...</span>
                </div>
                <div class="vibe-stream-box" style="max-height: 250px; overflow-y: auto; background: rgba(0,0,0,0.4); padding: 8px; border-radius: 4px; border: 1px dashed var(--color-border); margin-top: 8px;">
                    <pre style="margin: 0; font-family: var(--font-code); font-size: 0.85em; color: var(--neon-cyan); white-space: pre-wrap; word-wrap: break-word;"><code>${change.content.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')}</code></pre>
                </div>`;
            const box = card.querySelector('.vibe-stream-box');
            if (box) requestAnimationFrame(() => box.scrollTop = box.scrollHeight);
        } else {
            card.innerHTML = `
                <div style="display:flex; justify-content:space-between; align-items:center; width:100%;">
                    <span class="vibe-card-path" style="font-family:var(--font-code); font-weight:bold; color:white;">${fileName}</span>
                    <span style="color:var(--neon-lime); font-weight:bold;">✓</span>
                </div>
                <div class="vibe-card-desc" style="font-size:0.85em; color:var(--color-text-tertiary);">${change.operation.toUpperCase()}: ${change.description}</div>
            `;
            card.onclick = () => controller.previewFile(tab, change.path);
            card.style.cursor = 'pointer';
            
            ManifestationPainter.paint(card, true);
        }
        return card;
    }
};
