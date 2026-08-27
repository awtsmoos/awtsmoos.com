// B"H
import assert from "assert";
import { getProvider, makeToolSchemas, OpenAICompatibleStreamClient } from "../../central/index.js";
import { LocalToolBridge } from "../../agents/localToolBridge.mjs";

/**
 * B"H
 * Chapter 23: No real provider was called; the vessel was tested in glass.
 *
 * The smoke test proves payloads, schemas, provider metadata, and the local
 * tool bridge without sending secrets to OpenRouter or Groq.
 */
async function main() {
  const groq = getProvider("groq");
  assert.equal(groq.envKey, "GROQ_API_KEY");
  const schemas = makeToolSchemas(["read", "bulk", "simulateRuntime"]);
  assert.equal(schemas.length, 3);
  assert.equal(schemas[0].function.name, "read");

  let requestBody = null;
  const client = new OpenAICompatibleStreamClient({
    provider: getProvider("openrouter"),
    apiKey: "test-key",
    fetchImpl: async (_url, init) => {
      requestBody = JSON.parse(init.body);
      return { ok: true, async json() { return { choices: [{ message: { content: "BH central" } }] }; } };
    }
  });
  const response = await client.complete({ prompt: "hello", tools: schemas, stream: false });
  assert.equal(response.text, "BH central");
  assert.equal(requestBody.tools.length, 3);

  const bridge = new LocalToolBridge({ root: process.cwd(), actions: ["list", "tree", "read"] });
  assert.equal(bridge.schemas().length, 3);
  const listed = await bridge.call("list", { path: "geelooy/ai/central" });
  assert.equal(listed.ok, true);
  console.log(JSON.stringify({ ok: true, tests: 4, tools: bridge.schemas().map(x => x.function.name) }, null, 2));
}

main().catch(error => {
  console.error(JSON.stringify({ ok: false, error: error.message, stack: error.stack }, null, 2));
  process.exit(1);
});
