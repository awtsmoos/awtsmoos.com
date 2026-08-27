// B"H
/**
 * @file open-code-chat-global.js
 * @brief Opens native Code Chat for all workspaces.
 */

export default async function openCodeChatGlobal() {
  const { CodeChat } = await import('../../code-chat/index.js');
  return await CodeChat.openGlobal();
}
