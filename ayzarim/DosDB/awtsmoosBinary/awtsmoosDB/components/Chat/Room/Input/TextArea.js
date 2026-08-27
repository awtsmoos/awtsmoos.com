
// B"H
/**
 * @module ChatInputTextArea
 */
export function ChatInputTextArea(chatId, currentText) {
    return {
        tag: 'textarea',
        id: 'chat-input',
        rows: '1',
        placeholder: 'Message',
        className: 'chat-input-field',
        on: {
            input: (e) => {
                e.target.style.height = '';
                e.target.style.height = e.target.scrollHeight + 'px';
                window.AppGlobals.Actions.setChatDraft(chatId, e.target.value);
            }
        },
        text: currentText
    };
}
