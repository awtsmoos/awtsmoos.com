
// B"H
/**
 * @module ChatInputActionButtons
 */
export function ChatInputActionButtons(chatId, showSend) {
    return [
        {
            tag: 'button',
            id: 'chat-send-btn',
            className: `chat-input-action-orb ${showSend ? '' : 'hidden-input-void'}`,
            on: { 
                click: () => window.AppGlobals.Actions.sendMessage(chatId, document.getElementById('chat-input').value) 
            },
            children: [{ tag: 'span', className: 'icon-send', text: '➤' }]
        },
        {
            tag: 'button',
            id: 'chat-mic-btn',
            className: `chat-input-action-orb ${showSend ? 'hidden-input-void' : ''}`,
            on: { 
                pointerdown: () => window.AppGlobals.Actions.startRecording() 
            },
            text: '🎙️'
        }
    ];
}
