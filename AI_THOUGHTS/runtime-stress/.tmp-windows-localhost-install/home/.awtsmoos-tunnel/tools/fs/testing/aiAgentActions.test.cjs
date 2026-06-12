// B"H
const fs = require("fs");
const { ReadableStream } = require("stream/web");
const { buildActions } = require("../actions.js");
const { loadConfig, saveConfigPatch, CONFIG_PATH } = require("../../../lib/config.js");

const originalConfigText = fs.existsSync(CONFIG_PATH) ? fs.readFileSync(CONFIG_PATH, "utf8") : "";
const originalFetch = global.fetch;
const tests = [];
let lastRequest = null;

/**
 * B"H
 * Chapter 342: Twelve Gates Were Cut For A Council That Keeps Going.
 *
 * The Awtsmoos lets the delegate river flow by chunks, by retries, by long
 * streaming continuance, by provider errors, by custom agents, and by repeated
 * calls. These tests mock the model sky but force the true action map, config
 * serializer, key masker, JSON response path, and shared SSE stream parser to
 * move together as one living vessel.
 */
function test(name, fn) { tests.push({ name, fn }); }
function assert(value, message) { if (!value) throw new Error(message); }
function action(payload) { return buildActions(loadConfig(), payload, null)[payload.action](); }
function resetAiAgents() { lastRequest = null; global.fetch = originalFetch; saveConfigPatch({ aiAgents: { agents: [], providerKeys: {} } }); }

function mockJsonFetch(body) {
  global.fetch = async (_url, request) => {
    lastRequest = request;
    return { ok: true, status: 200, request, json: async () => body, text: async () => JSON.stringify(body) };
  };
}

function mockProviderError(status, body) {
  global.fetch = async (_url, request) => {
    lastRequest = request;
    return { ok: false, status, request, text: async () => body };
  };
}

function mockSseFetch(chunks) {
  global.fetch = async (_url, request) => {
    lastRequest = request;
    return {
      ok: true,
      status: 200,
      request,
      body: new ReadableStream({ start(controller) { for (const chunk of chunks) controller.enqueue(Buffer.from(chunk)); controller.close(); } }),
      text: async () => chunks.join(""),
      json: async () => ({})
    };
  };
}

function sseContent(content, finish = null) {
  const choice = { delta: { content } };
  if (finish) choice.finish_reason = finish;
  return "data: " + JSON.stringify({ choices: [choice] }) + "\n\n";
}

test("lists default delegate agents", async () => {
  resetAiAgents();
  const got = await action({ action: "aiAgentList" });
  assert(got.ok, "aiAgentList should succeed");
  assert(got.agents.some(x => x.id === "openrouter-general"), "openrouter default missing");
  assert(got.agents.some(x => x.id === "minimax-deep"), "minimax default missing");
});

test("missing provider key returns guided failure", async () => {
  resetAiAgents();
  const got = await action({ action: "aiAgentMessage", agentId: "minimax-deep", message: "ping" });
  assert(got.ok === false, "message without key should fail");
  assert(got.error === "missing_provider_key", "missing key error shape wrong");
  assert(got.actionHint === "aiAgentSetProviderKey", "missing key hint wrong");
});

test("set provider key masks secret and marks agent ready", async () => {
  resetAiAgents();
  const secret = "sk-test-very-secret-value";
  const set = await action({ action: "aiAgentSetProviderKey", provider: "minimax", apiKey: secret });
  assert(set.ok, "set key failed");
  assert(!JSON.stringify(set.providers).includes(secret), "raw key leaked in response");
  const list = await action({ action: "aiAgentList" });
  assert(list.agents.some(x => x.id === "minimax-deep" && x.ready), "minimax not ready");
});

test("remove provider key makes delegate unready", async () => {
  resetAiAgents();
  await action({ action: "aiAgentSetProviderKey", provider: "minimax", apiKey: "sk-test-remove" });
  const removed = await action({ action: "aiAgentRemoveProviderKey", provider: "minimax" });
  assert(removed.ok, "remove key failed");
  const list = await action({ action: "aiAgentList" });
  assert(list.agents.some(x => x.id === "minimax-deep" && !x.ready), "minimax stayed ready");
});

test("unknown provider is rejected before config mutation", async () => {
  resetAiAgents();
  const got = await action({ action: "aiAgentSetProviderKey", provider: "not-real", apiKey: "sk-nope" });
  assert(got.ok === false, "unknown provider should fail");
  assert(got.error === "unknown_provider", "unknown provider error wrong");
});

test("non-stream message uses OpenAI-compatible JSON response", async () => {
  resetAiAgents();
  await action({ action: "aiAgentSetProviderKey", provider: "minimax", apiKey: "sk-json" });
  mockJsonFetch({ choices: [{ message: { content: "json delegate works", tool_calls: [{ id: "t1" }] } }], usage: { total_tokens: 9 } });
  const got = await action({ action: "aiAgentMessage", agentId: "minimax-deep", stream: false, message: "hello" });
  assert(got.ok, "json message failed");
  assert(got.text === "json delegate works", "json text wrong");
  assert(got.toolCalls.length === 1, "tool calls missing");
  assert(got.usage.total_tokens === 9, "usage missing");
});

