
// B"H
/**
 * @module ChatHeaderActions
 */
export function ChatHeaderActions() {
    return {
        tag: 'div',
        className: 'chat-header-actions',
        children: [
            { tag: 'button', text: '📹' },
            { tag: 'button', text: '📞' },
            { tag: 'button', text: '⋮' }
        ]
    };
}
