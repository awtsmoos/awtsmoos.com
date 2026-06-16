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

const DEFAULT_AI = {
  agents: [], providerKeys: {}, providerKeyFiles: {}, maxDepth: 3, maxChildrenPerTask: 8, maxTotalTasks: 80,
  pollIntervalMs: 7000, promotionCycles: 7, agentCycles: 8, chapterCycles: 8, providerTimeoutMs: 45000,
  allowRecursiveSpawn: true
};

const DEFAULT_GIT_HYGIENE = {
  autoUpdateGitignore: true,
  ignoreAwtsmoosTemp: true,
  ignoreAiThoughts: false
};

const DEFAULTS = {
  tunnelName: "", relay: "wss://awtsmoos.com", local: "http://127.0.0.1:8080", root: HOME,
  allowWrite: true, allowSecrets: true, allowCommands: true, enableLocalHttpProxy: true,
  aiAgents: DEFAULT_AI,
  gitHygiene: DEFAULT_GIT_HYGIENE,
  localApi: { enabled: true, host: "127.0.0.1", port: 3977 },
  tools: { fsList: true, fsTree: true, fsRead: true, fsWrite: true, fsBulk: true, httpProxy: true, command: true, nodeScript: true, chrome: true, browser: true },
  command: { enabled: true, allowNodeScript: true, defaultShell: process.platform === "win32" ? "powershell" : "bash", timeoutMs: FOUR_MINUTES_MS, maxOutput: 120000 },
  chrome: { enabled: true, port: 9222, path: "", chromePath: "", userDataDir: path.join(ROOT, "chrome-profile"), headless: false }
};

/**
 * B"H
 * Chapter 374: The temporary flowers learned not to enter the ledger of git.
 */
function ensureDir() { fs.mkdirSync(ROOT, { recursive: true }); }
function readJson(file, fallback) { try { return JSON.parse(fs.readFileSync(file, "utf8").replace(/^\uFEFF/, "")); } catch { return fallback; } }
function writeJson(file, data) { fs.mkdirSync(path.dirname(file), { recursive: true }); fs.writeFileSync(file, JSON.stringify(data, null, 2), "utf8"); }
function boolOrDefault(value, fallback) { return value === undefined ? fallback : value !== false; }
function numberOrDefault(value, fallback, min, max) {
  const n = Number(value ?? fallback);
  if (!Number.isFinite(n)) return fallback;
  return Math.max(min, Math.min(max, Math.floor(n)));
}

function normalizeAiAgents(old = {}) {
  return {
    agents: Array.isArray(old.agents) ? old.agents.map(normalizeAgent).filter(Boolean) : [],
    providerKeys: stringMap(old.providerKeys || {}),
    providerKeyFiles: stringMap(old.providerKeyFiles || {}),
    maxDepth: numberOrDefault(old.maxDepth, DEFAULT_AI.maxDepth, 0, 1000000),
    maxChildrenPerTask: numberOrDefault(old.maxChildrenPerTask, DEFAULT_AI.maxChildrenPerTask, 0, 1000000),
    maxTotalTasks: numberOrDefault(old.maxTotalTasks, DEFAULT_AI.maxTotalTasks, 1, 10000000),
    pollIntervalMs: numberOrDefault(old.pollIntervalMs, DEFAULT_AI.pollIntervalMs, 100, 600000),
    promotionCycles: numberOrDefault(old.promotionCycles, DEFAULT_AI.promotionCycles, 0, 1000000),
    agentCycles: numberOrDefault(old.agentCycles ?? old.chapterCycles, DEFAULT_AI.agentCycles, 1, 1000000),
    chapterCycles: numberOrDefault(old.chapterCycles ?? old.agentCycles, DEFAULT_AI.chapterCycles, 1, 1000000),
    providerTimeoutMs: numberOrDefault(old.providerTimeoutMs, DEFAULT_AI.providerTimeoutMs, 5000, 300000),
    allowRecursiveSpawn: boolOrDefault(old.allowRecursiveSpawn, DEFAULT_AI.allowRecursiveSpawn)
  };
}

