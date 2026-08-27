#!/usr/bin/env node
// B"H
import { getProvider, OpenAICompatibleStreamClient, MultiPassToolAgent, AllTunnelRegistry } from "../central/index.js";
import { LocalToolBridge } from "./localToolBridge.mjs";

function arg(name, fallback = "") {
  const hit = process.argv.find(x => x.startsWith(`--${name}=`));
  return hit ? hit.slice(name.length + 3) : fallback;
}

/**
 * B"H
 * Chapter 28: The agent returned until every tunnel had answered.
 *
 * OpenRouter and Groq are now driven through a multipass loop. Strong models may
 * use native tool calls. Plain models may print `awtsmoos_tool_calls` JSON. Both
 * paths call the same namespaced registry, then ask the model again.
 */
async function main() {
  const provider = getProvider(arg("provider", "openrouter"));
  const apiKey = process.env[provider.envKey] || arg("key");
  if (!apiKey) throw new Error(`Missing ${provider.envKey} or --key for ${provider.name}.`);
  const root = arg("root", process.cwd());
  const native = new LocalToolBridge({ root });
  const registry = AllTunnelRegistry.defaultNative(native);
  const client = new OpenAICompatibleStreamClient({ provider, apiKey });
  const agent = new MultiPassToolAgent({ client, bridge: registry, maxRounds: Number(arg("rounds", "6")) });
  const result = await agent.run({ prompt: arg("prompt", "B'H use all Awtsmoos tunnels carefully."), model: arg("model", provider.defaultModel), stream: false });
  process.stdout.write(result.text + "\n");
  process.stderr.write(JSON.stringify({ ok: result.ok, rounds: result.rounds, trace: result.trace.map(x => ({ round: x.round, calls: x.calls.map(c => c.name) })) }, null, 2) + "\n");
}

main().catch(error => {
  console.error(JSON.stringify({ ok: false, error: error.message, stack: error.stack }, null, 2));
  process.exit(1);
});
