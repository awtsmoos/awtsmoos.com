// B"H
const path = require("path");
const { pathToFileURL } = require("url");
const { loadConfig, saveConfigPatch } = require("../../../lib/config.js");

const PROVIDERS = Object.freeze({
  minimax: {
    id: "minimax",
    name: "MiniMax",
    endpoint: "https://api.minimax.io/v1/chat/completions",
    defaultModel: "MiniMax-M2.7",
    contextWindow: 196000,
    extraBody: { reasoning_split: true }
  },
  openrouter: {
    id: "openrouter",
    name: "OpenRouter",
    endpoint: "https://openrouter.ai/api/v1/chat/completions",
    defaultModel: "openai/gpt-4o-mini",
    contextWindow: 128000
  }
});

/**
 * B"H
 * Chapter 340: The Council Found The True River Beneath The Palace.
 *
 * These actions let one agent behold available agent-vessels, place or remove
 * provider keys, and send a message through the same streaming parser used by
 * the browser AI stack. The Awtsmoos breathes through one river, not many
 * drifting copies; this path now climbs to geelooy/shared, the true spring.
 *
 * @param {object} ctx Tunnel action context.
 * @returns {object} Action handlers.
 */
function buildAiAgentActions(ctx) {
  const { payload } = ctx;
  return {
    async aiAgentList() { return { ok: true, action: "aiAgentList", agents: listAgents(loadConfig()), providers: publicProviders(loadConfig()) }; },
    async aiAgentSetProviderKey() { return setProviderKey(payload); },
    async aiAgentRemoveProviderKey() { return removeProviderKey(payload); },
    async aiAgentMessage() { return sendAgentMessage(payload); }
  };
}

function listAgents(config) {
  return configuredAgents(config).map(agent => ({
    id: agent.id,
    name: agent.name,
    provider: agent.provider,
    model: agent.model || providerFor(agent.provider).defaultModel,
    description: agent.description || "Delegated Awtsmoos reasoning vessel",
    ready: !!providerKey(config, agent.provider),
    system: agent.system ? "configured" : "default"
  }));
}

function configuredAgents(config) {
  const custom = Array.isArray(config.aiAgents?.agents) ? config.aiAgents.agents : [];
  const defaults = [agent("openrouter-general", "OpenRouter General", "openrouter"), agent("minimax-deep", "MiniMax Deep Delegate", "minimax")];
  const seen = new Set(custom.map(x => x.id));
  return [...custom, ...defaults.filter(x => !seen.has(x.id))];
}

function agent(id, name, provider) {
  return { id, name, provider, description: `${name} can brainstorm, critique, and delegate.` };
}

function publicProviders(config) {
  const keys = config.aiAgents?.providerKeys || {};
  return Object.values(PROVIDERS).map(provider => ({
    id: provider.id,
    name: provider.name,
    endpoint: provider.endpoint,
    defaultModel: provider.defaultModel,
    hasKey: !!keys[provider.id],
    keyMask: maskKey(keys[provider.id])
  }));
}

function setProviderKey(payload) {
  const providerId = clean(payload.provider || payload.providerId);
  const apiKey = String(payload.apiKey || "").trim();
  if (!PROVIDERS[providerId]) return failure("unknown_provider", { providerId });
  if (!apiKey) return failure("missing_api_key", { providerId });
  const current = loadConfig();
  const providerKeys = { ...(current.aiAgents?.providerKeys || {}), [providerId]: apiKey };
  const next = saveConfigPatch({ aiAgents: { ...(current.aiAgents || {}), providerKeys } });
  return { ok: true, action: "aiAgentSetProviderKey", provider: providerId, providers: publicProviders(next) };
}

