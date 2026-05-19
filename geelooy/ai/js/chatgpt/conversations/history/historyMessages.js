//B"H
import { keepConversationNode } from "./keepNode.js";
import { walkConversationNodes } from "./walkConversation.js";

/**
 * B"H — Convert ChatGPT history without erasing hidden vessels.
 *
 * The old loader kept only visible user/assistant text. This keeps thinking,
 * status, tool calls, tool results, OAuth/raw metadata, and final messages.
 */
export function conversationToMessages(convo = {}) {
  return walkConversationNodes(convo).filter(keepConversationNode);
}
