// B"H
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

/**
 * B"H — Regression lamp: prove MiniMax opens first, ChatGPT stays gated,
 * and OpenAI-compatible vessels keep the Awtsmoos tunnel resolver.
 */
const root = new URL("../", import.meta.url);
const read = (path) => readFile(new URL(path, root), "utf8");
const [aiService, providers, openaiCompatible, providerTunnelBridge] = await Promise.all([
  read("aiService.js"),
  read("central/providers.js"),
  read("openaiCompatible.js"),
  read("central/providerTunnelBridge.js")
]);

assert.match(aiService, /export const DEFAULT_AI_SERVICE = "minimax";/);
assert.match(aiService, /ACTIVE_AI_SERVICE_STORAGE_KEY = "awtsmoosActiveAIService"/);
assert.doesNotMatch(aiService, /activeAIService\s*=\s*"chatgpt"/);
assert.match(aiService, /resolveService\(readStorage\(ACTIVE_AI_SERVICE_STORAGE_KEY\)\)/);
assert.match(aiService, /if \(!this\.isChatGPTSelected\(\)\) return \{\};/);
assert.match(aiService, /writeStorage\(ACTIVE_AI_SERVICE_STORAGE_KEY, newService\)/);
assert.match(providers, /export function getProvider\(id = "minimax"\)/);
assert.match(providers, /defaultModel: "MiniMax-M2\.7"/);
assert.match(providers, /id: "MiniMax-M2\.7"/);
assert.match(providers, /id: "MiniMax-M3"/);
assert.match(openaiCompatible, /resolveProviderTunnelBridge/);
assert.match(openaiCompatible, /MultiPassToolAgent/);
assert.match(providerTunnelBridge, /getBrowserLocalTunnelBridge/);
assert.match(providerTunnelBridge, /EndpointTunnelBridge/);

console.log("B'H MiniMax default provider and tunnel bridge regression passed.");
