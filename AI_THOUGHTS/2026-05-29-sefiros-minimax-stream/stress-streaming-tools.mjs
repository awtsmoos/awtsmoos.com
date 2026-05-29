//B"H
import { readSSEStream } from "../../geelooy/shared/streaming/index.js";
import { parseSseChunk } from "../../geelooy/ai/js/render/worker/sseParser.js";
import { packetsToDeltas } from "../../geelooy/ai/js/render/worker/streamDelta.js";
import { buildEventTimeline } from "../../geelooy/ai/js/render/runtime/eventTimeline.js";
import { reasoningEvent, toolCallEvent, toolResultEvent } from "../../geelooy/ai/central/providerEvents.js";
import { MultiPassToolAgent } from "../../geelooy/ai/central/multiPassAgent.js";
import { normalizeNextStepIntent, NEXT_STEP_TOOL_NAME } from "../../geelooy/ai/central/nextStepTool.js";

const enc = new TextEncoder();

await testSharedSseTorture();
await testWorkerParserAndDeltas();
await testTimelineTorture();
await testNextStepRaceSemantics();
await testLongStreamMemoryShape();
console.log(JSON.stringify({ ok: true, stress: "streaming-tools", cases: 5 }, null, 2));

async function testSharedSseTorture() {
  const frames = [
    sse({ id: "s1", choices: [{ delta: { reasoning: "think-1 " } }] }),
    sse({ id: "s1", choices: [{ delta: { content: "<think>inline " } }] }),
    sse({ id: "s1", choices: [{ delta: { content: "thought</think>Visible **md** " } }] }),
    sse({ id: "s1", choices: [{ delta: { tool_calls: [{ index: 0, id: "call_a", type: "function", function: { name: "read", arguments: "{\"p\":" } }] } }] }),
    sse({ id: "s1", choices: [{ delta: { tool_calls: [{ index: 0, function: { arguments: "\"x.txt\"}" } }] } }] }),
    "data: " + JSON.stringify({ id: "s1", choices: [{ finish_reason: "stop", delta: { content: "done" } }], usage: { prompt_tokens: 2, completion_tokens: 3, total_tokens: 5 } }) + "\r\n\r\n",
    "data: [DONE]\n\n"
  ].join("");
  const got = { text: "", reasoning: "", tools: [], done: 0 };
  const result = await readSSEStream(readerFrom(splitWeird(frames, [1, 7, 13, 2, 29, 5, 101])), "stress", {
    onChunk: (_chunk, full) => { got.text = full; },
    onReasoning: (_chunk, full) => { got.reasoning = full; },
    onToolCall: tools => { got.tools = tools; },
    onDone: () => got.done++
  });
  assert(got.reasoning === "think-1 ", "explicit reasoning should accumulate");
  assert(got.text.includes("Visible **md** done"), "visible text should survive split think stream");
  assert(result.tools[0]?.function?.arguments === "{\"p\":\"x.txt\"}", "tool args should assemble across chunks");
  assert(got.done === 1, "DONE should fire once");
}

async function testWorkerParserAndDeltas() {
  const session = `stress-${Date.now()}-${Math.random()}`;
  const payload = [
    sse({ id: "w1", choices: [{ delta: { content: "<think>alpha" } }] }),
    sse({ id: "w1", choices: [{ delta: { content: " beta</think>Hello" } }] }),
    sse({ id: "w1", choices: [{ delta: { reasoning_content: " gamma" } }] }),
    sse({ id: "w1", choices: [{ delta: { tool_calls: [{ id: "t1", type: "function", function: { name: "tree", arguments: "{}" } }] } }] }),
    sse({ id: "w1", choices: [{ finish_reason: "stop", delta: { content: " final" } }] }),
    sse({ id: "w1", choices: [{ finish_reason: "stop", delta: { content: "" } }] })
  ].join("");
  const chunks = splitWeird(payload, [3, 11, 19, 2000]);
  const packets = chunks.flatMap((chunk, index) => parseSseChunk(session, chunk, index === chunks.length - 1));
  const deltas = packetsToDeltas(packets);
  const text = deltas.filter(d => d.kind === "text").map(d => d.text).join("");
  const thoughts = deltas.filter(d => d.kind === "event" && d.event.kind === "thinking").map(d => d.event.text).join("|");
  const tools = deltas.filter(d => d.kind === "event" && /tool/i.test(d.event.kind));
  assert(text === "Hello final", `worker text mismatch: ${text}`);
  assert(/alpha/.test(thoughts) && /beta/.test(thoughts) && /gamma/.test(thoughts), `worker thoughts missing: ${thoughts}`);
  assert(tools.length === 1, "provider tool delta should appear once as event");
}

