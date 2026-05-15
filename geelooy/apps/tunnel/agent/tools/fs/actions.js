
// B"H
const fsp = require("fs/promises");
const path = require("path");
const os = require("os");
const { loadConfig, saveConfigPatch, HOME } = require("../../lib/config.js");
const { openSystemExplorer } = require("../../lib/open.js");
const { safePath } = require("./pathGuard.js");
const { listDirDetailed } = require("./listing.js");
const { treeText } = require("./tree.js");
const { readText, readBytesBase64, readTextFromBytes, writeText, findReplaceText, normalizeWrites } = require("./readWrite.js");
const { readBulk } = require("./bulkRead.js");
const { driveRoots, rootBrowse } = require("./rootBrowser.js");
const { statPath, readLines, grep, replaceRange, applyPatch } = require("./searchEdit.js");

const AGENT_VERSION = "split-agent-1.0.0";

function publicConfig(config) {
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
    platform: process.platform,
    hostname: os.hostname(),
    home: HOME,
    roots: driveRoots(),
    agentVersion: AGENT_VERSION
  };
}

function registerAgain(ws, config) {
  if (!ws || !ws.opened) return;

  ws.sendJson({
    type: "TUNNEL_REGISTER",
    name: config.tunnelName,
    deviceName: os.hostname(),
    root: config.root,
    allowWrite: config.allowWrite,
    allowSecrets: config.allowSecrets,
    allowCommands: config.allowCommands,
    agentVersion: AGENT_VERSION
  });
}

async function handleConfigSet(payload, ws) {
  const patch = {};

  for (const key of ["root", "local", "relay", "tunnelName"]) {
    if (payload[key]) patch[key] = String(payload[key]);
  }

  for (const key of ["allowWrite", "allowSecrets", "allowCommands", "enableLocalHttpProxy"]) {
    if (typeof payload[key] === "boolean") patch[key] = payload[key];
  }

  if (payload.tools && typeof payload.tools === "object") patch.tools = payload.tools;
  if (payload.commandConfig && typeof payload.commandConfig === "object") patch.command = payload.commandConfig;
  if (payload.chrome && typeof payload.chrome === "object") patch.chrome = payload.chrome;

  if (patch.root) {
    const stat = await fsp.stat(patch.root);
    if (!stat.isDirectory()) throw new Error("Root must be a directory.");
  }

  const next = saveConfigPatch(patch);
  registerAgain(ws, next);
  return { ok: true, action: "configSet", config: publicConfig(next) };
}

async function handleBulkWrite(config, payload, action) {
  if (!config.tools.fsBulk) throw new Error("fsBulk disabled.");

  const writes = normalizeWrites(payload);
  const results = {};
  let okCount = 0;

  for (const one of writes) {
    try {
      results[one.path] = await writeText(config, one.path, one.content);
      okCount++;
    } catch (e) {
      results[one.path] = { ok: false, error: e.message };
    }
  }

  return {
    ok: true,
    action,
    root: config.root,
    count: writes.length,
    okCount,
    results
  };
}

async function handleFsAction(payload, ws) {
  const config = loadConfig();
  const action = payload.action || "list";
  const p = payload.path || payload.p || ".";
  const maxChars = Number(payload.maxChars || 12000);
  const offsetChars = Number(payload.offsetChars || 0);
  const maxBytes = Number(payload.maxBytes || 24000);
  const offsetBytes = Number(payload.offsetBytes || 0);

  const actions = {
    async configGet() { return { ok: true, action, config: publicConfig(loadConfig()) }; },
    async configSet() { return await handleConfigSet(payload, ws); },
    async roots() { return { ok: true, action, roots: driveRoots(), home: HOME, cwd: process.cwd() }; },
    async rootBrowse() { return await rootBrowse(payload); },
    async rootSelect() {
      const chosen = payload.absolutePath || payload.root || payload.path || payload.p;
      if (!chosen) return { ok: false, action, error: "missing_root_path" };
      const stat = await fsp.stat(chosen);
      if (!stat.isDirectory()) return { ok: false, action, error: "not_a_directory", chosen };
      const next = saveConfigPatch({ root: chosen });
      registerAgain(ws, next);
      return { ok: true, action, chosen, config: publicConfig(next) };
    },
    async openRoot() {
      const target = payload.root || config.root;
      openSystemExplorer(target);
      return { ok: true, action, opened: target };
    },

    async stat() { return await statPath(config, payload); },
    async list() {
      const detailedItems = await listDirDetailed(config, p);
      return {
        ok: true,
        action,
        root: config.root,
        path: p,
        absolutePath: safePath(config, p),
        items: detailedItems.map(x => x.isDirectory ? x.name + "/" : x.name),
        detailedItems
      };
    },
    async tree() {
      return {
        ok: true,
        action,
        root: config.root,
        path: p,
        absolutePath: safePath(config, p),
        treeText: await treeText(config, p, payload.depth, payload.limit)
      };
    },
    async read() {
      const got = await readText(config, p, maxChars, offsetChars);
      return { ok: true, action, root: config.root, path: p, absolutePath: safePath(config, p), ...got };
    },
    async readLines() { return await readLines(config, payload); },
    async readBytes() {
      const got = await readTextFromBytes(config, p, maxBytes, offsetBytes);
      return { ok: true, action, root: config.root, path: p, absolutePath: safePath(config, p), ...got };
    },
    async read64() {
      const got = await readBytesBase64(config, p, maxBytes, offsetBytes);
      return { ok: true, action, root: config.root, path: p, absolutePath: safePath(config, p), ...got };
    },
    async md() {
      const got = await readText(config, p, maxChars, offsetChars);
      const lang = path.extname(p).replace(".", "");
      return { ok: true, action, root: config.root, path: p, content: "```" + lang + "\n" + got.content + "\n```", ...got };
    },
    async bulk() { return await readBulk(config, payload); },
    async grep() { return await grep(config, payload); },

    async write() {
      const wrote = await writeText(config, p, payload.content || "");
      return { ok: true, action, root: config.root, ...wrote };
    },
    async bulkWrite() { return await handleBulkWrite(config, payload, action); },
    async findReplace() { return { root: config.root, ...(await findReplaceText(config, payload)) }; },
    async replaceRange() { return { root: config.root, ...(await replaceRange(config, payload)) }; },
    async applyPatch() { return { root: config.root, ...(await applyPatch(config, payload)) }; }
  };

  if (!actions[action]) {
    return {
      ok: false,
      status: 400,
      error: "Unknown fs action: " + action,
      availableActions: Object.keys(actions)
    };
  }

  return await actions[action]();
}

module.exports = { handleFsAction, publicConfig, AGENT_VERSION };
