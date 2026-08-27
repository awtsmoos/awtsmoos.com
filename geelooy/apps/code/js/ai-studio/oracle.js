// B"H
/**
 * @file oracle.js
 * @brief AI Studio oracle over the unified shared runtime.
 */

import { runSharedAgent, executeAgentTool } from '../../../../shared/awtsmoos-runtime/index.js';
import { VibeAPI } from '../vibe/api/client.js';
import { ModelManager } from '../vibe/model-manager.js';
import { AiStudioSettings } from './settings.js';

export const AiStudioOracle = {
  hasModel() { return !!(ModelManager.currentModel && ModelManager.getActiveKey()); },

  async ask(mode, userAsk, contextPrompt) {
    if (!this.hasModel()) throw new Error('No active AI model/key is configured. Add a key in App Settings → Vibe models.');
    const settings = AiStudioSettings.get();
    return await runSharedAgent({
      mode,
      userAsk,
      contextPrompt,
      systemStyle: settings.systemStyle,
      modelId: ModelManager.currentModel,
      streamChat: VibeAPI.streamChat.bind(VibeAPI),
      preferVirtual: settings.preferVirtual,
      onToolCall: call => executeAgentTool(call, { preferVirtual: settings.preferVirtual })
    });
  },

  async tool(action, args = {}) {
    return await executeAgentTool({ name: action, arguments: args }, { preferVirtual: AiStudioSettings.get().preferVirtual });
  }
};
