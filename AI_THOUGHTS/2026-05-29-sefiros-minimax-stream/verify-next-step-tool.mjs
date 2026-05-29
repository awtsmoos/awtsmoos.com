//B"H
import { MultiPassToolAgent } from "../../geelooy/ai/central/multiPassAgent.js";
import { makeBridgeToolSchemas } from "../../geelooy/ai/central/toolSchemas.js";
import { NEXT_STEP_TOOL_NAME, normalizeNextStepIntent } from "../../geelooy/ai/central/nextStepTool.js";

const schemas = makeBridgeToolSchemas(["read"], ["read", "write"]);
if (!schemas.some(schema => schema.function?.name === NEXT_STEP_TOOL_NAME)) throw new Error("next-step tool is not exposed directly");

const emitted = [];
const bridge = {
  schemas: () => schemas,
  async call(name, args) {
    if (name !== NEXT_STEP_TOOL_NAME) throw new Error(`unexpected tool ${name}`);
    return { ok: true, virtual: true, action: name, nextStep: normalizeNextStepIntent(args) };
  }
};
const client = {
  round: 0,
  async complete() {
    this.round++;
    if (this.round === 1) return {
      text: "",
      toolCalls: [{ id: "next_1", type: "function", function: { name: NEXT_STEP_TOOL_NAME, arguments: JSON.stringify({ needed: true, prompt: "Keep verifying.", reason: "tests remain" }) } }]
    };
    return { text: "Final visible answer.", toolCalls: [] };
  }
};
const agent = new MultiPassToolAgent({ client, bridge, providerId: "minimax", emitEvent: event => emitted.push(event) });
const result = await agent.run({ messages: [{ role: "user", content: "go" }], stream: true });
console.log(JSON.stringify({ result, emitted: emitted.map(e => ({ kind: e.kind, label: e.label, text: e.text })) }, null, 2));
if (result.text !== "Final visible answer.") throw new Error("final answer missing");
if (result.nextStep?.prompt !== "Keep verifying.") throw new Error("next-step prompt not captured");
if (!result.final?.awtsmoosNextStep?.needed) throw new Error("final metadata missing next-step intent");
