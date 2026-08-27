//B"H

export function keepConversationNode(node = {}) {
  const message = node.message;
  if (!message) return false;
  if (message.metadata?.is_complete === false) return true;
  if (message.author?.role) return true;
  if (message.channel) return true;
  if (message.recipient) return true;
  if (message.content?.content_type) return true;
  return Boolean(message.content?.parts?.length || message.content?.text || message.content?.thoughts?.length);
}
