//B"H
import { parseSseChunk } from "../../geelooy/ai/js/render/worker/sseParser.js";
import { packetsToDeltas } from "../../geelooy/ai/js/render/worker/streamDelta.js";
function sse(json) { return `data: ${JSON.stringify(json)}\n\n`; }
function splitWeird(text, sizes) { const out = []; let i = 0, s = 0; while (i < text.length) { const n = sizes[s++ % sizes.length]; out.push(text.slice(i, i + n)); i += n; } return out; }
const session = `stress-debug-${Date.now()}`;
const payload = [
  sse({ id: "w1", choices: [{ delta: { content: "<think>alpha" } }] }),
  sse({ id: "w1", choices: [{ delta: { content: " beta</think>Hello" } }] }),
  sse({ id: "w1", choices: [{ delta: { reasoning_content: " gamma" } }] }),
  sse({ id: "w1", choices: [{ delta: { tool_calls: [{ id: "t1", type: "function", function: { name: "tree", arguments: "{}" } }] } }] }),
  sse({ id: "w1", choices: [{ finish_reason: "stop", delta: { content: " final" } }] }),
  sse({ id: "w1", choices: [{ finish_reason: "stop", delta: { content: "" } }] })
].join("");
const chunks = splitWeird(payload, [3, 11, 19, 2000]);
const packets = chunks.flatMap((chunk, index, all) => parseSseChunk(session, chunk, index === all.length - 1));
const deltas = packetsToDeltas(packets);
console.log(JSON.stringify({ chunks, packets, deltas }, null, 2));
