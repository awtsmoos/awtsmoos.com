
// B"H
/**
 * @module ChatSanctuary
 */
import { ChatHeader } from './Header.js';
import { MessageList } from './MessageList.js';
import { ChatInput } from './Input/index.js';

export function ChatSanctuary(chat, replying, hasDraft, isRecording) {
    return {
        tag: 'div',
        className: 'chat-sanctuary',
        children: [
            ChatHeader(chat),
            {
                tag: 'div',
                id: 'chat-messages-container',
                className: 'chat-message-list no-scrollbar',
                children: MessageList(chat.messages || [])
            },
            ChatInput(chat, replying, hasDraft, isRecording)
        ]
    };
}
