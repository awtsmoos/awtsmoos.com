//B"H
import { readSSEStream } from "../../geelooy/shared/streaming/index.js";
const enc = new TextEncoder();
function sse(json) { return `data: ${JSON.stringify(json)}\n\n`; }
function splitWeird(text, sizes) { const out = []; let i = 0, s = 0; while (i < text.length) { const n = sizes[s++ % sizes.length]; out.push(text.slice(i, i + n)); i += n; } return out; }
function readerFrom(chunks) { let i = 0; return { async read() { return i < chunks.length ? { done: false, value: enc.encode(chunks[i++]) } : { done: true }; } }; }
function streamWith(nText, nTools) { let stream = ""; for (let i=0;i<nText;i++) stream += sse({ id:"long", choices:[{ delta:{ content:`x${i} ` } }] }); for (let i=0;i<nTools;i++) stream += sse({ id:"long", choices:[{ delta:{ tool_calls:[{ index:0, id:"long_call", type:"function", function:{ name:"read", arguments: i===0 ? "{\"p\":\"" : i===nTools-1 ? "a.txt\"}" : "" } }] } }] }); return stream; }
for (const providerId of ["long", "before", "long-x"]) {
  for (const nText of [0, 1, 10, 1000]) {
    const result = await readSSEStream(readerFrom(splitWeird(streamWith(nText, 50), [17,31,4,4096])), providerId, {});
    console.log(JSON.stringify({ providerId, nText, count: result.tools.length, args: result.tools[0]?.function?.arguments }));
  }
}
