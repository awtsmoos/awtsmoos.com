
/**
 * @file history.js
 * @description
 * * Chapter 11: The Living Ledger (Interactive)
 */

import { MarkdownParser } from '../../modules/markdown-parser.js';
import { ChatCards } from './cards.js';
import { VibeDB } from '../../db.js';
import { VibeStatusOverlay } from './components/VibeStatusOverlay.js';
import { HTML } from '../../../html-generator.js';

export const ChatHistory = {
    render(container, history, tab, controller) {
        const histEl = container.querySelector('#vibe-chat-history');
        if (!histEl) return;

        const msgs = history.filter(m => m.role === 'user' || m.role === 'model');
        histEl.innerHTML = '';
        
        // 1. MANIFEST MESSAGES
        msgs.forEach((msg) => {
            const div = document.createElement('div');
            div.className = `vibe-message ${msg.role}`;
            
            if (msg.role === 'user') {
                const wrap = document.createElement('div');
                wrap.style.cssText = "display:flex; justify-content:space-between; align-items:flex-start; gap:10px;";
                
                const contentDiv = document.createElement('div');
                contentDiv.style.flexGrow = '1';
                contentDiv.innerHTML = MarkdownParser.parse(msg.content);
                
                const delBtn = document.createElement('button');
                delBtn.innerHTML = '×';
                delBtn.className = 'icon-button';
                delBtn.style.cssText = "width:20px; height:20px; padding:0; font-size:14px; color:var(--color-accent-danger);";
                
                delBtn.onclick = async () => {
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
        
        // 2. THE INTERACTIVE STATUS OVERLAY
        // We pass the controller here so the overlay can trigger UI updates
        const statusEl = HTML(VibeStatusOverlay.build(tab, controller));
        histEl.appendChild(statusEl);

        requestAnimationFrame(() => {
            histEl.scrollTo({ top: histEl.scrollHeight, behavior: 'smooth' });
        });
    },

    updateLastMessage(histEl, totalContent, tab, controller) {
        const msgs = histEl.querySelectorAll('.vibe-message.model');
        if (msgs.length === 0) return;
        const lastMsg = msgs[msgs.length - 1];
        
        const isNearBottom = (histEl.scrollHeight - histEl.clientHeight) <= (histEl.scrollTop + 150);

        ChatCards.renderModelMessage(lastMsg, totalContent, tab, controller);
        
        if (isNearBottom) {
            requestAnimationFrame(() => {
                histEl.scrollTop = histEl.scrollHeight;
            });
        }
    }
};