function removeProviderKey(payload) {
  const providerId = clean(payload.provider || payload.providerId);
  if (!PROVIDERS[providerId]) return failure("unknown_provider", { providerId });
  const current = loadConfig();
  const providerKeys = { ...(current.aiAgents?.providerKeys || {}) };
  delete providerKeys[providerId];
  const next = saveConfigPatch({ aiAgents: { ...(current.aiAgents || {}), providerKeys } });
  return { ok: true, action: "aiAgentRemoveProviderKey", provider: providerId, providers: publicProviders(next) };
}

async function sendAgentMessage(payload) {
  const config = loadConfig();
  const agentConfig = resolveAgent(config, payload.agentId || payload.agent || "openrouter-general");
  const provider = providerFor(payload.provider || agentConfig.provider);
  const apiKey = providerKey(config, provider.id);
  if (!apiKey) return failure("missing_provider_key", { provider: provider.id, actionHint: "aiAgentSetProviderKey" });
  const messages = buildMessages(agentConfig, payload);
  const body = { model: payload.model || agentConfig.model || provider.defaultModel, messages, stream: payload.stream !== false, ...(provider.extraBody || {}) };
  const response = await fetch(provider.endpoint, { method: "POST", headers: providerHeaders(provider, apiKey), body: JSON.stringify(body) });
  if (!response.ok) return failure("provider_error", { provider: provider.id, status: response.status, body: await response.text().catch(() => response.statusText) });
  if (body.stream && response.body) return await readStreamingResponse(response, provider, agentConfig);
  return await readJsonResponse(response, provider, agentConfig);
}

function resolveAgent(config, id) {
  const found = configuredAgents(config).find(agent => agent.id === id);
  if (found) return found;
  throw new Error(`Unknown AI agent: ${id}`);
}

function providerFor(id) {
  const provider = PROVIDERS[clean(id)];
  if (!provider) throw new Error(`Unknown AI provider: ${id}`);
  return provider;
}

function providerKey(config, providerId) {
  return config.aiAgents?.providerKeys?.[providerId] || process.env[`${providerId.toUpperCase()}_API_KEY`] || "";
}

function buildMessages(agentConfig, payload) {
  const given = Array.isArray(payload.messages) ? payload.messages : [];
  const prompt = String(payload.message || payload.prompt || "").trim();
  const system = payload.system || agentConfig.system || "You are an Awtsmoos delegate agent. Answer clearly, helpfully, and truthfully.";
  return [{ role: "system", content: system }, ...given, ...(prompt ? [{ role: "user", content: prompt }] : [])];
}

async function readStreamingResponse(response, provider, agentConfig) {
  const { readSSEStream } = await import(sharedStreamingUrl());
  const result = await readSSEStream(response.body.getReader(), provider.id, {});
  return { ok: true, action: "aiAgentMessage", agent: agentConfig.id, provider: provider.id, text: result.text || "", reasoning: result.reasoning || "", toolCalls: result.tools || [], usage: result.usage || null, finishReason: result.finishReason || null };
}

async function readJsonResponse(response, provider, agentConfig) {
  const json = await response.json();
  const message = json?.choices?.[0]?.message || {};
  return { ok: true, action: "aiAgentMessage", agent: agentConfig.id, provider: provider.id, text: message.content || "", toolCalls: message.tool_calls || [], usage: json.usage || null, raw: json };
}

function sharedStreamingUrl() {
  return pathToFileURL(path.resolve(__dirname, "../../../../../../shared/streaming/index.js")).href;
}

function providerHeaders(provider, apiKey) {
  const headers = { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` };
  if (provider.id === "openrouter") headers["X-Title"] = "Awtsmoos Tunnel Agent Council";
  return headers;
}

function maskKey(key = "") {
  const text = String(key || "");
  return text ? `${text.slice(0, 6)}...${text.slice(-4)}` : "";
}

function clean(value) { return String(value || "").trim().toLowerCase(); }
function failure(error, extra = {}) { return { ok: false, action: "aiAgent", error, ...extra }; }

module.exports = { buildAiAgentActions, PROVIDERS };
