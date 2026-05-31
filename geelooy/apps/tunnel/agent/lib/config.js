// B"H
const fs = require("fs");
const os = require("os");
const path = require("path");

const HOME = os.homedir();
const ROOT = path.join(HOME, ".awtsmoos-tunnel");
const DIR = ROOT;
const CONFIG_PATH = path.join(ROOT, "config.json");
const FILE = CONFIG_PATH;
const FOUR_MINUTES_MS = 240000;

function defaultTunnelName() {
  const user = String(os.userInfo().username || "user").toLowerCase().replace(/[^a-z0-9_-]+/g, "-").replace(/^-+|-+$/g, "") || "user";
  return "awt-" + user + "-" + Math.floor(1000 + Math.random() * 9000);
}

const DEFAULTS = {
  tunnelName: "",
  relay: "wss://awtsmoos.com",
  local: "http://127.0.0.1:8080",
  root: HOME,
  allowWrite: true,
  allowSecrets: true,
  allowCommands: true,
  enableLocalHttpProxy: true,
  aiAgents: { agents: [], providerKeys: {} },
  localApi: { enabled: true, host: "127.0.0.1", port: 3977 },
  tools: { fsList: true, fsTree: true, fsRead: true, fsWrite: true, fsBulk: true, httpProxy: true, command: true, nodeScript: true, chrome: true, browser: true },
  command: { enabled: true, allowNodeScript: true, defaultShell: process.platform === "win32" ? "powershell" : "bash", timeoutMs: FOUR_MINUTES_MS, maxOutput: 120000 },
  chrome: { enabled: true, port: 9222, path: "", chromePath: "", userDataDir: path.join(ROOT, "chrome-profile"), headless: false }
};

/**
 * B"H
 * Chapter 333: Config Became A Sealed Ark For The Council Keys.
 *
 * The Awtsmoos gives every setting a vessel and every secret a sealed chamber.
 * This file writes only complete JSON, so provider keys and agent definitions
 * never enter as torn shards or half-remembered fragments.
 */
function ensureDir() { fs.mkdirSync(ROOT, { recursive: true }); }

function readJson(file, fallback) {
  try { return JSON.parse(fs.readFileSync(file, "utf8").replace(/^\uFEFF/, "")); } catch { return fallback; }
}

function writeJson(file, data) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, JSON.stringify(data, null, 2), "utf8");
}

function boolOrDefault(value, fallback) { return value === undefined ? fallback : value !== false; }
function numberOrDefault(value, fallback, min, max) {
  const n = Number(value || fallback);
  if (!Number.isFinite(n)) return fallback;
  return Math.max(min, Math.min(max, Math.floor(n)));
}

function normalizeAiAgents(old = {}) {
  const agents = Array.isArray(old.agents) ? old.agents.map(normalizeAgent).filter(Boolean) : [];
  const providerKeys = Object.fromEntries(Object.entries(old.providerKeys || {}).map(([k, v]) => [String(k).toLowerCase(), String(v || "")]).filter(([, v]) => v));
  return { agents, providerKeys };
}

function normalizeAgent(agent = {}) {
  const id = String(agent.id || "").trim();
  const provider = String(agent.provider || "").trim().toLowerCase();
  if (!id || !provider) return null;
  return {
    id,
    provider,
    name: String(agent.name || id),
    model: String(agent.model || ""),
    description: String(agent.description || ""),
    system: String(agent.system || "")
  };
}

function normalizeConfig(old = {}) {
  const tools = old.tools || {};
  const command = old.command || {};
  const chrome = old.chrome || {};
  const localApi = old.localApi || {};
  const chromePath = chrome.chromePath || chrome.path || "";
  return {
    tunnelName: old.tunnelName || defaultTunnelName(), relay: old.relay || DEFAULTS.relay, local: old.local || DEFAULTS.local, root: old.root || HOME,
    allowWrite: boolOrDefault(old.allowWrite, true), allowSecrets: boolOrDefault(old.allowSecrets, true), allowCommands: boolOrDefault(old.allowCommands, true), enableLocalHttpProxy: boolOrDefault(old.enableLocalHttpProxy, true),
    aiAgents: normalizeAiAgents(old.aiAgents || {}),
    localApi: { enabled: boolOrDefault(localApi.enabled, DEFAULTS.localApi.enabled), host: localApi.host || DEFAULTS.localApi.host, port: numberOrDefault(localApi.port, DEFAULTS.localApi.port, 1, 65535) },
    tools: { fsList: boolOrDefault(tools.fsList, true), fsTree: boolOrDefault(tools.fsTree, true), fsRead: boolOrDefault(tools.fsRead, true), fsWrite: boolOrDefault(tools.fsWrite, true), fsBulk: boolOrDefault(tools.fsBulk, true), httpProxy: boolOrDefault(tools.httpProxy, true), command: boolOrDefault(tools.command, true), nodeScript: boolOrDefault(tools.nodeScript, true), chrome: boolOrDefault(tools.chrome, true), browser: boolOrDefault(tools.browser, true) },
    command: { enabled: boolOrDefault(command.enabled, true), allowNodeScript: boolOrDefault(command.allowNodeScript, true), defaultShell: command.defaultShell || DEFAULTS.command.defaultShell, timeoutMs: numberOrDefault(command.timeoutMs, DEFAULTS.command.timeoutMs, 1000, FOUR_MINUTES_MS), maxOutput: numberOrDefault(command.maxOutput, DEFAULTS.command.maxOutput, 1000, 1000000) },
    chrome: { enabled: boolOrDefault(chrome.enabled, true), port: numberOrDefault(chrome.port, DEFAULTS.chrome.port, 1, 65535), path: chromePath, chromePath, userDataDir: chrome.userDataDir || DEFAULTS.chrome.userDataDir, headless: boolOrDefault(chrome.headless, DEFAULTS.chrome.headless) }
  };
}

function loadConfig() {
  ensureDir();
  const old = readJson(CONFIG_PATH, null);
  const cfg = normalizeConfig(old || {});
  if (!old || JSON.stringify(old) !== JSON.stringify(cfg)) writeJson(CONFIG_PATH, cfg);
  return cfg;
}

function saveConfigPatch(patch = {}) {
  ensureDir();
  const current = loadConfig();
  const merged = { ...current, ...patch, tools: { ...current.tools, ...(patch.tools || {}) }, command: { ...current.command, ...(patch.command || patch.commandConfig || {}) }, localApi: { ...current.localApi, ...(patch.localApi || {}) }, chrome: { ...current.chrome, ...(patch.chrome || {}) }, aiAgents: { ...current.aiAgents, ...(patch.aiAgents || {}) } };
  const next = normalizeConfig(merged);
  writeJson(CONFIG_PATH, next);
  return next;
}

module.exports = { HOME, ROOT, DIR, CONFIG_PATH, FILE, FOUR_MINUTES_MS, DEFAULTS, loadConfig, saveConfigPatch };
