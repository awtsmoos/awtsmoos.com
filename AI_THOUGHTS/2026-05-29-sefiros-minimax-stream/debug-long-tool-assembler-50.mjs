//B"H
import { readSSEStream } from "../../geelooy/shared/streaming/index.js";
const enc = new TextEncoder();
function sse(json) { return `data: ${JSON.stringify(json)}\n\n`; }
function splitWeird(text, sizes) { const out = []; let i = 0, s = 0; while (i < text.length) { const n = sizes[s++ % sizes.length]; out.push(text.slice(i, i + n)); i += n; } return out; }
function readerFrom(chunks) { let i = 0; return { async read() { return i < chunks.length ? { done: false, value: enc.encode(chunks[i++]) } : { done: true }; } }; }
let stream = "";
for (let i = 0; i < 1000; i++) stream += sse({ id: "long", choices: [{ delta: { content: `x${i} ` } }] });
for (let i = 0; i < 50; i++) stream += sse({ id: "long", choices: [{ delta: { tool_calls: [{ index: 0, id: "long_call", type: "function", function: { name: "read", arguments: i === 0 ? "{\"p\":\"" : i === 49 ? "a.txt\"}" : "" } }] } }] });
const result = await readSSEStream(readerFrom(splitWeird(stream, [17, 31, 4, 4096])), "long", {});
console.log(JSON.stringify({ textLength: result.text.length, toolCount: result.tools.length, tools: result.tools }, null, 2));
