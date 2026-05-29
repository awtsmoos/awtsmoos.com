//B"H
import { parseSSEBlock, readSSEStream } from "../../geelooy/shared/streaming/stream-client.js";

const multi = parseSSEBlock('event: message\ndata: {"choices":[{"delta":{"content":"A"}}]}\n');
if (multi.json.choices[0].delta.content !== "A") throw new Error("single block parse failed");

const multilineJson = parseSSEBlock('data: {"choices":[{"delta":{"content":"A"}}],\ndata: "usage":null}\n');
if (multilineJson.error) throw new Error("multiline data parse failed");

const done = parseSSEBlock("data: [DONE]\n");
if (!done.done) throw new Error("DONE block not recognized");

const enc = new TextEncoder();
const blocks = [
  'event: completion\ndata: {"id":"a","choices":[{"index":0,"delta":{"content":"Hel"}}]}\n\n',
  'data: {"id":"a","choices":[{"index":0,"delta":{"content":"lo","reasoning_content":"think"}},{"index":1,"delta":{"content":"!"}}]}\n\n',
  'data: {"id":"a","choices":[{"index":0,"delta":{"tool_calls":[{"index":0,"id":"c1","type":"function","function":{"name":"read","arguments":"{\\\"p\\\""}}]}}]}\n\n',
  'data: {"id":"a","choices":[{"index":0,"delta":{"tool_calls":[{"index":0,"function":{"arguments":":\\\".\\\"}"}}]},"finish_reason":"tool_calls"}]}\n\n',
  'data: [DONE]\n\n'
];
const stream = new ReadableStream({ start(controller) {
  const joined = blocks.join("");
  controller.enqueue(enc.encode(joined.slice(0, 25)));
  controller.enqueue(enc.encode(joined.slice(25, 87)));
  controller.enqueue(enc.encode(joined.slice(87)));
  controller.close();
}});
const seen = { chunks: [], reasoning: [], tools: [], meta: [], done: 0 };
const result = await readSSEStream(stream.getReader(), "matrix", {
  onChunk: (chunk, full) => seen.chunks.push({ chunk, full }),
  onReasoning: (chunk, full) => seen.reasoning.push({ chunk, full }),
  onToolCall: tools => seen.tools.push(tools),
  onMeta: meta => seen.meta.push(meta),
  onDone: () => seen.done++
});
console.log(JSON.stringify({ result, seen }, null, 2));
if (result.text !== "Hello!") throw new Error(`wrong text ${result.text}`);
if (result.reasoning !== "think") throw new Error("reasoning missing");
if (result.tools[0].function.arguments !== '{"p":"."}') throw new Error("tool args not assembled");
if (result.finishReason !== "tool_calls") throw new Error("finish reason missing");
if (seen.done !== 1) throw new Error("DONE not surfaced");
