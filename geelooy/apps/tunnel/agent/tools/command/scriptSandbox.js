
// B"H
const vm = require("vm");
const fsp = require("fs/promises");
const { safePath } = require("../fs/pathGuard.js");
const { listDirDetailed } = require("../fs/listing.js");

function limitedConsole() {
  const logs = [];

  return {
    logs,
    console: {
      log: (...args) => logs.push(args.map(x => typeof x === "string" ? x : JSON.stringify(x)).join(" ")),
      error: (...args) => logs.push("ERROR: " + args.map(x => typeof x === "string" ? x : JSON.stringify(x)).join(" ")),
      warn: (...args) => logs.push("WARN: " + args.map(x => typeof x === "string" ? x : JSON.stringify(x)).join(" "))
    }
  };
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
    return {
      ok: false,
      action: "nodeScriptRun",
      error: "missing_script64"
    };
  }

  const timeoutMs = Math.min(Number(payload.timeoutMs || 8000), 30000);
  const maxChars = Math.min(Number(payload.maxChars || 120000), 500000);
  const { logs, console } = limitedConsole();

  async function readText(relativePath) {
    const full = safePath(config, relativePath || ".");
    const text = await fsp.readFile(full, "utf8");

    if (text.length > maxChars) {
      return text.slice(0, maxChars);
    }

    return text;
  }

  async function list(relativePath) {
    return await listDirDetailed(config, relativePath || ".");
  }

  const context = vm.createContext({
    input: payload.input || {},
    console,
    readText,
    list,
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
      logs
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