function normalizeGitHygiene(old = {}) {
  return {
    autoUpdateGitignore: boolOrDefault(old.autoUpdateGitignore, DEFAULT_GIT_HYGIENE.autoUpdateGitignore),
    ignoreAwtsmoosTemp: boolOrDefault(old.ignoreAwtsmoosTemp, DEFAULT_GIT_HYGIENE.ignoreAwtsmoosTemp),
    ignoreAiThoughts: old.ignoreAiThoughts === true
  };
}

function stringMap(input = {}) {
  return Object.fromEntries(Object.entries(input).map(([k, v]) => [String(k).toLowerCase(), String(v || "")]).filter(([, v]) => v));
}

function normalizeAgent(agent = {}) {
  const id = String(agent.id || "").trim();
  const provider = String(agent.provider || "").trim().toLowerCase();
  if (!id || !provider) return null;
  return { id, provider, name: String(agent.name || id), model: String(agent.model || ""), description: String(agent.description || ""), system: String(agent.system || "") };
}

function normalizeConfig(old = {}) {
  const tools = old.tools || {}, command = old.command || {}, chrome = old.chrome || {}, localApi = old.localApi || {};
  const chromePath = chrome.chromePath || chrome.path || "";
  return {
    tunnelName: old.tunnelName || defaultTunnelName(), relay: old.relay || DEFAULTS.relay, local: old.local || DEFAULTS.local, root: old.root || HOME,
    allowWrite: boolOrDefault(old.allowWrite, true), allowSecrets: boolOrDefault(old.allowSecrets, true), allowCommands: boolOrDefault(old.allowCommands, true), enableLocalHttpProxy: boolOrDefault(old.enableLocalHttpProxy, true),
    aiAgents: normalizeAiAgents(old.aiAgents || {}),
    gitHygiene: normalizeGitHygiene(old.gitHygiene || {}),
    localApi: { enabled: boolOrDefault(localApi.enabled, true), host: localApi.host || DEFAULTS.localApi.host, port: numberOrDefault(localApi.port, DEFAULTS.localApi.port, 1, 65535) },
    tools: { fsList: boolOrDefault(tools.fsList, true), fsTree: boolOrDefault(tools.fsTree, true), fsRead: boolOrDefault(tools.fsRead, true), fsWrite: boolOrDefault(tools.fsWrite, true), fsBulk: boolOrDefault(tools.fsBulk, true), httpProxy: boolOrDefault(tools.httpProxy, true), command: boolOrDefault(tools.command, true), nodeScript: boolOrDefault(tools.nodeScript, true), chrome: boolOrDefault(tools.chrome, true), browser: boolOrDefault(tools.browser, true) },
    command: { enabled: boolOrDefault(command.enabled, true), allowNodeScript: boolOrDefault(command.allowNodeScript, true), defaultShell: command.defaultShell || DEFAULTS.command.defaultShell, timeoutMs: numberOrDefault(command.timeoutMs, DEFAULTS.command.timeoutMs, 1000, FOUR_MINUTES_MS), maxOutput: numberOrDefault(command.maxOutput, DEFAULTS.command.maxOutput, 1000, 1000000) },
    chrome: { enabled: boolOrDefault(chrome.enabled, true), port: numberOrDefault(chrome.port, DEFAULTS.chrome.port, 1, 65535), path: chromePath, chromePath, userDataDir: chrome.userDataDir || DEFAULTS.chrome.userDataDir, headless: boolOrDefault(chrome.headless, false) }
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
  const merged = { ...current, ...patch, tools: { ...current.tools, ...(patch.tools || {}) }, command: { ...current.command, ...(patch.command || patch.commandConfig || {}) }, localApi: { ...current.localApi, ...(patch.localApi || {}) }, chrome: { ...current.chrome, ...(patch.chrome || {}) }, aiAgents: { ...current.aiAgents, ...(patch.aiAgents || {}) }, gitHygiene: { ...current.gitHygiene, ...(patch.gitHygiene || {}) } };
  const next = normalizeConfig(merged);
  writeJson(CONFIG_PATH, next);
  return next;
}

module.exports = { HOME, ROOT, DIR, CONFIG_PATH, FILE, FOUR_MINUTES_MS, DEFAULTS, DEFAULT_GIT_HYGIENE, loadConfig, saveConfigPatch, normalizeGitHygiene };
