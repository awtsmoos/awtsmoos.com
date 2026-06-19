//B"H
import { AwtsmoosPrompt } from "./prompt.js";
import { getProvider, MultiPassToolAgent, OpenAICompatibleStreamClient, resolveProviderTunnelBridge } from "./central/index.js";
import { ProviderChatStore, providerUserMessage, providerAssistantMessage } from "./central/providerChatStore.js";
import { reasoningEvent, toolCallEvent } from "./central/providerEvents.js";
import { withAgentSystemInstructions } from "./central/agentSystemInstructions.js";

/**
 * B"H
 * Chapter 255: The Provider River Chooses Its Tunnel Gate.
 *
 * MiniMax/OpenRouter/Groq may now ask the local bridge, the OAuth endpoint
 * bridge, Virtual OS, or no bridge at all. The Awtsmoos remains one dispatcher;
 * only the doorway changes.
 */
export function makeOpenAICompatibleService(owner, providerId) {
  const provider = getProvider(providerId);
  const chatStore = new ProviderChatStore(owner.dbHandler, provider.id);
  return {
    name: provider.name,
    providerId: provider.id,
    async getAwtsmoosAudio() { return null; },
    async getConversationsFnc(page = {}) { return await chatStore.list(page); },
    async getConversation(id) { return await chatStore.messages(id); },
    async promptFunction(userMessage, options = {}) {
      const conversationId = options.conversationId || await newConversationId(chatStore, userMessage);
      const history = await chatStore.messages(conversationId);
      const apiKey = await getProviderKey(owner, provider);
      const client = new OpenAICompatibleStreamClient({ provider, apiKey });
      const bridge = await resolveProviderTunnelBridge(options);
      await chatStore.append(conversationId, [providerUserMessage(userMessage)], { title: userMessage.slice(0, 80) });
      const baseMessages = options.messages || toOpenAIMessages([...history, providerUserMessage(userMessage)]);
      const messages = await withAgentSystemInstructions(baseMessages);
      const packet = bridge
        ? await runWithLocalTools({ client, bridge, provider, options: { ...options, messages }, conversationId })
        : await runDirectProvider({ client, provider, options: { ...options, messages }, conversationId });
      await chatStore.append(conversationId, [providerAssistantMessage(packet.text || "", packet.awtsmoos?.otherEvents || [])]);
      return packet;
    },
    chatStore
  };
}

async function runWithLocalTools({ client, bridge, provider, options, conversationId }) {
  let latest = "";
  let events = [];
  let metrics = null;
  const streamPacket = () => options.onstream?.(assistantPacket(latest, events, conversationId, metrics));
  const emit = event => { events = mergeProviderEvents(events, [event]); streamPacket(); };
  const onMetrics = next => { metrics = next; options.onmetrics?.(next); streamPacket(); };
  const agent = new MultiPassToolAgent({ client, bridge, providerId: provider.id, emitEvent: emit });
  const agentResult = await agent.run({
    messages: options.messages,
    model: options.model || provider.defaultModel,
    stream: options.stream !== false,
    signal: options.signal,
    onMetrics,
    onDelta: (_delta, fullText) => { latest = fullText || latest; streamPacket(); }
  });
  const packet = assistantPacket(agentResult.text || latest || "", events, conversationId, metrics, agentResult.nextStep);
  options.onstream?.(packet);
  options.ondone?.(packet);
  return packet;
}

async function runDirectProvider({ client, provider, options, conversationId }) {
  let latest = "";
  let events = [];
  let metrics = null;
  const streamPacket = () => options.onstream?.(assistantPacket(latest, events, conversationId, metrics));
  const addEvents = next => { events = mergeProviderEvents(events, next); streamPacket(); };
  const onMetrics = next => { metrics = next; options.onmetrics?.(next); streamPacket(); };
  const result = await client.complete({
    messages: options.messages,
    model: options.model || provider.defaultModel,
    tools: options.tools || [],
    stream: options.stream !== false,
    signal: options.signal,
    onMetrics,
    onDelta: (_delta, fullText) => { latest = fullText || latest; streamPacket(); },
    onReasoning: (_chunk, full) => addEvents([reasoningEvent(full, provider.id, "direct")]),
    onToolCall: tools => addEvents(tools.map(tool => toolCallEvent(tool, provider.id)))
  });
  const packet = assistantPacket(result.text || latest || "", events, conversationId, metrics, result.awtsmoosNextStep || null);
  options.onstream?.(packet);
  options.ondone?.(packet);
  return packet;
}

function assistantPacket(text = "", events = [], conversationId = null, metrics = null, nextStep = null) {
  return {
    role: "assistant",
    text,
    conversation_id: conversationId,
    data: { conversation_id: conversationId },
    awtsmoos: { otherEvents: events, metrics, nextStep: nextStep?.needed ? nextStep : null },
    content: { parts: [text] },
    message: { author: { role: "assistant" }, content: { parts: [text] } }
  };
}

export async function getProviderKey(owner, provider) {
  if (!owner?.dbHandler?.db) await owner?.dbHandler?.init?.();
  let key = await owner.dbHandler.read("api-keys", provider.storageKey);
  if (!key) {
    key = await AwtsmoosPrompt.go({ headerTxt: `What's your <a href='${provider.apiKeyUrl}'>${provider.name} API key</a>?` });
    await owner.dbHandler.write("api-keys", provider.storageKey, key);
  }
  return key;
}

async function newConversationId(chatStore, userMessage) { const chat = await chatStore.begin({ title: String(userMessage || "Provider chat").slice(0, 80) }); return chat.id; }
function toOpenAIMessages(messages = []) { return messages.map(item => ({ role: roleOf(item), content: textOf(item) })).filter(item => item.content || item.role === "tool"); }
function roleOf(item = {}) { const role = item.role || item.message?.author?.role || "assistant"; return role === "model" ? "assistant" : role; }
function textOf(item = {}) { return item.text || item.message?.content?.parts?.join?.("\n") || item.content?.parts?.join?.("\n") || ""; }
function mergeProviderEvents(oldEvents = [], newEvents = []) {
  const keyed = new Map(oldEvents.filter(Boolean).map(event => [providerEventKey(event), event]));
  for (const event of newEvents.filter(Boolean)) {
    const key = providerEventKey(event);
    if (!key) continue;
    const old = keyed.get(key);
    keyed.set(key, old ? { ...event, order: old.order } : event);
  }
  return [...keyed.values()];
}
function providerEventKey(event = {}) {
  if (event.kind === "provider_stream") return "";
  if (event.kind === "thinking" && event.raw?.type === "provider_reasoning") return `${event.kind}:${event.raw.streamKey || event.raw.providerId || "provider"}`;
  if (event.raw?.tool_call_id) return `${event.kind}:${event.raw.tool_call_id}`;
  return [event.kind, event.label, String(event.text || "").replace(/\s+/g, " ").slice(0, 220)].join("::");
}
