//B"H
import { MultiPassToolAgent } from "../../geelooy/ai/central/multiPassAgent.js";
import { buildEventTimeline } from "../../geelooy/ai/js/render/runtime/eventTimeline.js";

const emitted = [];
const bridge = {
  schemas: () => [{ type: "function", function: { name: "read", parameters: { type: "object" } } }],
  call: async () => ({ ok: true, content: "result" })
};

const client = {
  rounds: 0,
  async complete(args) {
    if (this.rounds++ === 0) {
      args.onDelta?.("Let me inspect first.", "Let me inspect first.");
      args.onToolCall?.([{ id: "call_1", type: "function", function: { name: "read", arguments: "{\"p\":\".\"}" } }]);
      return { text: "Let me inspect first.", toolCalls: [{ id: "call_1", type: "function", function: { name: "read", arguments: "{\"p\":\".\"}" } }] };
    }
    args.onDelta?.("Final answer.", "Final answer.");
    return { text: "Final answer.", toolCalls: [] };
  }
};

const agent = new MultiPassToolAgent({ client, bridge, providerId: "minimax", emitEvent: event => emitted.push(event) });
const result = await agent.run({ messages: [{ role: "user", content: "go" }], stream: true });
const timeline = buildEventTimeline(emitted);
console.log(JSON.stringify({ result, emitted: emitted.map(e => ({ kind: e.kind, text: e.text, key: e.raw?.streamKey || e.raw?.tool_call_id })), timeline: timeline.map(e => ({ kind: e.kind, text: e.text, group: e.raw?.events?.map(x => x.kind) })) }, null, 2));
const shape = timeline.map(e => e.kind).join(">");
if (shape !== "thinking>tool_group") throw new Error(`bad provisional shape ${shape}`);
if (!timeline[0].text.includes("Let me inspect first")) throw new Error("pre-tool text was not converted to thought before tools");
if (result.text !== "Final answer.") throw new Error("final answer missing");
