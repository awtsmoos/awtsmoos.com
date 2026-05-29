//B"H
import { readSSEStream } from "../../geelooy/shared/streaming/index.js";
import { parseSseChunk } from "../../geelooy/ai/js/render/worker/sseParser.js";
import { packetsToDeltas } from "../../geelooy/ai/js/render/worker/streamDelta.js";

const enc = new TextEncoder();
const seed = Number(process.env.AWT_FUZZ_SEED || 7701);
const runs = Number(process.env.AWT_FUZZ_RUNS || 160);
const rand = mulberry32(seed);

for (let i = 0; i < runs; i++) await fuzzOne(i);
console.log(JSON.stringify({ ok: true, fuzz: "streaming-tools", seed, runs }, null, 2));

async function fuzzOne(run) {
  const toolCount = int(1, 6);
  const textCount = int(0, 80);
  const reasoningCount = int(0, 8);
  const frames = [];
  const expectedText = [];
  const expectedReasoning = [];
  const expectedTools = [];
  for (let i = 0; i < reasoningCount; i++) {
    const text = `r${run}_${i} `;
    expectedReasoning.push(text);
    frames.push(sse({ id: `f${run}`, choices: [{ delta: pick([{ reasoning: text }, { reasoning_content: text }, { thinking: text }]) }] }));
  }
  if (chance(.4)) {
    frames.push(sse({ id: `f${run}`, choices: [{ delta: { content: `<think>inline-${run}` } }] }));
    frames.push(sse({ id: `f${run}`, choices: [{ delta: { content: `-closed</think>` } }] }));
  }
  for (let i = 0; i < textCount; i++) {
    const text = `t${i} `;
    expectedText.push(text);
    frames.push(sse({ id: `f${run}`, choices: [{ delta: { content: text } }] }));
  }
  for (let t = 0; t < toolCount; t++) {
    const name = pick(["read", "tree", "write", "simulateRuntime"]);
    const args = JSON.stringify({ p: `file-${run}-${t}.js`, content: t % 2 ? "BH" : undefined }).replace(/,"content":undefined/, "");
    expectedTools.push({ id: `call_${run}_${t}`, name, args });
    const pieces = splitRandomString(args, int(2, 8));
    pieces.forEach((piece, index) => frames.push(sse({ id: `f${run}`, choices: [{ delta: { tool_calls: [{ index: t, id: `call_${run}_${t}`, type: "function", function: { name: index === 0 ? name : undefined, arguments: piece } }] } }] })));
    if (chance(.3)) frames.push(sse({ id: `f${run}`, choices: [{ delta: { tool_calls: [{ index: t, id: `call_${run}_${t}`, type: "function", function: { name, arguments: "" } }] } }] }));
  }
  const finalText = `final-${run}`;
  expectedText.push(finalText);
  frames.push(sse({ id: `f${run}`, choices: [{ finish_reason: "stop", delta: { content: finalText } }], usage: { prompt_tokens: 1, completion_tokens: 2, total_tokens: 3 } }));
  if (chance(.7)) frames.push(sse({ id: `f${run}`, choices: [{ finish_reason: "stop", delta: { content: "" } }] }));
  if (chance(.6)) frames.push("data: [DONE]\n\n");
  const stream = maybeCrlf(shuffleFramesSometimes(frames).join(""));
  const chunks = splitRandomString(stream, int(2, Math.min(240, Math.max(3, stream.length))));
  const seen = { data: 0, errors: 0, toolCallbacks: 0 };
  const result = await readSSEStream(readerFrom(chunks), `fuzz-${run}`, {
    onData: () => seen.data++,
    onParseError: () => seen.errors++,
    onToolCall: () => seen.toolCallbacks++
  });
  const visible = expectedText.join("");
  assert(result.text.includes(finalText), `run ${run}: final text missing`);
  assert(result.text.length >= visible.length, `run ${run}: text too short`);
  assert(result.tools.length === toolCount, `run ${run}: expected ${toolCount} tools got ${result.tools.length}`);
  for (const expected of expectedTools) {
    const tool = result.tools.find(t => t.id === expected.id);
    assert(tool, `run ${run}: missing tool ${expected.id}`);
    assert(tool.function.name === expected.name, `run ${run}: wrong name for ${expected.id}`);
    assert(tool.function.arguments === expected.args, `run ${run}: wrong args for ${expected.id}: ${tool.function.arguments}`);
  }
  assert(seen.errors === 0, `run ${run}: parse errors ${seen.errors}`);
  fuzzWorker(run, frames);
}

function fuzzWorker(run, frames) {
  const session = `worker-${run}-${rand()}`;
  const text = frames.join("");
  const chunks = splitRandomString(text, int(2, Math.min(80, Math.max(3, text.length))));
  const packets = chunks.flatMap((chunk, index) => parseSseChunk(session, chunk, index === chunks.length - 1));
  const deltas = packetsToDeltas(packets);
  assert(deltas.some(delta => delta.kind === "text") || deltas.some(delta => delta.kind === "event"), `run ${run}: worker produced no deltas`);
}

function sse(json) { return `data: ${JSON.stringify(json)}\n\n`; }
function readerFrom(chunks) { let i = 0; return { async read() { return i < chunks.length ? { done: false, value: enc.encode(chunks[i++]) } : { done: true }; } }; }
function splitRandomString(text, count) {
  const points = new Set([0, text.length]);
  while (points.size < count + 1) points.add(int(0, text.length));
  const sorted = [...points].sort((a, b) => a - b);
  return sorted.slice(0, -1).map((start, i) => text.slice(start, sorted[i + 1])).filter(part => part.length || chance(.1));
}
function shuffleFramesSometimes(frames) { return chance(.15) ? stableToolAwareShuffle(frames) : frames; }
function stableToolAwareShuffle(frames) { return frames.slice(0, -2).concat(frames.slice(-2)); }
function maybeCrlf(text) { return chance(.35) ? text.replace(/\n/g, "\r\n") : text; }
function int(min, max) { return Math.floor(rand() * (max - min + 1)) + min; }
function chance(p) { return rand() < p; }
function pick(items) { return items[int(0, items.length - 1)]; }
function assert(condition, message) { if (!condition) throw new Error(message); }
function mulberry32(a) { return function() { let t = a += 0x6D2B79F5; t = Math.imul(t ^ t >>> 15, t | 1); t ^= t + Math.imul(t ^ t >>> 7, t | 61); return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
