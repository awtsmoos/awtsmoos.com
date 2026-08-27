// B"H
import { AwtsmoosPrompt } from "../../prompt.js";
import { EndpointTunnelBridge } from "../../central/endpointTunnelBridge.js";
import { ProviderChatStore, providerAssistantMessage, providerUserMessage } from "../../central/providerChatStore.js";

const ROOT_KEY = "awtaiLocalRepoRoot";
const MODEL_KEY = "awtaiLocalModelPath";
const SETTINGS = "awtai-local-settings";
const DEFAULT_ROOT = "/Users/awtsmoos/Documents/awtsmoos/git/awtsmoos.com";

/**
 * B"H
 * Chapter 8: The Local Stream Refused To Lie About Time.
 *
 * A GGUF is converted into the project's AWTAI-DB vessel when needed, then the
 * existing native `real-chat.js` runner speaks through the Awtsmoos tunnel.
 * Long generations now obey a real deadline instead of pretending a half-read
 * command was complete.
 */
export function makeAwtaiLocalService(owner) {
  const chatStore = new ProviderChatStore(owner.dbHandler, "awtai-local");
  return {
    name: "AwTai Local GGUF",
    providerId: "awtai-local",
    async getAwtsmoosAudio() { return null; },
    async getConversationsFnc(page = {}) { return await chatStore.list(page); },
    async getConversation(id) { return await chatStore.messages(id); },
    async promptFunction(userMessage, options = {}) {
      const conversationId = options.conversationId || (await chatStore.begin({ title: userMessage.slice(0, 80) })).id;
      await chatStore.append(conversationId, [providerUserMessage(userMessage)], { title: userMessage.slice(0, 80) });
      const bridge = new EndpointTunnelBridge({ targetVessel: "native-local" });
      const repoRoot = await setting(owner, ROOT_KEY, DEFAULT_ROOT, "AwTai repo root");
      const modelPath = await preparedModelPath({ owner, bridge, repoRoot, options });
      let streamed = "";
      const result = await runAwtai({ bridge, repoRoot, modelPath, prompt: userMessage, options, onText: text => { streamed = text; options.onstream?.(packet(text, conversationId, "streaming")); } });
      const text = result.text || streamed || "";
      const events = [{ type: "awtai_local", label: "AwTai Local", raw: result, provider: "awtai-local" }];
      await chatStore.append(conversationId, [providerAssistantMessage(text, events)]);
      const finalPacket = packet(text, conversationId, "done", result);
      options.ondone?.(finalPacket);
      return finalPacket;
    },
    chatStore
  };
}

async function preparedModelPath({ owner, bridge, repoRoot, options }) {
  const raw = await setting(owner, MODEL_KEY, "", "Path to a .awtai-db or .gguf model");
  if (!raw) throw new Error("AwTai Local needs a model path. Set awtaiLocalModelPath in localStorage or answer the prompt.");
  if (!/\.gguf$/i.test(raw)) return raw;
  const out = raw.replace(/\.gguf$/i, ".awtai-db");
  options.onstream?.(packet(`Converting GGUF to AWTAI-DB if needed:\n${out}`, options.conversationId, "converting"));
  await runCommand(bridge, { cwd: repoRoot, command: `test -f ${sh(out)} || node geelooy/scripts/awtai-db/bin/convert.js ${sh(raw)} ${sh(out)}`, timeoutMs: 600000 });
  return out;
}

async function runAwtai({ bridge, repoRoot, modelPath, prompt, options, onText }) {
  const max = cleanNumber(localStorageGet("awtaiLocalMaxNew"), 32);
  const cache = cleanNumber(localStorageGet("awtaiLocalTensorCacheBytes"), 0);
  const command = `AWTAI_STREAM=1 AWTAI_MAX_NEW=${max} AWTAI_TENSOR_CACHE_BYTES=${cache} node geelooy/scripts/awtai-db/bin/real-chat.js ${sh(modelPath)} ${sh(prompt)}`;
  const out = await runCommand(bridge, { cwd: repoRoot, command, onStdout: onText, timeoutMs: cleanNumber(options.timeoutMs, 600000) });
  const parsed = parseAwtaiJson(out.stderr) || parseAwtaiJson(out.stdout) || {};
  return { ...parsed, text: parsed.text || out.stdout || "", commandStatus: out.status };
}

async function runCommand(bridge, { cwd, command, timeoutMs = 120000, onStdout = null }) {
  const start = await bridge.dispatch("commandRun", { cwd, command, timeoutMs });
  if (!start.jobId) return { stdout: textOf(start.stdout) || start.content || "", stderr: textOf(start.stderr), status: start };
  const deadline = Date.now() + Math.max(1000, timeoutMs);
  let status = start, stdout = "", stderr = "";
  while (Date.now() < deadline) {
    const page = await pageOf(bridge, start.jobId, "stdout", stdout.length);
    if (page.content) { stdout += page.content; onStdout?.(stdout); }
    status = await bridge.dispatch("commandStatus", { jobId: start.jobId });
    if (status.status !== "running") break;
    await sleep(250);
  }
  stdout += (await pageOf(bridge, start.jobId, "stdout", stdout.length)).content;
  stderr += (await pageOf(bridge, start.jobId, "stderr", stderr.length)).content;
  if (status.status === "running") throw new Error(`AwTai command timed out after ${timeoutMs}ms`);
  if (Number(status.exitCode ?? 0) !== 0) throw new Error(stderr || status.error || `AwTai command failed: ${status.exitCode}`);
  return { stdout, stderr, status };
}

async function setting(owner, key, fallback, label) {
  const stored = await owner.dbHandler.read(SETTINGS, key).catch(() => null) || localStorageGet(key) || fallback;
  if (stored) return stored;
  const value = await AwtsmoosPrompt.go({ headerTxt: label });
  if (value) await owner.dbHandler.write(SETTINGS, key, value).catch(() => localStorageSet(key, value));
  return value || fallback;
}
function packet(text, conversationId, phase, raw = null) { return { role: "assistant", text, conversation_id: conversationId, data: { conversation_id: conversationId }, awtsmoos: { metrics: { provider: "awtai-local", phase }, otherEvents: raw ? [{ type: "awtai_local_result", raw }] : [] }, content: { parts: [text] }, message: { author: { role: "assistant" }, content: { parts: [text] } } }; }
function parseAwtaiJson(text = "") { const raw = String(text || "").split("---AWTAI_RESULT_JSON---").pop().trim(); if (!raw || !raw.startsWith("{")) return null; try { return JSON.parse(raw); } catch { return null; } }
async function pageOf(bridge, jobId, stream, offsetChars) { return await bridge.dispatch("commandJobOutputPage", { jobId, stream, offsetChars, maxChars: 24000 }).catch(() => ({ content: "" })); }
function cleanNumber(value, fallback) { const n = Number(value); return Number.isFinite(n) && n >= 0 ? n : fallback; }
function textOf(value) { return typeof value === "string" ? value : value?.content || ""; }
function sh(value) { return `'${String(value).replace(/'/g, `'"'"'`)}'`; }
function sleep(ms) { return new Promise(resolve => setTimeout(resolve, ms)); }
function localStorageGet(key) { try { return localStorage.getItem(key) || ""; } catch { return ""; } }
function localStorageSet(key, value) { try { localStorage.setItem(key, value); } catch {} }