test("stream message uses shared SSE parser", async () => {
  resetAiAgents();
  await action({ action: "aiAgentSetProviderKey", provider: "minimax", apiKey: "sk-stream" });
  mockSseFetch([sseContent("stream "), sseContent("delegate", "stop"), "data: [DONE]\n\n"]);
  const got = await action({ action: "aiAgentMessage", agentId: "minimax-deep", stream: true, message: "hello" });
  assert(got.ok, "stream message failed");
  assert(got.text === "stream delegate", "stream text wrong: " + got.text);
  assert(got.finishReason === "stop", "finish reason missing");
});

test("custom configured agent overrides provider and model", async () => {
  resetAiAgents();
  saveConfigPatch({ aiAgents: { agents: [{ id: "critic", name: "Critic", provider: "openrouter", model: "openrouter/custom", system: "Be brief." }], providerKeys: { openrouter: "sk-custom" } } });
  const list = await action({ action: "aiAgentList" });
  assert(list.agents.some(x => x.id === "critic" && x.model === "openrouter/custom" && x.ready), "custom agent not listed ready");
  mockJsonFetch({ choices: [{ message: { content: "critic works" } }] });
  const got = await action({ action: "aiAgentMessage", agentId: "critic", stream: false, message: "check" });
  assert(got.ok && got.provider === "openrouter", "custom agent provider failed");
  assert(got.text === "critic works", "custom agent response wrong");
});

test("long stream can keep accumulating many chunks", async () => {
  resetAiAgents();
  await action({ action: "aiAgentSetProviderKey", provider: "minimax", apiKey: "sk-long" });
  const pieces = Array.from({ length: 64 }, (_, i) => String(i % 10));
  mockSseFetch([...pieces.map(x => sseContent(x)), sseContent("!", "stop"), "data: [DONE]\n\n"]);
  const got = await action({ action: "aiAgentMessage", agentId: "minimax-deep", stream: true, message: "go long" });
  assert(got.ok, "long stream failed");
  assert(got.text === pieces.join("") + "!", "long stream accumulation wrong");
});

test("sequential delegate calls keep going without state poisoning", async () => {
  resetAiAgents();
  await action({ action: "aiAgentSetProviderKey", provider: "minimax", apiKey: "sk-seq" });
  mockJsonFetch({ choices: [{ message: { content: "first" } }] });
  const first = await action({ action: "aiAgentMessage", agentId: "minimax-deep", stream: false, message: "one" });
  mockJsonFetch({ choices: [{ message: { content: "second" } }] });
  const second = await action({ action: "aiAgentMessage", agentId: "minimax-deep", stream: false, message: "two" });
  assert(first.text === "first" && second.text === "second", "sequential responses crossed wires");
});

test("provider errors return safe diagnostic shape", async () => {
  resetAiAgents();
  await action({ action: "aiAgentSetProviderKey", provider: "minimax", apiKey: "sk-error" });
  mockProviderError(429, "rate limited without key echo");
  const got = await action({ action: "aiAgentMessage", agentId: "minimax-deep", stream: false, message: "fail" });
  assert(got.ok === false, "provider error should fail");
  assert(got.error === "provider_error", "provider error shape wrong");
  assert(got.status === 429, "provider status missing");
});

test("request body carries system, user message, model, and stream flag", async () => {
  resetAiAgents();
  await action({ action: "aiAgentSetProviderKey", provider: "minimax", apiKey: "sk-body" });
  mockJsonFetch({ choices: [{ message: { content: "body works" } }] });
  const got = await action({ action: "aiAgentMessage", agentId: "minimax-deep", model: "MiniMax-Test", system: "System spark", message: "User spark", stream: false });
  const body = JSON.parse(lastRequest.body);
  assert(got.ok, "body request failed");
  assert(body.model === "MiniMax-Test", "model override missing");
  assert(body.stream === false, "stream flag missing");
  assert(body.messages[0].role === "system" && body.messages[0].content === "System spark", "system message missing");
  assert(body.messages.some(x => x.role === "user" && x.content === "User spark"), "user message missing");
});

async function run() {
  let passed = 0;
  for (const t of tests) {
    try {
      await t.fn();
      console.log("PASS", t.name);
      passed++;
    } catch (e) {
      console.error("FAIL", t.name, e.stack || e.message);
      process.exitCode = 1;
      break;
    }
  }
  console.log(JSON.stringify({ passed, total: tests.length }));
}

run().finally(() => {
  global.fetch = originalFetch;
  if (originalConfigText) fs.writeFileSync(CONFIG_PATH, originalConfigText, "utf8");
});
