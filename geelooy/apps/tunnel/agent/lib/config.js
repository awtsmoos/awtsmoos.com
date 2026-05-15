
// B"H
const fs = require("fs");
const os = require("os");
const path = require("path");

const HOME = os.homedir();
const DIR = path.join(HOME, ".awtsmoos-tunnel");
const FILE = path.join(DIR, "config.json");

const DEFAULTS = {
  tunnelName: "",
  relay: "https://awtsmoos.com",
  local: "http://127.0.0.1:8080",
  root: HOME,
  allowWrite: true,
  allowSecrets: true,
  allowCommands: true,
  enableLocalHttpProxy: true,
  tools: {
    fsRead: true,
    fsWrite: true,
    fsBulk: true,
    command: true,
    nodeScript: true,
    chrome: true,
    browser: true
  },
  command: {
    enabled: true,
    allowNodeScript: true,
    timeoutMs: 20000
  },
  chrome: {
    enabled: true,
    port: 9222,
    chromePath: "",
    userDataDir: path.join(DIR, "chrome-profile")
  }
};

function ensureDir() {
  fs.mkdirSync(DIR, { recursive: true });
}

function mergeConfig(base, patch) {
  return {
    ...base,
    ...(patch || {}),
    tools: { ...(base.tools || {}), ...((patch && patch.tools) || {}) },
    command: { ...(base.command || {}), ...((patch && patch.command) || {}) },
    chrome: { ...(base.chrome || {}), ...((patch && patch.chrome) || {}) }
  };
}

function loadConfig() {
  ensureDir();

  if (!fs.existsSync(FILE)) {
    fs.writeFileSync(FILE, JSON.stringify(DEFAULTS, null, 2));
    return { ...DEFAULTS };
  }

  try {
    const raw = JSON.parse(fs.readFileSync(FILE, "utf8"));
    const merged = mergeConfig(DEFAULTS, raw);
    fs.writeFileSync(FILE, JSON.stringify(merged, null, 2));
    return merged;
  } catch (e) {
    const backup = FILE + ".broken-" + Date.now();
    try { fs.copyFileSync(FILE, backup); } catch (_err) {}
    fs.writeFileSync(FILE, JSON.stringify(DEFAULTS, null, 2));
    return { ...DEFAULTS, warning: "Config was broken and reset.", backup };
  }
}

function saveConfigPatch(patch) {
  ensureDir();
  const current = loadConfig();
  const next = mergeConfig(current, patch || {});
  fs.writeFileSync(FILE, JSON.stringify(next, null, 2));
  return next;
}

module.exports = {
  HOME,
  DIR,
  FILE,
  DEFAULTS,
  loadConfig,
  saveConfigPatch
};
