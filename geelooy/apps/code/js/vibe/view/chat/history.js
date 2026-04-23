
// B"H
import { MarkdownParser } from '../../modules/markdown-parser.js';
import { ChatCards } from './cards.js';
import { VibeDB } from '../../db.js';

export const ChatHistory = {
    render(container, history, tab, controller) {
        const histEl = container.querySelector('#vibe-chat-history');
        if (!histEl) return;

        // B"H - Filter out system noise
        const msgs = history.filter(m => m.role === 'user' || m.role === 'model');
        histEl.innerHTML = '';
        
        msgs.forEach((msg, index) => {
            const div = document.createElement('div');
            div.className = `vibe-message ${msg.role}`;
            
            if (msg.isManualManifest) div.classList.add('manual-manifest');

            if (msg.role === 'user') {
                // B"H - The Erasure Ritual: Allowing users to prune bad prompts
                const wrap = document.createElement('div');
                wrap.style.display = 'flex';
                wrap.style.justifyContent = 'space-between';
                wrap.style.alignItems = 'flex-start';
                wrap.style.gap = '10px';
                
                const contentDiv = document.createElement('div');
                contentDiv.style.flexGrow = '1';
                contentDiv.innerHTML = MarkdownParser.parse(msg.content);
                
                const delBtn = document.createElement('button');
                delBtn.innerHTML = '×';
                delBtn.className = 'icon-button';
                delBtn.style.width = '20px';
                delBtn.style.height = '20px';
                delBtn.style.padding = '0';
                delBtn.style.fontSize = '14px';
                delBtn.style.color = 'var(--color-accent-danger)';
                delBtn.title = 'Purge from Memory';
                
                delBtn.onclick = async () => {
                    // Remove this message and the AI's direct response following it
                    const realIndex = history.indexOf(msg);
                    if (realIndex !== -1) {
                        tab.vibeSession.history.splice(realIndex, 2);
                        await VibeDB.saveSession(tab.vibeSession.id, tab.vibeSession);
                        this.render(container, tab.vibeSession.history, tab, controller);
                    }
                };
                
                wrap.appendChild(contentDiv);
                wrap.appendChild(delBtn);
                div.appendChild(wrap);
            } else {
                ChatCards.renderModelMessage(div, msg.content, tab, controller);
            }
            histEl.appendChild(div);
        });
        
        // B"H - Smooth Scroll to Bottom
        requestAnimationFrame(() => {
            histEl.scrollTo({ top: histEl.scrollHeight, behavior: 'smooth' });
        });
    },

    updateLastMessage(histEl, content, tab, controller) {
        const msgs = histEl.querySelectorAll('.vibe-message.model');
        if (msgs.length === 0) return;
        const lastMsg = msgs[msgs.length - 1];
        ChatCards.renderModelMessage(lastMsg, content, tab, controller);
        
        // Keep the view grounded during streams
        requestAnimationFrame(() => {
            histEl.scrollTop = histEl.scrollHeight;
        });
    }
};
