// B"H
/**
 * @file agent-core.js
 * @brief Shared AI chat/tool core for Vibe, AI Studio, Code Chat, and /geelooy/ai.
 *
 * Chapter 13: The agent received a mirror from simulateRuntime. If a snapshot
 * exists, it is attached to the next thought-message so the model may inspect
 * the visible world, ask for more improvements, and spawn more work through
 * tool calls before finalizing.
 *
 * Chapter 453: The hidden catalog opened. A delegate may see every generated
 * tunnel action, yet the final dispatcher still judges whether the call reaches
 * a live bridge, a local browser tunnel, the Awtsmoos OAuth vessel, or the
 * honest Virtual OS fallback.
 */

import { ALL_RUNTIME_ACTIONS, SAFE_ACTIONS, actionCapability } from './actions.js';
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
      'The full generated tunnel action catalog may be offered as tools. Use exact action names; do not invent arguments.',
      'Prefer a live local tunnel bridge when it is available. In browser surfaces, the local bridge defaults to http://127.0.0.1:3977 and may be overridden by awtsmoos.localTunnelApiUrl.',
      'If no local bridge is available, work through the current Awtsmoos OAuth/session vessel when the host app provides it, or use Virtual OS fallback honestly.',
      'Virtual OS fallback supports only its compatible subset; actions marked requires-live-tunnel need a richer live bridge, native tunnel, or OAuth control route.',
      'Never store credentials in files. Use existing sessions, OAuth, API-key managers, or user-provided secure settings only.',
      'When runtime snapshots are attached, inspect the picture/text and decide if more improvements or subagents are needed before final answer.',
      'Never claim a real file changed unless a tool result says virtual:false or a concrete workspace bridge confirms it.',
      options.systemStyle || ''
    ].filter(Boolean).join('\n')
  };
  const user = { role: 'user', content: `Request:\n${options.userAsk || ''}\n\nContext:\n${options.contextPrompt || ''}` };
  const messages = [system, user];
  return attachSnapshotForAgent(messages, options.runtimeSnapshot || options.snapshot || null, { model: options.modelMeta || { id: options.modelId, provider: options.providerId }, providerId: options.providerId || options.provider || '' });
}

export function buildToolManifest(actions = ALL_RUNTIME_ACTIONS) {
  return actions.map(name => ({ name, capability: actionCapability(name) }));
}

export async function runSharedAgent(options = {}) {
  const streamChat = options.streamChat;
  if (typeof streamChat !== 'function') throw new Error('runSharedAgent requires a streamChat function.');
  const messages = buildSharedAgentMessages(options);
  const tools = buildToolManifest(options.actions || ALL_RUNTIME_ACTIONS);
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
