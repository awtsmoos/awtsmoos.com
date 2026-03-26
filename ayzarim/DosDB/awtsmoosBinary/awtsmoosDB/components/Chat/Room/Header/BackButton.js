
// B"H
/**
 * @module ChatHeaderBackButton
 */
export function ChatHeaderBackButton() {
    return {
        tag: 'button',
        className: 'chat-header-back-btn',
        on: { 
            click: () => {
                if (window.AppGlobals && window.AppGlobals.Actions) {
                    window.AppGlobals.Actions.chatBack();
                }
            }
        },
        children: [{ tag: 'span', text: '❮' }]
    };
}
