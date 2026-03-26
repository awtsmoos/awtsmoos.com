
// B"H
/**
 * @module ChatInput
 */
import { ChatInputTextArea } from './TextArea.js';
import { ChatInputTools } from './Tools.js';
import { ChatInputActionButtons } from './ActionButtons.js';

export function ChatInput(chat, replying, hasDraft, isRecording) {
    const showSend = (chat.draft || '').trim().length > 0;
    
    return {
        tag: 'div',
        className: 'chat-input-bar',
        children: [
            {
                tag: 'div',
                className: 'chat-input-row',
                children: [
                    ...ChatInputTools(),
                    {
                        tag: 'div',
                        className: 'chat-input-field-wrapper',
                        children: [ChatInputTextArea(chat.id, chat.draft || '')]
                    },
                    ...ChatInputActionButtons(chat.id, showSend)
                ]
            }
        ]
    };
}
