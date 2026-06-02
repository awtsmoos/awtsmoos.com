// B"H
const fs = require("fs");
const os = require("os");
const path = require("path");

const SECRET_ROOT = path.join(os.homedir(), ".awtsmoos-secrets");

const PROVIDERS = Object.freeze({
  minimax: {
    id: "minimax",
    name: "MiniMax",
    envKey: "MINIMAX_API_KEY",
    fileEnvKey: "MINIMAX_API_KEY_FILE",
    defaultKeyFile: path.join(SECRET_ROOT, "minimax.key"),
    endpoint: "https://api.minimax.io/v1/chat/completions",
    defaultModel: "MiniMax-M2.7",
    contextWindow: 196000,
    extraBody: { reasoning_split: true }
  },
  openrouter: {
    id: "openrouter",
    name: "OpenRouter",
    envKey: "OPENROUTER_API_KEY",
    fileEnvKey: "OPENROUTER_API_KEY_FILE",
    defaultKeyFile: path.join(SECRET_ROOT, "openrouter.key"),
    endpoint: "https://openrouter.ai/api/v1/chat/completions",
    defaultModel: "openai/gpt-4o-mini",
    contextWindow: 128000
  },
  groq: {
    id: "groq",
    name: "Groq",
    envKey: "GROQ_API_KEY",
    fileEnvKey: "GROQ_API_KEY_FILE",
    defaultKeyFile: path.join(SECRET_ROOT, "groq.key"),
    endpoint: "https://api.groq.com/openai/v1/chat/completions",
    defaultModel: "llama-3.3-70b-versatile",
    contextWindow: 128000
  }
});

/**
 * B"H
 * Chapter 367: The Key Left The Palace And Became A Sealed Well.
 *
 * The repo is not a vault. Provider keys may live in ~/.awtsmoos-secrets, far
 * from awtsmoos.com, while the code only drinks from the well at runtime.
 */
function clean(value) { return String(value || "").trim().toLowerCase(); }

function providerFor(id = "openrouter") {
  const provider = PROVIDERS[clean(id)];
  if (!provider) throw new Error("Unknown AI provider: " + id);
  return provider;
}

function listProviders(config = {}) {
  return Object.values(PROVIDERS).map(provider => {
    const key = providerKey(config, provider.id);
    return {
      id: provider.id,
      name: provider.name,
      endpoint: provider.endpoint,
      defaultModel: provider.defaultModel,
      hasKey: Boolean(key),
      keyMask: maskKey(key),
      keySource: key ? providerKeySource(config, provider.id) : ""
    };
  });
}

function providerKey(config = {}, providerId = "") {
  const provider = providerFor(providerId);
  return config.aiAgents?.providerKeys?.[provider.id]
    || process.env[provider.envKey]
    || readKeyFile(process.env[provider.fileEnvKey])
    || readKeyFile(config.aiAgents?.providerKeyFiles?.[provider.id])
    || readKeyFile(provider.defaultKeyFile)
    || "";
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

function readKeyFile(file) {
  if (!file) return "";
  try { return fs.readFileSync(path.resolve(String(file)), "utf8").trim(); }
  catch { return ""; }
}

function providerHeaders(provider, apiKey) {
  const headers = { "Content-Type": "application/json", Authorization: "Bearer " + apiKey };
  if (provider.id === "openrouter") headers["X-Title"] = "Awtsmoos Tunnel Agent Council";
  return headers;
}

function maskKey(key = "") {
  const text = String(key || "");
  return text ? text.slice(0, 6) + "..." + text.slice(-4) : "";
}

module.exports = { PROVIDERS, clean, listProviders, maskKey, providerFor, providerHeaders, providerKey, providerKeySource, readKeyFile };
