
// B"H
/**
 * @module ChatInputTools
 */
export function ChatInputTools() {
    return [
        {
            tag: 'button',
            className: 'chat-input-tool-btn',
            on: { 
                click: () => {
                    if (window.AppGlobals.Actions) {
                        window.AppGlobals.Actions.toggleModal('reactionMenu', true, 'chat-input', 'input');
                    }
                }
            },
            text: '😊'
        },
        {
            tag: 'button',
            className: 'chat-input-tool-btn transform -rotate-45',
            on: { 
                click: () => {
                    const hiddenInput = document.getElementById('hidden-chat-media-vessel');
                    if (hiddenInput) hiddenInput.click();
                }
            },
            text: '📎'
        },
        {
            tag: 'input',
            type: 'file',
            id: 'hidden-chat-media-vessel',
            className: 'hidden-input-void',
            accept: 'image/*,video/*',
            on: { 
                change: (e) => {
                    if (window.AppGlobals.Actions) {
                        window.AppGlobals.Actions.handleImageSelect(e.target.files, 'chat');
                    }
                }
            }
        }
    ];
}
