
// B"H
/**
 * @file ChatPanelLayout.js
 * @brief The Left Pillar: The Chat Interface.
 */

export const ChatPanelLayout = {
    build() {
        return {
            className: 'vibe-chat-panel',
            children: [
                { id: 'vibe-chat-history', className: 'vibe-chat-history' },
                { 
                    className: 'vibe-resizer input-resizer', 
                    id: 'vibe-resizer-input', 
                    style: { height: '6px', cursor: 'ns-resize', background: 'rgba(0,246,255,0.05)' } 
                },
                {
                    className: 'vibe-token-bar-bottom',
                    children: [
                        { tag: 'span', id: 'vibe-token-counter', className: 'vibe-token-counter-text', text: 'Tokens: --' },
                        {
                            className: 'vibe-token-controls',
                            children: [
                                { tag: 'button', id: 'vibe-restore-input-btn', className: 'vibe-restore-input-btn hidden', text: '▲ RESTORE INPUT' },
                                { tag: 'button', id: 'vibe-stop-btn', className: 'vibe-halt-btn hidden', text: 'HALT LOOP ✋' },
                                { tag: 'button', id: 'vibe-token-btn', className: 'vibe-token-refresh-btn icon-button', title: 'Recalculate Tokens', text: '⟳', style: { width: '24px', height: '24px', padding: 0, fontSize: '14px', border: '1px solid var(--color-border)', borderRadius: '4px', background: 'rgba(255,255,255,0.05)' } }
                            ]
                        }
                    ]
                },
                {
                    id: 'vibe-input-area', 
                    className: 'vibe-input-area',
                    children: [
                        {
                            className: 'vibe-input-wrapper',
                            children: [
                                { tag: 'textarea', id: 'vibe-input', className: 'vibe-textarea', placeholder: 'Command the Oracle...' },
                                { tag: 'button', id: 'vibe-send-btn', className: 'primary-btn', text: '➤' }
                            ]
                        },
                        {
                            className: 'vibe-actions',
                            children: [
                                {
                                    className: 'vibe-actions-left',
                                    children: [
                                        { tag: 'button', id: 'vibe-new-chat-btn', className: 'secondary-btn', style: { borderColor: 'var(--neon-cyan)', color: 'var(--neon-cyan)' }, title: 'Start a fresh chat for this folder', text: 'New Chat' },
                                        { tag: 'button', id: 'vibe-reset-btn', className: 'secondary-btn', title: 'Clear current chat history', text: 'Clear' },
                                        { tag: 'button', id: 'vibe-auto-refine-btn', className: 'secondary-btn', title: 'Configure Recursive Refinement', text: 'Auto-Refine', style: { borderColor: 'var(--neon-magenta)', color: 'var(--neon-magenta)' } },
                                        { tag: 'button', id: 'vibe-mgr-btn', className: 'secondary-btn', text: 'Settings' },
                                        { tag: 'button', id: 'vibe-hide-input-btn', className: 'secondary-btn', title: 'Minimize Input', text: '_' }
                                    ]
                                },
                                { tag: 'button', id: 'vibe-sidebar-toggle-btn', className: 'icon-button', html: '<svg class="svg-icon"><use href="#icon-sidebar"></use></svg>' }
                            ]
                        }
                    ]
                }
            ]
        };
    }
};
