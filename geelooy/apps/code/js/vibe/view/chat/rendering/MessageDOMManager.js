
// B"H
/**
 * @file MessageDOMManager.js
 * @brief The Architect of the Message Vessel.
 */

import { HTML } from '../../../../html-generator.js';

export const MessageDOMManager = {
    /**
     * B"H - Creates the layered vessel for a message.
     */
    getOrCreateMessageNode(container, index, role = 'model') {
        const id = 'msg-node-' + index;
        let node = container.querySelector('#' + id);
        
        if (!node) {
            const isUser = role === 'user';
            node = HTML({
                id: id,
                className: 'vibe-message ' + (isUser ? 'user' : 'model'),
                style: {
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '10px',
                    width: '100%',
                    padding: '12px 16px',
                    background: isUser ? 'var(--color-bg-tertiary)' : 'rgba(0,0,0,0.2)',
                    border: '1px solid ' + (isUser ? 'var(--color-border)' : 'var(--color-border-accent)'),
                    borderRadius: '8px',
                    marginBottom: '10px',
                    animation: 'fadeIn 0.2s ease-out',
                    transition: 'all 0.3s ease' // Smooth transition for padding changes
                },
                children: isUser ? [] : [
                    { className: 'vibe-system-loading-layer', style: { width: '100%', display: 'none' } },
                    { className: 'vibe-thought-layer', style: { width: '100%' } },
                    { className: 'vibe-tool-layer', style: { width: '100%' } },
                    { className: 'vibe-text-layer', style: { width: '100%' } }
                ]
            });
            container.appendChild(node);
        }
        return node;
    }
};
