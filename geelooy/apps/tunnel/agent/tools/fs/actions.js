
// B"H
const fsp = require("fs/promises");
const path = require("path");
const os = require("os");

const { loadConfig, saveConfigPatch, HOME } = require("../../lib/config.js");
const { openSystemExplorer } = require("../../lib/open.js");
const { safePath } = require("./pathGuard.js");
const { listDirDetailed } = require("./listing.js");
const { treeText } = require("./tree.js");
const { readText, writeText, normalizeWrites } = require("./readWrite.js");
const { driveRoots, rootBrowse } = require("./rootBrowser.js");

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
    roots: driveRoots()
  };
}

async function handleConfigSet(payload, ws) {
  const patch = {};

  if (payload.root) patch.root = String(payload.root);
  if (payload.local) patch.local = String(payload.local);
  if (payload.relay) patch.relay = String(payload.relay);
  if (payload.tunnelName) patch.tunnelName = String(payload.tunnelName);
  if (typeof payload.allowWrite === "boolean") patch.allowWrite = payload.allowWrite;
  if (typeof payload.allowSecrets === "boolean") patch.allowSecrets = payload.allowSecrets;
  if (typeof payload.allowCommands === "boolean") patch.allowCommands = payload.allowCommands;
  if (typeof payload.enableLocalHttpProxy === "boolean") patch.enableLocalHttpProxy = payload.enableLocalHttpProxy;
  if (payload.tools && typeof payload.tools === "object") patch.tools = payload.tools;
  if (payload.commandConfig && typeof payload.commandConfig === "object") patch.command = payload.commandConfig;
  if (payload.chrome && typeof payload.chrome === "object") patch.chrome = payload.chrome;

  if (patch.root) {
    const stat = await fsp.stat(patch.root);
    if (!stat.isDirectory()) throw new Error("Root must be a directory.");
  }

  const next = saveConfigPatch(patch);

  if (ws && ws.opened) {
    ws.sendJson({
      type: "TUNNEL_REGISTER",
      name: next.tunnelName,
      deviceName: os.hostname(),
      root: next.root,
      allowWrite: next.allowWrite,
      allowSecrets: next.allowSecrets,
      allowCommands: next.allowCommands,
      agentVersion: "split-agent-0.5.0"
    });
  }

  return { ok: true, action: "configSet", config: publicConfig(next) };
}

async function handleFsAction(payload, ws) {
  const config = loadConfig();
  const action = payload.action || "list";
  const p = payload.path || ".";
  const maxChars = Number(payload.maxChars || 12000);

  const actions = {
    async configGet() {
      return { ok: true, action, config: publicConfig(loadConfig()) };
    },

    async configSet() {
      return await handleConfigSet(payload, ws);
    },

    async roots() {
      return { ok: true, action, roots: driveRoots(), home: HOME, cwd: process.cwd() };
    },

    async rootBrowse() {
      return await rootBrowse(payload);
    },

    async rootSelect() {
      const chosen = payload.absolutePath || payload.root || payload.path;

      if (!chosen) {
        return { ok: false, action, error: "missing_root_path" };
      }

      const stat = await fsp.stat(chosen);

      if (!stat.isDirectory()) {
        return { ok: false, action, error: "not_a_directory", chosen };
      }

      const next = saveConfigPatch({ root: chosen });

      if (ws && ws.opened) {
        ws.sendJson({
          type: "TUNNEL_REGISTER",
          name: next.tunnelName,
          deviceName: os.hostname(),
          root: next.root,
          allowWrite: next.allowWrite,
          allowSecrets: next.allowSecrets,
          allowCommands: next.allowCommands,
          agentVersion: "split-agent-0.5.0"
        });
      }

      return { ok: true, action, chosen, config: publicConfig(next) };
    },

    async openRoot() {
      const target = payload.root || config.root;
      openSystemExplorer(target);
      return { ok: true, action, opened: target };
    },

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
      const got = await readText(config, p, maxChars);
      return { ok: true, action, root: config.root, path: p, absolutePath: safePath(config, p), ...got };
    },

    async md() {
      const got = await readText(config, p, maxChars);
      const lang = path.extname(p).replace(".", "");
      return { ok: true, action, root: config.root, path: p, content: "```" + lang + "\n" + got.content + "\n```", truncated: got.truncated };
    },

    async bulk() {
      if (!config.tools.fsBulk) throw new Error("fsBulk disabled.");
      const files = {};

      for (const one of payload.paths || []) {
        try {
          files[one] = await readText(config, one, maxChars);
        } catch (e) {
          files[one] = { error: e.message };
        }
      }

      return { ok: true, action, root: config.root, files };
    },

    async write() {
      const wrote = await writeText(config, p, payload.content || "");
      return { ok: true, action, root: config.root, ...wrote };
    },

    async bulkWrite() {
      if (!config.tools.fsBulk) throw new Error("fsBulk disabled.");
      const writes = normalizeWrites(payload);
      const results = {};

      for (const one of writes) {
        try {
          results[one.path] = await writeText(config, one.path, one.content);
        } catch (e) {
          results[one.path] = { error: e.message };
        }
      }

      return { ok: true, action, root: config.root, count: writes.length, results };
    }
  };

  if (!actions[action]) {
    return { ok: false, status: 400, error: "Unknown fs action: " + action };
  }

  return await actions[action]();
}

module.exports = {
  handleFsAction,
  publicConfig
};
