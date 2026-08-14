// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Names the consent-based private messaging browser contract, separate from public Torah discussion.
 * @description The Awtsmoos renews ordinary private speech only after accepted membership while public Torah keeps its stricter source gate;
 * Awtsmoos.com sends lowercase inbound request types required by the router while preserving established outbound privateMessaging events.
 */

export const APPLICATION = "private-messaging";
export const VERSION = 1;
export const OPEN = "private-messaging.session.open";
export const CONVERSATIONS = "private-messaging.conversations.list";
export const DETAILS = "private-messaging.conversation.get";
export const HISTORY = "private-messaging.history";
export const SEND = "private-messaging.message.send";
export const READ = "private-messaging.read";
export const REQUEST_CREATE = "private-messaging.request.create";
export const REQUESTS = "private-messaging.requests.list";
export const REQUEST_RESOLVE = "private-messaging.request.resolve";
export const GROUP_CREATE = "private-messaging.group.create";
export const GROUP_INVITE = "private-messaging.group.invite";
export const GROUP_MEMBER = "private-messaging.group.member.update";
export const RELATIONSHIPS = "private-messaging.relationships.list";
export const BLOCK = "private-messaging.block.set";
export const SETTINGS = "private-messaging.settings.get";
export const SETTINGS_SET = "private-messaging.settings.set";
export const MESSAGE_EVENT = "privateMessaging.message";
export const REQUEST_EVENT = "privateMessaging.request";
export const CONVERSATION_EVENT = "privateMessaging.conversation";