async function testTimelineTorture() {
  const events = [reasoningEvent("Thought A", "stress", "a"), toolCallEvent({ id: "x", type: "function", function: { name: "read", arguments: "{\"p\":" } }, "stress"), toolCallEvent({ id: "x", type: "function", function: { name: "read", arguments: "{\"p\":\"a\"}" } }, "stress"), toolResultEvent({ id: "x", name: "read" }, { ok: true, content: "A" }, "stress"), reasoningEvent("Thought B", "stress", "b"), toolCallEvent({ id: "y", type: "function", function: { name: "write", arguments: "{\"p\":\"b\",\"content\":\"B\"}" } }, "stress"), toolCallEvent({ id: "z", type: "function", function: { name: "tree", arguments: "{}" } }, "stress"), toolResultEvent({ id: "z", name: "tree" }, { ok: true }, "stress"), toolResultEvent({ id: "y", name: "write" }, { ok: true }, "stress")];
  const timeline = buildEventTimeline(events);
  const shape = timeline.map(e => e.kind).join(">");
  assert(shape === "thinking>tool_group>thinking>tool_group", `timeline shape ${shape}`);
  assert(timeline[1].raw.events.filter(e => e.kind === "tool_call").length === 1, "duplicate partial/final call should collapse");
  assert(/2 tool/.test(timeline[3].text), "second group should count two unique tools");
}

async function testNextStepRaceSemantics() {
  const bridge = { schemas: () => [], async call(name, args) { if (name !== NEXT_STEP_TOOL_NAME) throw new Error("unexpected tool"); return { ok: true, action: name, virtual: true, nextStep: normalizeNextStepIntent(args) }; } };
  const client = { round: 0, async complete() { this.round++; if (this.round === 1) return { text: "", toolCalls: [{ id: "n", type: "function", function: { name: NEXT_STEP_TOOL_NAME, arguments: JSON.stringify({ needed: true, prompt: "continue stress" }) } }] }; return { text: "final", toolCalls: [] }; } };
  const result = await new MultiPassToolAgent({ client, bridge, providerId: "stress" }).run({ messages: [{ role: "user", content: "go" }] });
  assert(result.text === "final", "next step final missing");
  assert(result.nextStep?.prompt === "continue stress", "next step prompt missing");
}

async function testLongStreamMemoryShape() {
  let stream = "";
  for (let i = 0; i < 1000; i++) stream += sse({ id: "long", choices: [{ delta: { content: `x${i} ` } }] });
  for (let i = 0; i < 50; i++) stream += sse({ id: "long", choices: [{ delta: { tool_calls: [{ index: 0, id: "long_call", type: "function", function: { name: "read", arguments: i === 0 ? "{\"p\":\"" : i === 49 ? "a.txt\"}" : "" } }] } }] });
  const result = await readSSEStream(readerFrom(splitWeird(stream, [17, 31, 4, 4096])), `long-${Date.now()}-${Math.random()}`, {});
  assert(result.text.startsWith("x0 x1") && result.text.includes("x999"), "long stream text incomplete");
  assert(result.tools.length === 1, `long stream should keep one assembled tool slot, got ${result.tools.length}: ${JSON.stringify(result.tools)}`);
  assert(result.tools[0].function.arguments === "{\"p\":\"a.txt\"}", `long stream tool args wrong: ${JSON.stringify(result.tools)}`);
}

function sse(json) { return `data: ${JSON.stringify(json)}\n\n`; }
function splitWeird(text, sizes) { const out = []; let i = 0, s = 0; while (i < text.length) { const n = sizes[s++ % sizes.length]; out.push(text.slice(i, i + n)); i += n; } return out; }
function readerFrom(chunks) { let i = 0; return { async read() { return i < chunks.length ? { done: false, value: enc.encode(chunks[i++]) } : { done: true }; } }; }
function assert(condition, message) { if (!condition) throw new Error(message); }
