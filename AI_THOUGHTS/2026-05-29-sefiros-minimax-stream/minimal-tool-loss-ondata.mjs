//B"H
import { readSSEStream, parseSSEBlock } from "../../geelooy/shared/streaming/index.js";
const enc = new TextEncoder();
function sse(json) { return `data: ${JSON.stringify(json)}\n\n`; }
function splitWeird(text, sizes) { const out = []; let i = 0, s = 0; while (i < text.length) { const n = sizes[s++ % sizes.length]; out.push(text.slice(i, i + n)); i += n; } return out; }
function readerFrom(chunks) { let i = 0; return { async read() { return i < chunks.length ? { done: false, value: enc.encode(chunks[i++]) } : { done: true }; } }; }
let stream = "";
for (let i=0;i<50;i++) stream += sse({ id:"long", choices:[{ delta:{ tool_calls:[{ index:0, id:"long_call", type:"function", function:{ name:"read", arguments: i===0 ? "{\"p\":\"" : i===49 ? "a.txt\"}" : "" } }] } }] });
const manualBlocks = stream.split(/\r?\n\r?\n/).filter(Boolean);
const seen = { data:0, dataTools:0, toolCallbacks:0, parseErrors:0, lastTools:null };
const result = await readSSEStream(readerFrom(splitWeird(stream, [17,31,4,4096])), "x", {
  onData: data => { seen.data++; if (data?.choices?.[0]?.delta?.tool_calls) seen.dataTools++; },
  onToolCall: tools => { seen.toolCallbacks++; seen.lastTools = tools; },
  onParseError: () => seen.parseErrors++
});
console.log(JSON.stringify({ manualBlocks: manualBlocks.length, manualErrors: manualBlocks.map(parseSSEBlock).filter(p=>p.error).length, seen, result }, null, 2));
