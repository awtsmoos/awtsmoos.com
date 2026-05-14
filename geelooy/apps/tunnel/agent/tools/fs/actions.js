
// B"H

const fsp = require("fs/promises");
const path = require("path");
const os = require("os");

const { loadConfig, saveConfigPatch, HOME } = require("../../lib/config.js");
const { openSystemExplorer } = require("../../lib/open.js");

const { safePath } = require("./pathGuard.js");
const { listDirDetailed } = require("./listing.js");
const { treeText } = require("./tree.js");
const {
  readText,
  readBytesBase64,
  readTextFromBytes,
  writeText,
  findReplaceText,
  normalizeWrites
} = require("./readWrite.js");
const { readBulk } = require("./bulkRead.js");
const { driveRoots, rootBrowse } = require("./rootBrowser.js");

const AGENT_VERSION = "split-agent-0.8.0";

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
  registerAgain(ws, next);

  return {
    ok: true,
    action: "configSet",
    config: publicConfig(next)
  };
}

async function handleFsAction(payload, ws) {
  const config = loadConfig();
  const action = payload.action || "list";
  const p = payload.path || ".";
  const maxChars = Number(payload.maxChars || 12000);
  const offsetChars = Number(payload.offsetChars || 0);
  const maxBytes = Number(payload.maxBytes || 24000);
  const offsetBytes = Number(payload.offsetBytes || 0);

  const actions = {
    async configGet() {
      return {
        ok: true,
        action,
        config: publicConfig(loadConfig())
      };
    },

    async configSet() {
      return await handleConfigSet(payload, ws);
    },

    async roots() {
      return {
        ok: true,
        action,
        roots: driveRoots(),
        home: HOME,
        cwd: process.cwd()
      };
    },

    async rootBrowse() {
      return await rootBrowse(payload);
    },

    async rootSelect() {
      const chosen = payload.absolutePath || payload.root || payload.path;

      if (!chosen) {
        return {
          ok: false,
          action,
          error: "missing_root_path"
        };
      }

      const stat = await fsp.stat(chosen);

      if (!stat.isDirectory()) {
        return {
          ok: false,
          action,
          error: "not_a_directory",
          chosen
        };
      }

      const next = saveConfigPatch({ root: chosen });
      registerAgain(ws, next);

      return {
        ok: true,
        action,
        chosen,
        config: publicConfig(next)
      };
    },

    async openRoot() {
      const target = payload.root || config.root;
      openSystemExplorer(target);

      return {
        ok: true,
        action,
        opened: target
      };
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
      const got = await readText(config, p, maxChars, offsetChars);

      return {
        ok: true,
        action,
        root: config.root,
        path: p,
        absolutePath: safePath(config, p),
        ...got,
        guidance: got.truncated
          ? "File was truncated. Call read again with offsetChars=" + got.nextOffsetChars + " to continue, or use read64 for byte-perfect base64."
          : null
      };
    },

    async readBytes() {
      const got = await readTextFromBytes(config, p, maxBytes, offsetBytes);

      return {
        ok: true,
        action,
        root: config.root,
        path: p,
        absolutePath: safePath(config, p),
        ...got,
        guidance: got.truncated
          ? "Chunk was truncated by bytes. For exact content, use read64 with offsetBytes=" + got.nextOffsetBytes + "."
          : null
      };
    },

    async read64() {
      const got = await readBytesBase64(config, p, maxBytes, offsetBytes);

      return {
        ok: true,
        action,
        root: config.root,
        path: p,
        absolutePath: safePath(config, p),
        ...got,
        guidance: got.truncated
          ? "Base64 bytes were truncated. Decode content64, then continue with offsetBytes=" + got.nextOffsetBytes + "."
          : "Decode content64 as the exact bytes of this file chunk."
      };
    },

    async md() {
      const got = await readText(config, p, maxChars, offsetChars);
      const lang = path.extname(p).replace(".", "");

      return {
        ok: true,
        action,
        root: config.root,
        path: p,
        content: "```" + lang + "\n" + got.content + "\n```",
        truncated: got.truncated,
        encoding: got.encoding,
        offsetChars: got.offsetChars,
        nextOffsetChars: got.nextOffsetChars,
        totalChars: got.totalChars,
        totalBytes: got.totalBytes,
        guidance: got.truncated
          ? "Markdown file was truncated. Call md/read again with offsetChars=" + got.nextOffsetChars + " to continue."
          : null
      };
    },

    async bulk() {
      return await readBulk(config, payload);
    },

    async write() {
      const wrote = await writeText(config, p, payload.content || "");

      return {
        ok: true,
        action,
        root: config.root,
        ...wrote
      };
    },

    async findReplace() {
      const got = await findReplaceText(config, payload);

      return {
        root: config.root,
        ...got
      };
    },

    async bulkWrite() {
      if (!config.tools.fsBulk) throw new Error("fsBulk disabled.");

      const writes = normalizeWrites(payload);
      const maxWrites = Math.min(writes.length, 20);
      const selected = writes.slice(0, maxWrites);
      const skipped = writes.slice(maxWrites);
      const results = {};

      for (const one of selected) {
        try {
          results[one.path] = await writeText(config, one.path, one.content);
        } catch (e) {
          results[one.path] = {
            error: e.message
          };
        }
      }

      return {
        ok: true,
        action,
        root: config.root,
        count: selected.length,
        skippedCount: skipped.length,
        skippedPaths: skipped.map(x => x.path),
        guidance: skipped.length
          ? "bulkWrite is capped at 20 files per request. Send the rest in another request."
          : null,
        results
      };
    }
  };

  if (!actions[action]) {
    return {
      ok: false,
      status: 400,
      error: "Unknown fs action: " + action
    };
  }

  return await actions[action]();
}

module.exports = {
  handleFsAction,
  publicConfig,
  AGENT_VERSION
};
