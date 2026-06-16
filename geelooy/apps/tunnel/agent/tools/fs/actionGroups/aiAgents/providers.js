// B"H
const fs = require("fs");
const os = require("os");
const path = require("path");

const SECRET_ROOT = path.join(os.homedir(), ".awtsmoos-secrets");

/**
 * B"H
 * Chapter 20: The local council received DeepSeek without scattering keys.
 *
 * These providers are OpenAI-compatible chat-completion rivers. Direct Gemini
 * and Anthropic should use dedicated adapters rather than pretending their
 * payloads are identical.
 */
const PROVIDERS = Object.freeze({
  minimax: provider("minimax", "MiniMax", "MINIMAX_API_KEY", "https://api.minimax.io/v1/chat/completions", "MiniMax-M2.7", 196000, { reasoning_split: true }),
  openrouter: provider("openrouter", "OpenRouter", "OPENROUTER_API_KEY", "https://openrouter.ai/api/v1/chat/completions", "openai/gpt-4o-mini", 128000),
  deepseek: provider("deepseek", "DeepSeek", "DEEPSEEK_API_KEY", "https://api.deepseek.com/chat/completions", "deepseek-chat", 64000),
  groq: provider("groq", "Groq", "GROQ_API_KEY", "https://api.groq.com/openai/v1/chat/completions", "llama-3.3-70b-versatile", 128000)
});

function provider(id, name, envKey, endpoint, defaultModel, contextWindow, extraBody = null) {
  const upper = id.toUpperCase().replace(/[^A-Z0-9]+/g, "_");
  return { id, name, envKey, fileEnvKey: `${upper}_API_KEY_FILE`, defaultKeyFile: path.join(SECRET_ROOT, `${id}.key`), endpoint, defaultModel, contextWindow, extraBody, openAICompatible: true };
}

function clean(value) { return String(value || "").trim().toLowerCase(); }
function providerFor(id = "openrouter") { const provider = PROVIDERS[clean(id)]; if (!provider) throw new Error("Unknown AI provider: " + id); return provider; }

function listProviders(config = {}) {
  return Object.values(PROVIDERS).map(provider => {
    const key = providerKey(config, provider.id);
    return { id: provider.id, name: provider.name, endpoint: provider.endpoint, defaultModel: provider.defaultModel, contextWindow: provider.contextWindow, hasKey: Boolean(key), keyMask: maskKey(key), keySource: key ? providerKeySource(config, provider.id) : "" };
  });
}

function providerKey(config = {}, providerId = "") {
  const provider = providerFor(providerId);
  return config.aiAgents?.providerKeys?.[provider.id] || process.env[provider.envKey] || readKeyFile(process.env[provider.fileEnvKey]) || readKeyFile(config.aiAgents?.providerKeyFiles?.[provider.id]) || readKeyFile(provider.defaultKeyFile) || "";
}

function providerKeySource(config = {}, providerId = "") {
  const provider = providerFor(providerId);
  if (config.aiAgents?.providerKeys?.[provider.id]) return "config";
  if (process.env[provider.envKey]) return "env";
  if (readKeyFile(process.env[provider.fileEnvKey])) return provider.fileEnvKey;
  if (readKeyFile(config.aiAgents?.providerKeyFiles?.[provider.id])) return "configFile";
  if (readKeyFile(provider.defaultKeyFile)) return "defaultFile";
  return "";
}

function readKeyFile(file) { if (!file) return ""; try { return fs.readFileSync(path.resolve(String(file)), "utf8").trim(); } catch { return ""; } }
function providerHeaders(provider, apiKey) { const headers = { "Content-Type": "application/json", Authorization: "Bearer " + apiKey }; if (provider.id === "openrouter") headers["X-Title"] = "Awtsmoos Tunnel Agent Council"; return headers; }
function maskKey(key = "") { const text = String(key || ""); return text ? text.slice(0, 6) + "..." + text.slice(-4) : ""; }

module.exports = { PROVIDERS, clean, listProviders, maskKey, providerFor, providerHeaders, providerKey, providerKeySource, readKeyFile };
