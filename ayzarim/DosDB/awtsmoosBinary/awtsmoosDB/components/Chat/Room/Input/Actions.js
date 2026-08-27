
// B"H
/**
 * @module ChatInputActions
 */
export function ChatInputActions(chatId, showSend) {
    return [
        {
            tag: 'button',
            id: 'chat-send-btn',
            className: `chat-input-action-orb ${showSend ? '' : 'hidden-input-void'}`,
            on: { 
                click: () => {
                    const input = document.getElementById('chat-input');
                    if (input && window.AppGlobals.Actions) {
                        window.AppGlobals.Actions.sendMessage(chatId, input.value);
                    }
                }
            },
            children: [{ tag: 'span', className: 'icon-send', text: '➤' }]
        },
        {
            tag: 'button',
            id: 'chat-mic-btn',
            className: `chat-input-action-orb ${showSend ? 'hidden-input-void' : ''}`,
            on: { 
                pointerdown: () => {
                    if (window.AppGlobals.Actions) window.AppGlobals.Actions.startRecording();
                }
            },
            text: '🎙️'
        }
    ];
}
