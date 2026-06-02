// B"H
/**
 * @file open-ai-studio.js
 * @brief Legacy command alias that opens native per-file Code Chat.
 *
 * @description
 * The old Studio doorway now enters the living Code Chat chamber so there are
 * not two conflicting chat systems in the visible app.
 */

export default async function openAiStudio() {
  const { CodeChat } = await import('../../code-chat/index.js');
  return await CodeChat.openFile();
}
