
// B"H
const fs = require("fs");
const os = require("os");
const path = require("path");

const HOME = os.homedir();
const ROOT = path.join(HOME, ".awtsmoos-tunnel");
const DIR = ROOT;
const CONFIG_PATH = path.join(ROOT, "config.json");
const FILE = CONFIG_PATH;

function defaultTunnelName() {
  const user = String(os.userInfo().username || "user")
    .toLowerCase()
    .replace(/[^a-z0-9_-]+/g, "-")
    .replace(/^-+|-+$/g, "") || "user";

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
  tools: {
    fsList: true,
    fsTree: true,
    fsRead: true,
    fsWrite: true,
    fsBulk: true,
    httpProxy: true,
    command: true,
    nodeScript: true,
    chrome: true,
    browser: true
  },
  command: {
    enabled: true,
    allowNodeScript: true,
    defaultShell: process.platform === "win32" ? "powershell" : "bash",
    timeoutMs: 20000,
    maxOutput: 120000
  },
  chrome: {
    enabled: true,
    port: 9222,
    path: "",
    chromePath: "",
    userDataDir: path.join(ROOT, "chrome-profile")
  }
};

function ensureDir() {
  fs.mkdirSync(ROOT, { recursive: true });
}

function readJson(file, fallback) {
  try {
    const text = fs.readFileSync(file, "utf8").replace(/^\uFEFF/, "");
    return JSON.parse(text);
  } catch (e) {
    return fallback;
  }
}

function writeJson(file, data) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, JSON.stringify(data, null, 2), "utf8");
}

function boolOrDefault(value, fallback) {
  return value === undefined ? fallback : value !== false;
}

function normalizeConfig(old = {}) {
  const tools = old.tools || {};
  const command = old.command || {};
  const chrome = old.chrome || {};

  const chromePath = chrome.chromePath || chrome.path || "";

  return {
    tunnelName: old.tunnelName || defaultTunnelName(),
    relay: old.relay || DEFAULTS.relay,
    local: old.local || DEFAULTS.local,
    root: old.root || HOME,

    allowWrite: boolOrDefault(old.allowWrite, true),
    allowSecrets: boolOrDefault(old.allowSecrets, true),
    allowCommands: boolOrDefault(old.allowCommands, true),
    enableLocalHttpProxy: boolOrDefault(old.enableLocalHttpProxy, true),

    tools: {
      fsList: boolOrDefault(tools.fsList, true),
      fsTree: boolOrDefault(tools.fsTree, true),
      fsRead: boolOrDefault(tools.fsRead, true),
      fsWrite: boolOrDefault(tools.fsWrite, true),
      fsBulk: boolOrDefault(tools.fsBulk, true),
      httpProxy: boolOrDefault(tools.httpProxy, true),
      command: boolOrDefault(tools.command, true),
      nodeScript: boolOrDefault(tools.nodeScript, true),
      chrome: boolOrDefault(tools.chrome, true),
      browser: boolOrDefault(tools.browser, true)
    },

    command: {
      enabled: boolOrDefault(command.enabled, true),
      allowNodeScript: boolOrDefault(command.allowNodeScript, true),
      defaultShell: command.defaultShell || DEFAULTS.command.defaultShell,
      timeoutMs: Number(command.timeoutMs || DEFAULTS.command.timeoutMs),
      maxOutput: Number(command.maxOutput || DEFAULTS.command.maxOutput)
    },

    chrome: {
      enabled: boolOrDefault(chrome.enabled, true),
      port: Number(chrome.port || DEFAULTS.chrome.port),
      path: chromePath,
      chromePath,
      userDataDir: chrome.userDataDir || DEFAULTS.chrome.userDataDir
    }
  };
}

function loadConfig() {
  ensureDir();

  const old = readJson(CONFIG_PATH, null);
  const cfg = normalizeConfig(old || {});

  if (!old) {
    writeJson(CONFIG_PATH, cfg);
    return cfg;
  }

  const upgraded = JSON.stringify(old) !== JSON.stringify(cfg);
  if (upgraded) writeJson(CONFIG_PATH, cfg);

  return cfg;
}

function saveConfigPatch(patch = {}) {
  ensureDir();

  const current = loadConfig();
  const merged = {
    ...current,
    ...patch,
    tools: { ...current.tools, ...(patch.tools || {}) },
    command: { ...current.command, ...(patch.command || patch.commandConfig || {}) },
    chrome: { ...current.chrome, ...(patch.chrome || {}) }
  };

  const next = normalizeConfig(merged);
  writeJson(CONFIG_PATH, next);
  return next;
}

module.exports = {
  HOME,
  ROOT,
  DIR,
  CONFIG_PATH,
  FILE,
  DEFAULTS,
  loadConfig,
  saveConfigPatch
};
