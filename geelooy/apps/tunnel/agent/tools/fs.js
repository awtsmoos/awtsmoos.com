
// B"H
const fs = require("fs");
const fsp = require("fs/promises");
const path = require("path");
const os = require("os");
const childProcess = require("child_process");
const { loadConfig, saveConfigPatch, HOME } = require("../lib/config.js");
const { openSystemExplorer } = require("../lib/open.js");

const SKIP = new Set(["node_modules", ".git", ".DS_Store", "dist", "build", ".next", "coverage"]);
const SECRET_FILES = new Set([".env", ".env.local", ".env.production", ".npmrc", "id_rsa", "id_dsa", "id_ed25519", "credentials.json"]);
const BIN = new Set([".png", ".jpg", ".jpeg", ".gif", ".webp", ".ico", ".pdf", ".zip", ".exe", ".dll", ".so", ".node", ".woff", ".woff2", ".ttf", ".mp4", ".mov", ".mp3"]);

function safePath(config, given) {
  const root = path.resolve(config.root);
  const input = given || ".";
  const full = path.isAbsolute(input) ? path.resolve(input) : path.resolve(root, input);

  if (!full.toLowerCase().startsWith(root.toLowerCase())) {
    throw new Error("Path outside allowed project root: " + full);
  }

  return full;
}

function rel(config, full) {
  return path.relative(config.root, full).replace(/\\/g, "/") || ".";
}

function assertNotSecret(config, full) {
  if (config.allowSecrets) return;
  const name = path.basename(full);
  if (SECRET_FILES.has(name)) throw new Error("Refusing secret-like file by default: " + name);
}

function driveRoots() {
  if (process.platform !== "win32") return ["/", HOME];

  return "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("")
    .map(letter => letter + ":\\")
    .filter(root => {
      try {
        fs.accessSync(root);
        return true;
      } catch (e) {
        return false;
      }
    });
}

function itemKind(entry) {
  if (entry.isDirectory()) return "directory";
  if (entry.isFile()) return "file";
  if (entry.isSymbolicLink()) return "link";
  return "other";
}

async function listDirDetailed(config, p) {
  if (!config.tools.fsList) throw new Error("fsList disabled.");
  const full = safePath(config, p);
  const entries = await fsp.readdir(full, { withFileTypes: true });

  const items = entries
    .filter(e => !SKIP.has(e.name))
    .filter(e => config.allowSecrets || !SECRET_FILES.has(e.name))
    .slice(0, 250)
    .map(e => {
      const child = path.join(full, e.name);
      return {
        name: e.name,
        type: itemKind(e),
        path: rel(config, child),
        absolutePath: child,
        isDirectory: e.isDirectory()
      };
    });

  items.sort((a, b) => {
    if (a.isDirectory !== b.isDirectory) return a.isDirectory ? -1 : 1;
    return a.name.localeCompare(b.name);
  });

  return items;
}

async function treeText(config, p, depth, limit, state = { count: 0 }, prefix = "") {
  if (!config.tools.fsTree) throw new Error("fsTree disabled.");

  depth = Math.min(Number(depth || 2), 4);
  limit = Math.min(Number(limit || 150), 600);

  const full = safePath(config, p);
  const stat = await fsp.stat(full);
  const name = path.basename(full) || rel(config, full);

  if (state.count++ >= limit) return prefix + "...limit reached";
  if (!stat.isDirectory()) return prefix + name;

  let out = prefix + name + "/";
  if (depth <= 0) return out;

  const entries = await fsp.readdir(full, { withFileTypes: true });

  for (const e of entries.slice(0, 120)) {
    if (SKIP.has(e.name)) continue;
    if (!config.allowSecrets && SECRET_FILES.has(e.name)) continue;
    const childRel = path.join(rel(config, full), e.name);
    out += "\n" + await treeText(config, childRel, depth - 1, limit, state, prefix + "  ");
  }

  return out;
}

async function readText(config, p, maxChars = 12000) {
  if (!config.tools.fsRead) throw new Error("fsRead disabled.");
  const full = safePath(config, p);
  const ext = path.extname(full).toLowerCase();

  assertNotSecret(config, full);

  if (BIN.has(ext)) throw new Error("Refusing binary file as text: " + ext);

  const text = await fsp.readFile(full, "utf8");
  const truncated = text.length > maxChars;

  return {
    content: truncated ? text.slice(0, maxChars) : text,
    truncated
  };
}

