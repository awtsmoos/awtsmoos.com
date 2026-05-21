// B"H
const fsp = require("fs/promises");
const os = require("os");
const { loadConfig, saveConfigPatch, HOME } = require("../../../lib/config.js");
const { openSystemExplorer } = require("../../../lib/open.js");
const { driveRoots, rootBrowse } = require("../rootBrowser.js");

function publicConfig(config, version) {
  return {
    tunnelName: config.tunnelName,
    relay: config.relay,
    local: config.local,
    root: config.root,
    allowWrite: config.allowWrite,
    allowSecrets: config.allowSecrets,
    allowCommands: config.allowCommands,
    enableLocalHttpProxy: config.enableLocalHttpProxy,
    tools: config.tools,
    command: config.command,
    chrome: config.chrome,
    continuationPrompt: config.continuationPrompt || "keep going. First give me a list of all remaining items to make it perfect, the DJ then one by one fully.",
    platform: process.platform,
    hostname: os.hostname(),
    home: HOME,
    roots: driveRoots(),
    agentVersion: version
  };
}

function registerAgain(ws, config, version) {
  if (!ws || !ws.opened) return;

  ws.sendJson({
    type: "TUNNEL_REGISTER",
    name: config.tunnelName,
    deviceName: os.hostname(),
    root: config.root,
    allowWrite: config.allowWrite,
    allowSecrets: config.allowSecrets,
    allowCommands: config.allowCommands,
    agentVersion: version
  });
}

async function handleConfigSet(payload, ws, version) {
  const patch = {};

  for (const key of ["root", "local", "relay", "tunnelName"]) {
    if (payload[key]) patch[key] = String(payload[key]);
  }

  for (const key of ["allowWrite", "allowSecrets", "allowCommands", "enableLocalHttpProxy"]) {
    if (typeof payload[key] === "boolean") patch[key] = payload[key];
  }

  if (payload.tools && typeof payload.tools === "object") patch.tools = payload.tools;
  if (payload.continuationPrompt !== undefined) patch.continuationPrompt = String(payload.continuationPrompt || "");
  if (payload.commandConfig && typeof payload.commandConfig === "object") patch.command = payload.commandConfig;
  if (payload.chrome && typeof payload.chrome === "object") patch.chrome = payload.chrome;

  if (patch.root) {
    const stat = await fsp.stat(patch.root);
    if (!stat.isDirectory()) throw new Error("Root must be a directory.");
  }

  const next = saveConfigPatch(patch);
  registerAgain(ws, next, version);
  return { ok: true, action: "configSet", config: publicConfig(next, version) };
}

function buildConfigActions(ctx) {
  const { config, payload, ws, version } = ctx;
  const action = payload.action || "list";

  return {
    async configGet() { return { ok: true, action, config: publicConfig(loadConfig(), version) }; },
    async configSet() { return await handleConfigSet(payload, ws, version); },
    async roots() { return { ok: true, action, roots: driveRoots(), home: HOME, cwd: process.cwd() }; },
    async rootBrowse() { return await rootBrowse(payload); },
    async rootSelect() {
      const chosen = payload.absolutePath || payload.root || payload.path || payload.p;
      if (!chosen) return { ok: false, action, error: "missing_root_path" };
      const stat = await fsp.stat(chosen);
      if (!stat.isDirectory()) return { ok: false, action, error: "not_a_directory", chosen };
      const next = saveConfigPatch({ root: chosen });
      registerAgain(ws, next, version);
      return { ok: true, action, chosen, config: publicConfig(next, version) };
    },
    async openRoot() {
      const target = payload.root || config.root;
      openSystemExplorer(target);
      return { ok: true, action, opened: target };
    },
    async finishAndContinue() {
      const current = loadConfig();
      const prompt = payload.continuationPrompt || current.continuationPrompt || "keep going. First give me a list of all remaining items to make it perfect, the DJ then one by one fully.";
      return { ok: true, action: "finishAndContinue", finished: true, finalInstruction: { role: "user", content: String(prompt) } };
    },
    async finishAndContinue() {
      const current = loadConfig();
      const prompt = payload.continuationPrompt || current.continuationPrompt || "keep going. First give me a list of all remaining items to make it perfect, the DJ then one by one fully.";
      return { ok: true, action: "finishAndContinue", finished: true, finalInstruction: { role: "user", content: String(prompt) } };
    }
  };
}

module.exports = { buildConfigActions, publicConfig, registerAgain };
