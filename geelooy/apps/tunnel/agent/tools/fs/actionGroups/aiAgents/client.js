// B"H
const path = require("path");
const { pathToFileURL } = require("url");
const { providerFor, providerHeaders, providerKey } = require("./providers.js");
const { resolveAgent } = require("./registry.js");

const MAX_ATTEMPTS = 3;
const DEFAULT_TIMEOUT_MS = 45000;

/**
 * B"H
 * Chapter 369: The River Received A Shoreline.
 *
 * A delegate may wait, but it may not vanish into endless water. Each provider
 * call now has an AbortController boundary, so the agent forest can fail,
 * report, retry, and continue instead of hanging in a nameless dark.
 */
async function sendAgentMessage(config = {}, payload = {}) {
  const agentConfig = resolveAgent(config, payload.agentId || payload.agent || "openrouter-general");
  const provider = providerFor(payload.provider || agentConfig.provider);
  const apiKey = providerKey(config, provider.id);
  if (!apiKey) return failure("missing_provider_key", { provider: provider.id, actionHint: "aiAgentSetProviderKey" });
  const body = requestBody(provider, agentConfig, payload);
  const response = await fetchWithRetries(config, provider, apiKey, body);
  if (!response.ok) return failure("provider_error", { provider: provider.id, status: response.status, body: await response.text().catch(() => response.statusText) });
  return body.stream && response.body ? readStreamingResponse(response, provider, agentConfig) : readJsonResponse(response, provider, agentConfig);
}

function requestBody(provider, agentConfig, payload) {
  return { model: payload.model || agentConfig.model || provider.defaultModel, messages: buildMessages(agentConfig, payload), stream: payload.stream !== false, ...(provider.extraBody || {}) };
}

async function fetchWithRetries(config, provider, apiKey, body) {
  let last;
  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    try { return await fetchOnce(config, provider, apiKey, body); }
    catch (error) { last = error; if (attempt < MAX_ATTEMPTS) await sleep(900 * attempt); }
  }
  throw last;
}

async function fetchOnce(config, provider, apiKey, body) {
  const timeoutMs = providerTimeout(config);
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(new Error("provider_timeout")), timeoutMs);
  try {
    return await fetch(provider.endpoint, {
      method: "POST",
      headers: providerHeaders(provider, apiKey),
      body: JSON.stringify(body),
      signal: controller.signal
    });
  } finally {
    clearTimeout(timer);
  }
}

function providerTimeout(config = {}) {
  const raw = config.aiAgents?.providerTimeoutMs || process.env.AWTSMOOS_AI_PROVIDER_TIMEOUT_MS || DEFAULT_TIMEOUT_MS;
  const value = Number(raw);
  return Number.isFinite(value) ? Math.max(5000, Math.min(300000, Math.floor(value))) : DEFAULT_TIMEOUT_MS;
}

function buildMessages(agentConfig, payload) {
  const given = Array.isArray(payload.messages) ? payload.messages : [];
  const prompt = String(payload.message || payload.prompt || "").trim();
  const system = payload.system || agentConfig.system || defaultSystem();
  return [{ role: "system", content: system }, ...given, ...(prompt ? [{ role: "user", content: prompt }] : [])];
}

function defaultSystem() {
  return ["You are an Awtsmoos delegate agent.", "Answer clearly and truthfully.", "When useful, propose child tasks as JSON under awtsmoos_agent_tasks.", "Each child task may include title, kind, prompt, agentId, provider, and fileName."].join(" ");
}

async function readStreamingResponse(response, provider, agentConfig) {
  const { readSSEStream } = await import(sharedStreamingUrl());
  const result = await readSSEStream(response.body.getReader(), provider.id, {});
  return shape(provider, agentConfig, result.text || "", result.reasoning || "", result.tools || [], result.usage || null, result.finishReason || null);
}

async function readJsonResponse(response, provider, agentConfig) {
  const json = await response.json();
  const message = json?.choices?.[0]?.message || {};
  return { ...shape(provider, agentConfig, message.content || "", "", message.tool_calls || [], json.usage || null, null), raw: json };
}

function shape(provider, agentConfig, text, reasoning, toolCalls, usage, finishReason) {
  return { ok: true, action: "aiAgentMessage", agent: agentConfig.id, provider: provider.id, text, reasoning, toolCalls, usage, finishReason };
}

function sharedStreamingUrl() { return pathToFileURL(path.resolve(__dirname, "../../../../../../../shared/streaming/index.js")).href; }
function sleep(ms) { return new Promise(resolve => setTimeout(resolve, ms)); }
function failure(error, extra = {}) { return { ok: false, action: "aiAgent", error, ...extra }; }

module.exports = { buildMessages, providerTimeout, sendAgentMessage };
