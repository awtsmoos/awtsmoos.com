
// B"H
/**
 * @module ChatHeader
 */
import { ChatHeaderBackButton } from './Header/BackButton.js';
import { ChatHeaderIdentity } from './Header/Identity.js';
import { ChatHeaderActions } from './Header/Actions.js';

export function ChatHeader(chat) {
    return {
        tag: 'div',
        className: 'chat-header',
        children: [
            ChatHeaderBackButton(),
            ChatHeaderIdentity(chat.participantData, chat.typing),
            ChatHeaderActions()
        ]
    };
}
