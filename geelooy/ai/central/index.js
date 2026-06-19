// B"H
/**
 * @file index.js
 * @brief Central AI exports and the shared Awtsmoos runtime gate.
 *
 * @description
 * The Awtsmoos is one river. Provider chat, local tunnel tools, endpoint OAuth
 * tunnel dispatch, dynamic action catalogs, and virtual fallback tools share one
 * guarded runtime surface. Agents may discover every tunnel action, but
 * execution is still decided by the final dispatcher.
 */

export { AI_PROVIDERS, getProvider, listProviders } from './providers.js';
export { buildChatPayload, extractAssistantText, normalizeMessages, stripThinkingBlocks } from './payload.js';
export { estimateTokens, estimateRequestTokens, trimMessagesForContext } from './contextWindow.js';
export { OpenAICompatibleStreamClient } from './streamClient.js';
export { ALL_TUNNEL_ACTIONS, AI_AGENT_ACTIONS, aiAgentActions, allTunnelActions } from './actionCatalog.js';
export { DEFAULT_SAFE_ACTIONS, describeTool, makeAwtsmoosToolSchema, makeBridgeToolSchemas, makeToolSchemas, toolCallName, toolDetailName } from './toolSchemas.js';
export { candidateJsonTexts, normalizeNativeToolCalls, parseFallbackToolCalls } from './toolCallParser.js';
export { MultiPassToolAgent } from './multiPassAgent.js';
export { BrowserLocalTunnelBridge, getBrowserLocalTunnelBridge } from './browserLocalTunnelBridge.js';
export { EndpointTunnelBridge, makeVirtualOsTunnelBridge } from './endpointTunnelBridge.js';
export { resolveProviderTunnelBridge, tunnelMode } from './providerTunnelBridge.js';
export { ProviderChatStore, providerAssistantMessage, providerUserMessage } from './providerChatStore.js';
export { providerEvent, reasoningEvent, toolCallEvent, toolResultEvent, statusEvent, normalizeTraceEvents } from './providerEvents.js';
export { AllTunnelRegistry, browserTunnelDescriptor } from './tunnelRegistry.js';
export {
  SAFE_ACTIONS,
  VIRTUAL_ACTIONS,
  VirtualFilesystem,
  actionCapability,
  buildSharedAgentMessages,
  buildToolManifest,
  executeAgentTool,
  isWriteAction,
  makeRuntimeToolBridge,
  normalizeActionName,
  routeAwtsmoosAction,
  runSharedAgent,
  sharedVirtualFilesystem
} from '../../shared/awtsmoos-runtime/index.js';
