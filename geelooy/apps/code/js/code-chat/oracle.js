// B"H
/**
 * @file oracle.js
 * @brief Native Code Chat model bridge.
 */

import { runSharedAgent, executeAgentTool } from '../../../../shared/awtsmoos-runtime/index.js';
import { ModelManager } from '../vibe/model-manager.js';
import { VibeAPI } from '../vibe/api/client.js';
import { AiStudioSettings } from '../ai-studio/settings.js';

export async function askCodeChat(scope, text, contextPrompt) {
  const settings = AiStudioSettings.get();
  const modelId = settings.liveModelId || ModelManager.currentModel;
  if (!modelId || !ModelManager.getKeyForModel(modelId)) throw new Error('Code Chat needs a model with an API key. Add one in Vibe settings.');
  return await runSharedAgent({
    mode: 'chat',
    userAsk: text,
    contextPrompt,
    systemStyle: 'You are native Code Chat, separate from Vibe Code. Use tools when useful and respect the current chat scope.',
    modelId,
    streamChat: VibeAPI.streamChat.bind(VibeAPI),
    onToolCall: call => executeAgentTool(call, { preferVirtual: settings.preferVirtual })
  });
}
