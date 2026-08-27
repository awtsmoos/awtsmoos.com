
// B"H
/**
 * @file chat-ui.js
 * @brief Legacy structural bridge redirecting to the modern chat/history.js module.
 */
import { ChatHistory } from './chat/history.js';
export const ChatUI = ChatHistory;
