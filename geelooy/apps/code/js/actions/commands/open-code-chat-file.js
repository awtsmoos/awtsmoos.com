// B"H
/**
 * @file open-code-chat-file.js
 * @brief Opens native Code Chat for the active file.
 */

export default async function openCodeChatFile() {
  const { CodeChat } = await import('../../code-chat/index.js');
  return await CodeChat.openFile();
}
