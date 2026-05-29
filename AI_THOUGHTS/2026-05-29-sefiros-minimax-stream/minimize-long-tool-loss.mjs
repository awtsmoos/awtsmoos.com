//B"H
import { readSSEStream } from "../../geelooy/shared/streaming/index.js";
import { parseSseChunk } from "../../geelooy/ai/js/render/worker/sseParser.js";
import { packetsToDeltas } from "../../geelooy/ai/js/render/worker/streamDelta.js";
import { MultiPassToolAgent } from "../../geelooy/ai/central/multiPassAgent.js";
import { normalizeNextStepIntent, NEXT_STEP_TOOL_NAME } from "../../geelooy/ai/central/nextStepTool.js";
const enc = new TextEncoder();
function sse(json) { return `data: ${JSON.stringify(json)}\n\n`; }
function splitWeird(text, sizes) { const out = []; let i = 0, s = 0; while (i < text.length) { const n = sizes[s++ % sizes.length]; out.push(text.slice(i, i + n)); i += n; } return out; }
function readerFrom(chunks) { let i = 0; return { async read() { return i < chunks.length ? { done: false, value: enc.encode(chunks[i++]) } : { done: true }; } }; }
async function long(label) { let stream = ""; for (let i=0;i<1000;i++) stream += sse({ id: "long", choices: [{ delta: { content: `x${i} ` } }] }); for (let i=0;i<50;i++) stream += sse({ id: "long", choices: [{ delta: { tool_calls: [{ index: 0, id: "long_call", type: "function", function: { name: "read", arguments: i===0 ? "{\"p\":\"" : i===49 ? "a.txt\"}" : "" } }] } }] }); const result = await readSSEStream(readerFrom(splitWeird(stream, [17,31,4,4096])), label, {}); console.log(label, result.tools.length, result.tools[0]?.function?.arguments); }
async function shared() { const frames = [sse({ id:"s1", choices:[{ delta:{ tool_calls:[{ index:0, id:"call_a", type:"function", function:{ name:"read", arguments:"{\"p\":" } }] } }] }), sse({ id:"s1", choices:[{ delta:{ tool_calls:[{ index:0, function:{ arguments:"\"x.txt\"}" } }] } }] })].join(""); await readSSEStream(readerFrom(splitWeird(frames, [1,7,13,2,29,5,101])), "stress", {}); }
async function worker() { const session = `s-${Date.now()}`; const payload = sse({id:"w",choices:[{delta:{content:"<think>a"}}]}) + sse({id:"w",choices:[{delta:{content:"</think>b"}}]}); const chunks = splitWeird(payload,[3,11,19]); packetsToDeltas(chunks.flatMap((c,i)=>parseSseChunk(session,c,i===chunks.length-1))); }
async function nextStep() { const bridge={schemas:()=>[], async call(name,args){return {ok:true,nextStep:normalizeNextStepIntent(args)}}}; const client={round:0, async complete(){this.round++; return this.round===1 ? {text:"", toolCalls:[{id:"n", type:"function", function:{name:NEXT_STEP_TOOL_NAME, arguments:JSON.stringify({needed:true})}}]} : {text:"final", toolCalls:[]};}}; await new MultiPassToolAgent({client, bridge}).run({messages:[{role:"user", content:"go"}]}); }
await long("before");
await shared(); await long("after-shared");
await worker(); await long("after-worker");
await nextStep(); await long("after-nextstep");
