
// B"H

const vm = require("vm");
const fsp = require("fs/promises");
const path = require("path");
const crypto = require("crypto");

const { safePath } = require("../fs/pathGuard.js");
const { listDirDetailed } = require("../fs/listing.js");

function limitedConsole() {
  const logs = [];

  function one(x) {
    if (typeof x === "string") return x;
    try {
      return JSON.stringify(x);
    } catch (e) {
      return String(x);
    }
  }

  return {
    logs,
    console: {
      log: (...args) => logs.push(args.map(one).join(" ")),
      error: (...args) => logs.push("ERROR: " + args.map(one).join(" ")),
      warn: (...args) => logs.push("WARN: " + args.map(one).join(" "))
    }
  };
}

function sha256(text) {
  return crypto.createHash("sha256").update(String(text)).digest("hex");
}

async function runNodeScript(config, payload = {}) {
  if (!config.allowCommands || !config.tools.command || !config.command.enabled) {
    return {
      ok: false,
      action: "nodeScriptRun",
      error: "scripts_disabled",
      message: "Enable Allow terminal commands and Terminal tool, then Save Config."
    };
  }

  const scriptText = String(payload.scriptText || "").trim();

  if (!scriptText) {
    return { ok: false, action: "nodeScriptRun", error: "missing_script64_or_scriptText" };
  }

  const timeoutMs = Math.min(Number(payload.timeoutMs || 8000), 30000);
  const maxChars = Math.min(Number(payload.maxChars || 120000), 500000);
  const { logs, console } = limitedConsole();

  async function readText(relativePath, limit = maxChars) {
    const full = safePath(config, relativePath || ".");
    const text = await fsp.readFile(full, "utf8");
    const cap = Math.min(Number(limit || maxChars), maxChars);
    return text.length > cap ? text.slice(0, cap) : text;
  }

  async function read64(relativePath, maxBytes = 120000, offsetBytes = 0) {
    const full = safePath(config, relativePath || ".");
    const buf = await fsp.readFile(full);
    const off = Math.max(0, Number(offsetBytes || 0));
    const end = Math.min(buf.length, off + Math.min(Number(maxBytes || 120000), 120000));
    return {
      content64: buf.slice(off, end).toString("base64"),
      offsetBytes: off,
      returnedBytes: end - off,
      totalBytes: buf.length,
      truncated: end < buf.length,
      nextOffsetBytes: end < buf.length ? end : null
    };
  }

  async function writeText(relativePath, content) {
    if (!config.allowWrite || !config.tools.fsWrite) {
      throw new Error("writeText disabled. Enable writes and fsWrite first.");
    }

    const full = safePath(config, relativePath || ".");
    const text = String(content || "");

    if (Buffer.byteLength(text, "utf8") > 350000) {
      throw new Error("writeText payload too large. Split into smaller modules or smaller writes.");
    }

    await fsp.mkdir(path.dirname(full), { recursive: true });
    await fsp.writeFile(full, text, "utf8");

    return {
      path: relativePath,
      bytes: Buffer.byteLength(text, "utf8")
    };
  }

  async function list(relativePath) {
    return await listDirDetailed(config, relativePath || ".");
  }

  async function stat(relativePath) {
    const full = safePath(config, relativePath || ".");
    const st = await fsp.stat(full);
    return {
      path: relativePath,
      isFile: st.isFile(),
      isDirectory: st.isDirectory(),
      sizeBytes: st.size,
      mtimeMs: st.mtimeMs
    };
  }

  async function grep(relativePath, query, maxResults = 80) {
    const text = await readText(relativePath, maxChars);
    const q = String(query || "");
    const out = [];

    if (!q) return out;

    const lines = text.split(/\r?\n/);

    for (let i = 0; i < lines.length && out.length < maxResults; i++) {
      if (lines[i].includes(q)) {
        out.push({ line: i + 1, preview: lines[i].slice(0, 500) });
      }
    }

    return out;
  }

  const context = vm.createContext({
    input: payload.input || {},
    console,
    readText,
    read64,
    writeText,
    list,
    stat,
    grep,
    sha256,
    JSON,
    Math,
    Number,
    String,
    Boolean,
    Array,
    Object,
    Date,
    RegExp,
    Promise,
    setTimeout,
    clearTimeout
  });

  const wrapped = `
    (async () => {
      "use strict";
      ${scriptText}
    })()
  `;

  const startedAt = Date.now();

  try {
    const script = new vm.Script(wrapped, {
      filename: "awtsmoos-node-script.vm.js",
      timeout: timeoutMs
    });

    const result = await Promise.race([
      script.runInContext(context, { timeout: timeoutMs }),
      new Promise((_, reject) => setTimeout(() => reject(new Error("Script timeout")), timeoutMs))
    ]);

    return {
      ok: true,
      action: "nodeScriptRun",
      durationMs: Date.now() - startedAt,
      result,
      logs,
      helpers: ["readText", "read64", "writeText", "list", "stat", "grep", "sha256"]
    };
  } catch (e) {
    return {
      ok: false,
      action: "nodeScriptRun",
      durationMs: Date.now() - startedAt,
      error: e.message,
      stack: e.stack,
      logs
    };
  }
}

module.exports = { runNodeScript };
