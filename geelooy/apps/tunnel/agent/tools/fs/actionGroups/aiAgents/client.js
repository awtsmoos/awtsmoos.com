// B"H
const { providerFor, providerHeaders, providerKey } = require("./providers.js");
const { resolveAgent } = require("./registry.js");

const MAX_ATTEMPTS = 3;
const DEFAULT_TIMEOUT_MS = 45000;

/**
 * B"H
 * Chapter 370: The River Stopped Looking For A Distant Mouth.
 *
 * The installed tunnel agent lives inside ~/.awtsmoos-tunnel, far from the repo's
 * shared/streaming scroll. A real MiniMax task therefore failed before its first
 * child could breathe. This client now carries its own small SSE reader, so the
 * local delegate council can stream, finish, spawn, and be polled from the same
 * shipped vessel.
 *
 * @param {object} config Local tunnel config.
 * @param {object} payload Agent message payload.
 * @returns {Promise<object>} Provider response shaped for the action surface.
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

/**
 * Builds an OpenAI-compatible request body.
 *
 * @param {object} provider Provider definition.
 * @param {object} agentConfig Resolved agent config.
 * @param {object} payload Incoming action payload.
 * @returns {object} JSON body for the provider.
 */
function requestBody(provider, agentConfig, payload) {
  return {
    model: payload.model || agentConfig.model || provider.defaultModel,
    messages: buildMessages(agentConfig, payload),
    stream: payload.stream !== false && payload.stream !== "false",
    ...(provider.extraBody || {})
  };
}

/**
 * Sends with bounded retries.
 *
 * @param {object} config Local tunnel config.
 * @param {object} provider Provider definition.
 * @param {string} apiKey Provider key.
 * @param {object} body Request body.
 * @returns {Promise<Response>} Fetch response.
 */
async function fetchWithRetries(config, provider, apiKey, body) {
  let last;
  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    try { return await fetchOnce(config, provider, apiKey, body); }
    catch (error) { last = error; if (attempt < MAX_ATTEMPTS) await sleep(900 * attempt); }
  }
  throw last;
}

/**
 * Sends one provider request with timeout.
 *
 * @param {object} config Local tunnel config.
 * @param {object} provider Provider definition.
 * @param {string} apiKey Provider key.
 * @param {object} body Request body.
 * @returns {Promise<Response>} Fetch response.
 */
async function fetchOnce(config, provider, apiKey, body) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(new Error("provider_timeout")), providerTimeout(config));
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

/**
 * Calculates a safe provider timeout.
 *
 * @param {object} config Local tunnel config.
 * @returns {number} Timeout in milliseconds.
 */
function providerTimeout(config = {}) {
  const raw = config.aiAgents?.providerTimeoutMs || process.env.AWTSMOOS_AI_PROVIDER_TIMEOUT_MS || DEFAULT_TIMEOUT_MS;
  const value = Number(raw);
  return Number.isFinite(value) ? Math.max(5000, Math.min(300000, Math.floor(value))) : DEFAULT_TIMEOUT_MS;
}

/**
 * Builds provider messages from system, history, and prompt.
 *
 * @param {object} agentConfig Resolved agent config.
 * @param {object} payload Incoming action payload.
 * @returns {Array<{role: string, content: string}>} Provider messages.
 */
function buildMessages(agentConfig, payload) {
  const given = Array.isArray(payload.messages) ? payload.messages : [];
  const prompt = String(payload.message || payload.prompt || payload.goal || "").trim();
  const system = payload.system || agentConfig.system || defaultSystem();
  return [{ role: "system", content: system }, ...given, ...(prompt ? [{ role: "user", content: prompt }] : [])];
}

/**
 * Default delegate instruction.
 *
 * @returns {string} System prompt.
 */
function defaultSystem() {
  return [
    "You are an Awtsmoos delegate agent.",
    "Answer clearly and truthfully.",
    "When useful, propose child tasks as JSON under awtsmoos_agent_tasks.",
    "Each child task may include title, kind, prompt, agentId, provider, and fileName."
  ].join(" ");
}

