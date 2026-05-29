// B"H
import assert from "assert";
import { MultiPassToolAgent, AllTunnelRegistry, parseFallbackToolCalls } from "../../central/index.js";

class FakeBridge {
  constructor() { this.calls = []; }
  schemas() { return [{ type: "function", function: { name: "native.read", parameters: { type: "object" } } }]; }
  async call(name, args) {
    this.calls.push({ name, args });
    return { ok: true, name, content: "BH TOOL RESULT" };
  }
}

class TextFallbackClient {
  constructor() { this.round = 0; }
  async complete() {
    this.round++;
    if (this.round === 1) {
      return { text: '```json\n{"awtsmoos_tool_calls":[{"name":"native.read","arguments":{"path":"package.json"}}]}\n```' };
    }
    return { text: "Final after fallback tool." };
  }
}

class NativeToolClient {
  constructor() { this.round = 0; }
  async complete() {
    this.round++;
    if (this.round === 1) {
      return {
        text: "",
        json: {
          choices: [{
            message: {
              role: "assistant",
              content: "",
              tool_calls: [{
                id: "call_1",
                function: { name: "native.read", arguments: "{\"path\":\"package.json\"}" }
              }]
            }
          }]
        }
      };
    }
    return { text: "Final after native tool." };
  }
}

/**
 * B"H
 * Chapter 31: Two kinds of model-mouths were judged in the same fire.
 *
 * The first speaks plain JSON because it has no function calling. The second
 * speaks native `tool_calls`. Both must cause the bridge to run and both must
 * return to the model for a final answer.
 */
async function main() {
  const parsed = parseFallbackToolCalls('{"awtsmoos_tool_calls":[{"name":"native.tree","arguments":{"path":"."}}]}');
  assert.equal(parsed[0].name, "native.tree");

  const bridge = new FakeBridge();
  const fallback = await new MultiPassToolAgent({ client: new TextFallbackClient(), bridge }).run({ prompt: "use tool" });
  assert.equal(fallback.ok, true);
  assert.equal(fallback.rounds, 2);
  assert.equal(bridge.calls[0].name, "native.read");

  const bridge2 = new FakeBridge();
  const native = await new MultiPassToolAgent({ client: new NativeToolClient(), bridge: bridge2 }).run({ prompt: "use native" });
  assert.equal(native.ok, true);
  assert.equal(native.rounds, 2);
  assert.equal(bridge2.calls[0].args.path, "package.json");

  const registry = new AllTunnelRegistry([
    { id: "native", actions: ["read"], bridge: bridge2 },
    { id: "editor", actions: ["read"], bridge: bridge2 },
    { id: "virtualOs", actions: ["snapshot"], bridge: bridge2 }
  ]);
  assert.ok(registry.names().includes("virtualOs.snapshot"));
  assert.ok(registry.names().includes("editor.read"));
  console.log(JSON.stringify({ ok: true, tests: 4, names: registry.names() }, null, 2));
}

main().catch(error => {
  console.error(JSON.stringify({ ok: false, error: error.message, stack: error.stack }, null, 2));
  process.exit(1);
});
