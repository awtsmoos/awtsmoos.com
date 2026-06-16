// B"H
/**
 * @file oracle.js
 * @brief Native Code Chat model bridge.
 *
 * Chapter 454: Code Chat stopped whispering through a keyhole. It now carries
 * the full generated tunnel catalog and, when the browser can see a local
 * Awtsmoos tunnel bridge, routes calls through that living gate before falling
 * back to the Virtual OS with honest limits.
 */

import { runSharedAgent, executeAgentTool } from '../../../../shared/awtsmoos-runtime/index.js';
import { ALL_TUNNEL_ACTIONS } from '../../../../ai/central/actionCatalog.js';
import { getBrowserLocalTunnelBridge } from '../../../../ai/central/browserLocalTunnelBridge.js';
import { ModelManager } from '../vibe/model-manager.js';
import { VibeAPI } from '../vibe/api/client.js';
import { AiStudioSettings } from '../ai-studio/settings.js';

export async function askCodeChat(scope, text, contextPrompt) {
  const settings = AiStudioSettings.get();
  const modelId = settings.liveModelId || ModelManager.currentModel;
  if (!modelId || !ModelManager.getKeyForModel(modelId)) throw new Error('Code Chat needs a model with an API key. Add one in Vibe settings.');
  const bridge = settings.preferVirtual ? null : await getBrowserLocalTunnelBridge();
  return await runSharedAgent({
    mode: 'chat',
    userAsk: text,
    contextPrompt,
    systemStyle: 'You are native Code Chat, separate from Vibe Code. Use tunnel tools when useful, respect the current chat scope, and say clearly when an action needs a live tunnel or OAuth session.',
    modelId,
    actions: ALL_TUNNEL_ACTIONS,
    streamChat: VibeAPI.streamChat.bind(VibeAPI),
    onToolCall: call => executeAgentTool(call, { bridge, preferVirtual: settings.preferVirtual })
  });
}