/**
 * Reads an SSE streaming response without external repo imports.
 *
 * @param {Response} response Provider response.
 * @param {object} provider Provider definition.
 * @param {object} agentConfig Resolved agent config.
 * @returns {Promise<object>} Shaped response.
 */
async function readStreamingResponse(response, provider, agentConfig) {
  const parsed = await parseSse(response.body.getReader());
  return shape(provider, agentConfig, parsed.text, parsed.reasoning, parsed.toolCalls, parsed.usage, parsed.finishReason);
}

/**
 * Reads a non-streaming JSON response.
 *
 * @param {Response} response Provider response.
 * @param {object} provider Provider definition.
 * @param {object} agentConfig Resolved agent config.
 * @returns {Promise<object>} Shaped response.
 */
async function readJsonResponse(response, provider, agentConfig) {
  const json = await response.json();
  const message = json?.choices?.[0]?.message || {};
  return { ...shape(provider, agentConfig, message.content || "", message.reasoning_content || "", message.tool_calls || [], json.usage || null, null), raw: json };
}

/**
 * Parses OpenAI-style server-sent events.
 *
 * @param {ReadableStreamDefaultReader} reader Stream reader.
 * @returns {Promise<object>} Parsed text/reasoning/tool usage bundle.
 */
async function parseSse(reader) {
  const decoder = new TextDecoder();
  const state = { buffer: "", text: "", reasoning: "", toolCalls: [], usage: null, finishReason: null };
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    state.buffer += decoder.decode(value, { stream: true });
    drainSseBuffer(state);
  }
  state.buffer += decoder.decode();
  drainSseBuffer(state, true);
  return state;
}

/**
 * Drains complete SSE records from parser state.
 *
 * @param {object} state Mutable parser state.
 * @param {boolean} final Whether stream ended.
 * @returns {void}
 */
function drainSseBuffer(state, final = false) {
  const chunks = state.buffer.split(/\n\n/);
  state.buffer = final ? "" : chunks.pop() || "";
  for (const chunk of chunks) readSseChunk(state, chunk);
  if (final && chunks.length === 0 && state.buffer) readSseChunk(state, state.buffer);
}

/**
 * Reads one SSE chunk.
 *
 * @param {object} state Mutable parser state.
 * @param {string} chunk Raw chunk text.
 * @returns {void}
 */
function readSseChunk(state, chunk) {
  const lines = String(chunk || "").split(/\r?\n/).filter(line => line.startsWith("data:"));
  for (const line of lines) {
    const data = line.slice(5).trim();
    if (!data || data === "[DONE]") continue;
    readJsonDelta(state, data);
  }
}

/**
 * Reads one JSON delta safely.
 *
 * @param {object} state Mutable parser state.
 * @param {string} data JSON text.
 * @returns {void}
 */
function readJsonDelta(state, data) {
  try {
    const json = JSON.parse(data);
    const choice = json?.choices?.[0] || {};
    const delta = choice.delta || choice.message || {};
    state.text += delta.content || "";
    state.reasoning += delta.reasoning_content || delta.reasoning || "";
    if (Array.isArray(delta.tool_calls)) state.toolCalls.push(...delta.tool_calls);
    if (json.usage) state.usage = json.usage;
    if (choice.finish_reason) state.finishReason = choice.finish_reason;
  } catch (_error) {}
}

/**
 * Shapes provider output for the public action surface.
 *
 * @param {object} provider Provider definition.
 * @param {object} agentConfig Resolved agent config.
 * @param {string} text Assistant text.
 * @param {string} reasoning Assistant reasoning text, when provider sends it.
 * @param {Array} toolCalls Tool calls.
 * @param {object|null} usage Usage block.
 * @param {string|null} finishReason Finish reason.
 * @returns {object} Public response.
 */
function shape(provider, agentConfig, text, reasoning, toolCalls, usage, finishReason) {
  return { ok: true, action: "aiAgentMessage", agent: agentConfig.id, provider: provider.id, text, reasoning, toolCalls, usage, finishReason };
}

function sleep(ms) { return new Promise(resolve => setTimeout(resolve, ms)); }
function failure(error, extra = {}) { return { ok: false, action: "aiAgent", error, ...extra }; }

module.exports = { buildMessages, parseSse, providerTimeout, sendAgentMessage };
