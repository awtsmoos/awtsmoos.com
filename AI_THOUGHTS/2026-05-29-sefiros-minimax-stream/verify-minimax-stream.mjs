//B"H
import { OpenAICompatibleStreamClient } from "../../geelooy/ai/central/streamClient.js";
import { reasoningEvent, providerStreamEvent, toolCallEvent } from "../../geelooy/ai/central/providerEvents.js";

const enc = new TextEncoder();
const payloads = [
  { id: "x", object: "chat.completion.chunk", model: "MiniMax-M2.7", choices: [{ index: 0, delta: { content: "<think>Wow,", reasoning: "Wow,", role: "assistant" } }] },
  { id: "x", object: "chat.completion.chunk", model: "MiniMax-M2.7", choices: [{ index: 0, delta: { content: " thinking more", reasoning: " thinking more", role: "assistant" } }] },
  { id: "x", object: "chat.completion.chunk", model: "MiniMax-M2.7", choices: [{ index: 0, delta: { tool_calls: [{ index: 0, id: "call_1", type: "function", function: { name: "tree", arguments: "{\"p\"" } }] }, finish_reason: null }] },
  { id: "x", object: "chat.completion.chunk", model: "MiniMax-M2.7", choices: [{ index: 0, delta: { tool_calls: [{ index: 0, function: { arguments: ":\".\"}" } }] }, finish_reason: null }] },
  { id: "x", object: "chat.completion.chunk", model: "MiniMax-M2.7", choices: [{ index: 0, delta: { content: "</think>\n# Hi **there**", role: "assistant" } }] },
  { id: "x", object: "chat.completion.chunk", model: "MiniMax-M2.7", choices: [{ index: 0, delta: { content: " friend", role: "assistant" }, finish_reason: "stop" }] }
];

const lines = payloads.map(json => `data: ${JSON.stringify(json)}\n`);
const body = new ReadableStream({ start(controller) { for (const line of lines) controller.enqueue(enc.encode(line)); controller.close(); } });
const client = new OpenAICompatibleStreamClient({ provider: { id: "minimax", name: "MiniMax", endpoint: "x", defaultModel: "m", contextWindow: 1000 }, apiKey: "k", fetchImpl: async () => ({ ok: true, body }) });
const streamEvents = [];
const thoughts = [];
const tools = [];
const text = [];
const result = await client.complete({
  messages: [{ role: "user", content: "hi" }],
  stream: true,
  onEvent: event => streamEvents.push(providerStreamEvent(event, "minimax")),
  onDelta: (_delta, full) => text.push(full),
  onReasoning: (_chunk, full) => thoughts.push(reasoningEvent(full, "minimax")),
  onToolCall: items => tools.push(...items.map(item => toolCallEvent(item, "minimax")))
});

console.log(JSON.stringify({ result, thoughts: thoughts.map(e => e.text), tools: tools.map(e => e.label), text, streamEventCount: streamEvents.length }, null, 2));
if (result.text !== "# Hi **there** friend") throw new Error(`final text wrong ${result.text}`);
if (!thoughts.at(-1)?.text.includes("thinking more")) throw new Error("thinking did not grow");
if (tools.length < 2) throw new Error("partial tool calls not visible");
if (text.some(value => /<\/?think>/i.test(value))) throw new Error("think tag leaked");
if (streamEvents.length < 6) throw new Error("raw provider stream missing");
