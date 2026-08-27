//B"H
let navigationSeq = 0;

/**
 * Chapter 106: The Tab Remembered Which Vessel Was Open.
 *
 * A single browser tab can birth many chats, but one stale id in the window can
 * make every new vessel drink from yesterday's river. This tiny keeper stamps
 * each navigation and refuses to let old async loads repaint the present.
 */
export function beginVisibleConversation(conversationId = null) {
  navigationSeq += 1;
  setVisibleConversationId(conversationId);
  return { seq:navigationSeq, conversationId:conversationId || null };
}

export function setVisibleConversationId(conversationId = null) {
  window.curConversationId = conversationId || null;
  document.body?.toggleAttribute?.("data-blank-conversation", !conversationId);
}

export function isCurrentNavigation(token = {}) {
  return Boolean(token && token.seq === navigationSeq && (token.conversationId || null) === (window.curConversationId || null));
}

export function currentNavigationSeq() { return navigationSeq; }
