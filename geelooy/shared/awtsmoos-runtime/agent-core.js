// B"H
/**
 * @file agent-core.js
 * @brief Shared AI chat/tool core for Vibe, AI Studio, and /geelooy/ai.
 *
 * Chapter 13: The agent received a mirror from simulateRuntime. If a snapshot
 * exists, it is attached to the next thought-message so the model may inspect
 * the visible world, ask for more improvements, and spawn more work through
 * tool calls before finalizing.
 */

import { SAFE_ACTIONS, actionCapability } from './actions.js';
import { routeAwtsmoosAction } from './router.js';
import { attachSnapshotForAgent } from '../../ai/central/multimodal.js';

const MODE_PROMPTS = Object.freeze({
  chat: 'Help the user work across code workspaces, virtual OS, and live tunnel tools.',
  suggest: 'Give practical suggestions and risks. Do not rewrite unless asked.',
  function: 'Complete or repair the current function. Return code first, then notes.',
  file: 'Rewrite the whole file only when requested. Return complete code.'
});

export function buildSharedAgentMessages(options = {}) {
  const mode = options.mode || 'chat';
  const system = {
    role: 'system',
    content: [
      'B"H. You are the unified Awtsmoos coding agent.',
      MODE_PROMPTS[mode] || MODE_PROMPTS.chat,
      'Prefer exact tool calls when available. If offline, use virtual workspace results honestly.',
      'When runtime snapshots are attached, inspect the picture/text and decide if more improvements or subagents are needed before final answer.',
      'Never claim a real file changed unless a tool result says virtual:false or a concrete workspace bridge confirms it.',
      options.systemStyle || ''
    ].filter(Boolean).join('\n')
  };
  const user = { role: 'user', content: `Request:\n${options.userAsk || ''}\n\nContext:\n${options.contextPrompt || ''}` };
  const messages = [system, user];
  return attachSnapshotForAgent(messages, options.runtimeSnapshot || options.snapshot || null, { model: options.modelMeta || { id: options.modelId, provider: options.providerId }, providerId: options.providerId || options.provider || '' });
}

export function buildToolManifest(actions = SAFE_ACTIONS) {
  return actions.map(name => ({ name, capability: actionCapability(name) }));
}

export async function runSharedAgent(options = {}) {
  const streamChat = options.streamChat;
  if (typeof streamChat !== 'function') throw new Error('runSharedAgent requires a streamChat function.');
  const messages = buildSharedAgentMessages(options);
  const tools = buildToolManifest(options.actions || SAFE_ACTIONS);
  return await collectStream(streamChat, { ...options, messages, tools });
}

function collectStream(streamChat, options) {
  return new Promise((resolve, reject) => {
    let text = '';
    let reasoning = '';
    Promise.resolve(streamChat(
      options.messages,
      options.apiKey || null,
      options.modelId,
      options.tools || [],
      options.onActive || null,
      chunk => { text += chunk || ''; options.onChunk?.(chunk, text); },
      chunk => { reasoning += chunk || ''; options.onReasoning?.(chunk, reasoning); },
      async call => options.onToolCall ? options.onToolCall(call) : null,
      final => resolve(final || text || reasoning),
      reject,
      { attachments: options.attachments || [] }
    )).catch(reject);
  });
}

export async function executeAgentTool(call = {}, options = {}) {
  const name = call.name || call.function?.name || call.action;
  const args = call.arguments || call.args || call.payload || {};
  return await routeAwtsmoosAction({ ...options, action: name, args });
}
