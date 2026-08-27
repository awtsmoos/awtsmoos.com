//B"H
import { keepConversationNode } from "./keepNode.js";
import { walkConversationNodes } from "./walkConversation.js";
import { foldHistoryTurns } from "./turnFold.js";

/**
 * B"H — Convert ChatGPT history without erasing hidden vessels.
 *
 * The old loader kept only visible user/assistant text. This keeps thinking,
 * status, tool calls, tool results, OAuth/raw metadata, and final messages.
 */
export function conversationToMessages(convo = {}) {
  return foldHistoryTurns(walkConversationNodes(convo).filter(keepConversationNode));
}