async function writeText(config, p, content) {
  if (!config.tools.fsWrite) throw new Error("fsWrite disabled.");
  if (!config.allowWrite) throw new Error("Writes disabled.");

  const full = safePath(config, p);
  assertNotSecret(config, full);

  await fsp.mkdir(path.dirname(full), { recursive: true });
  await fsp.writeFile(full, content || "", "utf8");

  return {
    path: p,
    absolutePath: full,
    bytes: Buffer.byteLength(content || "")
  };
}

function normalizeWrites(payload) {
  if (Array.isArray(payload.writes)) {
    return payload.writes
      .filter(x => x && x.path)
      .map(x => ({ path: x.path, content: String(x.content || "") }));
  }

  if (payload.files && typeof payload.files === "object") {
    return Object.entries(payload.files).map(([filePath, content]) => ({
      path: filePath,
      content: String(content || "")
    }));
  }

  return [];
}

function execText(command, args) {
  return childProcess.execFileSync(command, args, {
    encoding: "utf8",
    windowsHide: true
  }).trim();
}

async function chooseFolderNative(defaultRoot) {
  if (process.platform === "win32") {
    const safeDefault = String(defaultRoot || HOME).replace(/'/g, "''");

    const ps = [
      "Add-Type -AssemblyName System.Windows.Forms;",
      "$d = New-Object System.Windows.Forms.FolderBrowserDialog;",
      "$d.Description = 'Choose Awtsmoos Tunnel Root Folder';",
      "$d.SelectedPath = '" + safeDefault + "';",
      "if ($d.ShowDialog() -eq 'OK') { [Console]::Write($d.SelectedPath) }"
    ].join(" ");

    return execText("powershell.exe", ["-NoProfile", "-STA", "-Command", ps]);
  }

  if (process.platform === "darwin") {
    return execText("osascript", ["-e", "POSIX path of (choose folder with prompt \"Choose Awtsmoos Tunnel Root Folder\")"]);
  }

  try {
    return execText("zenity", ["--file-selection", "--directory", "--title=Choose Awtsmoos Tunnel Root Folder"]);
  } catch (e) {
    return "";
  }
}

function publicConfig(config) {
  return {
    tunnelName: config.tunnelName,
    relay: config.relay,
    local: config.local,
    root: config.root,
    allowWrite: config.allowWrite,
    allowSecrets: config.allowSecrets,
    enableLocalHttpProxy: config.enableLocalHttpProxy,
    tools: config.tools,
    chrome: config.chrome,
    platform: process.platform,
    hostname: os.hostname(),
    home: HOME,
    roots: driveRoots()
  };
}

async function handleFs(payload, ws) {
  const config = loadConfig();
  const action = payload.action || "list";
  const p = payload.path || ".";
  const maxChars = Number(payload.maxChars || 12000);

  const actions = {
    async configGet() {
      return { ok: true, action, config: publicConfig(loadConfig()) };
    },

    async configSet() {
      const patch = {};

      if (payload.root) patch.root = String(payload.root);
      if (payload.local) patch.local = String(payload.local);
      if (payload.relay) patch.relay = String(payload.relay);
      if (payload.tunnelName) patch.tunnelName = String(payload.tunnelName);
      if (typeof payload.allowWrite === "boolean") patch.allowWrite = payload.allowWrite;
      if (typeof payload.allowSecrets === "boolean") patch.allowSecrets = payload.allowSecrets;
      if (typeof payload.enableLocalHttpProxy === "boolean") patch.enableLocalHttpProxy = payload.enableLocalHttpProxy;
      if (payload.tools && typeof payload.tools === "object") patch.tools = payload.tools;
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
          agentVersion: "split-agent-0.2.0"
        });
      }

      return { ok: true, action, config: publicConfig(next) };
    },

    async roots() {
      return { ok: true, action, roots: driveRoots(), home: HOME, cwd: process.cwd() };
    },

    async openRoot() {
      const target = payload.root || config.root;
      openSystemExplorer(target);
      return { ok: true, action, opened: target };
    },

    async chooseRoot() {
      const chosen = await chooseFolderNative(config.root);
      if (!chosen) return { ok: false, action, error: "no_folder_chosen" };

      const next = saveConfigPatch({ root: chosen });
      return { ok: true, action, chosen, config: publicConfig(next) };
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
  handleFs,
  publicConfig
};
