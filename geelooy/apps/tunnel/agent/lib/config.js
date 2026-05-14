
// B"H
const fs = require("fs");
const path = require("path");
const os = require("os");

const HOME = os.homedir();
const ROOT = path.join(HOME, ".awtsmoos-tunnel");
const CONFIG_PATH = path.join(ROOT, "config.json");

function defaultTunnelName() {
  const user = String(os.userInfo().username || "user")
    .toLowerCase()
    .replace(/[^a-z0-9_-]+/g, "-")
    .replace(/^-+|-+$/g, "") || "user";

  return "awt-" + user + "-" + Math.floor(1000 + Math.random() * 9000);
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

function normalizeConfig(old) {
  return {
    relay: old?.relay || "wss://awtsmoos.com",
    tunnelName: old?.tunnelName || defaultTunnelName(),
    local: old?.local || "http://localhost:3000",
    root: old?.root || process.cwd(),
    allowWrite: old?.allowWrite !== false,
    allowSecrets: !!old?.allowSecrets,
    enableLocalHttpProxy: old?.enableLocalHttpProxy !== false,
    tools: {
      fsList: old?.tools?.fsList !== false,
      fsTree: old?.tools?.fsTree !== false,
      fsRead: old?.tools?.fsRead !== false,
      fsWrite: old?.tools?.fsWrite !== false,
      fsBulk: old?.tools?.fsBulk !== false,
      httpProxy: old?.tools?.httpProxy !== false,
      chrome: !!old?.tools?.chrome
    },
    chrome: {
      enabled: !!old?.chrome?.enabled,
      port: Number(old?.chrome?.port || 9222),
      path: old?.chrome?.path || "",
      userDataDir: old?.chrome?.userDataDir || ""
    }
  };
}

function loadConfig() {
  const old = readJson(CONFIG_PATH, null);
  const cfg = normalizeConfig(old);
  if (!old) writeJson(CONFIG_PATH, cfg);
  return cfg;
}

function saveConfigPatch(patch) {
  const current = loadConfig();
  const next = normalizeConfig({
    ...current,
    ...patch,
    tools: {
      ...current.tools,
      ...(patch.tools || {})
    },
    chrome: {
      ...current.chrome,
      ...(patch.chrome || {})
    }
  });

  writeJson(CONFIG_PATH, next);
  return next;
}

module.exports = {
  HOME,
  ROOT,
  CONFIG_PATH,
  loadConfig,
  saveConfigPatch
};
