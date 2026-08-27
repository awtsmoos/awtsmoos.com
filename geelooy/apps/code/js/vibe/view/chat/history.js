
// B"H
/**
 * @file history.js
 * @brief The Living Ledger of the Vibe.
 */

import { VibeDB } from '../../db.js';
import { VibeStatusOverlay } from './components/VibeStatusOverlay.js';
import { HTML } from '../../../html-generator.js';
import { MarkdownParser } from '../../modules/markdown-parser.js';
import { MessageDOMManager } from './rendering/MessageDOMManager.js';
import { MessageLayerOrchestrator } from './rendering/MessageLayerOrchestrator.js';

export const ChatHistory = {
    /**
     * B"H - Renders history into the UI.
     */
    render(container, history, tab, controller) {
        const histEl = container.querySelector('#vibe-chat-history');
        if (!histEl) return;

        const msgs = (history || []).filter(m => m.role !== 'system' && m.role !== 'tool');
        const isNearBottom = (histEl.scrollHeight - histEl.clientHeight) <= (histEl.scrollTop + 150);

        msgs.forEach((msg, idx) => {
            const node = MessageDOMManager.getOrCreateMessageNode(histEl, idx, msg.role);
            
            if (msg.role === 'user') {
                this._updateUserNode(node, msg, history, tab, controller);
            } else if (msg.role !== 'error') {
                MessageLayerOrchestrator.updateModelMessage(node, msg, history);
            }
        });

        while (histEl.children.length > msgs.length + 1) {
             const toRem = histEl.children[msgs.length];
             if (toRem && !toRem.classList.contains('vibe-status-aura')) toRem.remove();
             else break;
        }

        let aura = histEl.querySelector('.vibe-status-aura');
        if (!aura) {
            aura = HTML({ className: 'vibe-status-aura' });
            histEl.appendChild(aura);
        }
        aura.innerHTML = '';
        aura.appendChild(HTML(VibeStatusOverlay.build(tab, controller)));

        if (isNearBottom || msgs[msgs.length-1]?.isStreaming || msgs[msgs.length-1]?.isConnecting) {
            this.scrollToBottom(histEl);
        }
    },

    _updateUserNode(node, msg, fullHistory, tab, controller) {
        if (node.dataset.raw === msg.content) return;
        
        node.innerHTML = '';
        const content = HTML({
            style: { width: '100%', display: 'flex', justifyContent: 'space-between' },
            children: [
                { style: { flexGrow: 1 }, html: MarkdownParser.parse(msg.content || "") },
                { 
                    tag: 'button', text: '×', className: 'icon-button', 
                    style: { color: 'var(--color-accent-danger)', cursor: 'pointer' },
                    onClick: async () => {
                        const rIdx = fullHistory.indexOf(msg);
                        if (rIdx !== -1) {
                            tab.vibeSession.history.splice(rIdx);
                            await VibeDB.saveSession(tab.vibeSession.id, tab.vibeSession);
                            controller.refreshView(tab);
                        }
                    }
                }
            ]
        });
        node.appendChild(content);
        node.dataset.raw = msg.content;
    },

    scrollToBottom(el) {
        requestAnimationFrame(() => el.scrollTop = el.scrollHeight);
    },

    updateLastMessage(histEl, total, tab, controller) {
        this.render(histEl.parentElement.parentElement, tab.vibeSession.history, tab, controller);
    }
};
