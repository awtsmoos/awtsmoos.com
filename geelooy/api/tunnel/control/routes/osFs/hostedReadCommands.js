// B"H
// Boruch Hashem
// Blessed is He
"use strict";

const path = require("node:path").posix;
const { cleanPath } = require("./path.js");

const OUTPUT_LIMIT = 64_000;
const READ_LIMIT = 128_000;
const MAX_ARGS = 24;
const MAX_COMMAND_CHARS = 4096;
const ALLOWED = Object.freeze(["pwd", "echo", "ls", "cat", "head", "tail", "wc", "grep", "find"]);

/**
 * Parse legacy command text without a shell, expansion, substitution or operators.
 * This is not a shell implementation; it is a strict token decoder for a closed command set.
 */
function tokenize(command) {
  const text = String(command || "");
  if (!text || text.length > MAX_COMMAND_CHARS || /[\x00-\x1f\x7f`$;&|<>\\]/.test(text)) {
    throw new Error("VIRTUAL_COMMAND_SHELL_SYNTAX_DENIED");
  }
  const tokens = [];
  let token = "", quote = "", active = false;
  for (const c of text) {
    if (c === quote && quote) { quote = ""; continue; }
    if ((c === "'" || c === '"') && !quote) { quote = c; active = true; continue; }
    if (/\s/.test(c) && !quote) {
      if (active) { tokens.push(token); token = ""; active = false; }
    } else { token += c; active = true; }
  }
  if (quote) throw new Error("VIRTUAL_COMMAND_UNTERMINATED_QUOTE");
  if (active) tokens.push(token);
  return tokens;
}

function specification(payload = {}) {
  let parts;
  if (payload.program !== undefined) {
    if (payload.command) throw new Error("VIRTUAL_COMMAND_AMBIGUOUS_INPUT");
    if (typeof payload.program !== "string" || !Array.isArray(payload.args || [])) {
      throw new Error("VIRTUAL_COMMAND_INVALID_ARGUMENTS");
    }
    parts = [payload.program, ...(payload.args || [])];
  } else {
    parts = tokenize(payload.command || "");
  }
  if (!parts.length || parts.length > MAX_ARGS + 1 ||
    parts.some(item => typeof item !== "string" || item.length > 1024 || /[\x00-\x1f\x7f]/.test(item))) {
    throw new Error("VIRTUAL_COMMAND_INVALID_ARGUMENTS");
  }
  const [program, ...args] = parts;
  if (!ALLOWED.includes(program)) throw new Error("VIRTUAL_COMMAND_POLICY_DENIED");
  if (payload.profile && !["readonly", "developer-safe", "virtual-readonly"].includes(payload.profile)) {
    throw new Error("VIRTUAL_COMMAND_PROFILE_DENIED");
  }
  const rawCwd = String(payload.cwd || ".");
  const cwd = workspacePath(".", rawCwd);
  return { program, args, cwd, profile: "virtual-readonly" };
}

/** Pass all paths through the existing hosted VFS jail; never touch the Node host filesystem. */
function workspacePath(cwd, input) {
  const value = String(input || ".");
  if (value.startsWith("/") || value.startsWith("~") || value.length > 1024) {
    throw new Error("VIRTUAL_COMMAND_PATH_DENIED");
  }
  const candidate = cleanPath(value); // rejects encoded ../, schemes and controls
  return cleanPath(candidate === "." ? cwd : cwd === "." ? candidate : path.join(cwd, candidate));
}

function bounded(text) {
  const value = String(text || "");
  return { text: value.slice(0, OUTPUT_LIMIT), truncated: value.length > OUTPUT_LIMIT };
}

/**
 * Execute useful read-only commands against the user's authenticated VFS, not a host shell.
 * The dispatch callback is always account-scoped by the existing hosted dispatcher.
 */
async function runHostedReadCommand(payload = {}, dispatch) {
  const started = Date.now();
  let spec;
  try {
    spec = specification(payload);
    if (typeof dispatch !== "function") throw new Error("VIRTUAL_COMMAND_DISPATCH_UNAVAILABLE");
    const result = await withTimeout(run(spec, dispatch), Math.min(10_000, Math.max(100, Number(payload.timeoutMs) || 5000)));
    const output = bounded(result.stdout);
    return {
      ok: true, action: "commandRun", vessel: "hosted-virtual-os", executionKind: "vfs-readonly",
      nativeShell: false, simulated: false, profile: spec.profile,
      program: spec.program, cwd: spec.cwd, stdout: output.text, stderr: "", exitCode: 0,
      truncated: output.truncated || Boolean(result.truncated), durationMs: Date.now() - started
    };
  } catch (error) {
    const code = /^VIRTUAL_COMMAND_/.test(error.message) ? error.message :
      /^virtual_os_/.test(error.message) ? "VIRTUAL_COMMAND_PATH_DENIED" : "VIRTUAL_COMMAND_ACTION_FAILED";
    return {
      ok: false, action: "commandRun", vessel: "hosted-virtual-os", executionKind: "vfs-readonly",
      nativeShell: false, simulated: false, profile: "virtual-readonly",
      program: spec?.program || null, stdout: "", stderr: code, error: code,
      exitCode: code === "VIRTUAL_COMMAND_POLICY_DENIED" ? 126 : 1,
      truncated: false, durationMs: Date.now() - started
    };
  }
}

async function run({ program, args, cwd }, dispatch) {
  const file = arg => workspacePath(cwd, arg);
  if (program === "pwd") {
    if (args.length) throw new Error("VIRTUAL_COMMAND_INVALID_ARGUMENTS");
    return { stdout: cwd + "\n" };
  }
  if (program === "echo") {
    return { stdout: args.join(" ") + "\n" };
  }
  if (program === "ls") {
    if (args.length > 1) throw new Error("VIRTUAL_COMMAND_INVALID_ARGUMENTS");
    const got = await invoke(dispatch, { action: "list", path: file(args[0] || ".") });
    return { stdout: (got.items || []).join("\n") + ((got.items || []).length ? "\n" : "") };
  }
  if (program === "find") {
    if (args.length > 1) throw new Error("VIRTUAL_COMMAND_INVALID_ARGUMENTS");
    const got = await invoke(dispatch, { action: "tree", path: file(args[0] || "."), depth: 3, limit: 100 });
    return { stdout: got.treeText || "" };
  }
  let name, flags = [];
  if (program === "grep") {
    flags = args.filter(a => a.startsWith("-") && ["-n", "-i"].includes(a));
    const remaining = args.filter(a => !flags.includes(a));
    if (remaining.length !== 2 || flags.length + remaining.length !== args.length) {
      throw new Error("VIRTUAL_COMMAND_INVALID_ARGUMENTS");
    }
    name = remaining[1];
    const got = await invoke(dispatch, { action: "read", path: file(name), maxChars: READ_LIMIT });
    if (got.truncated) throw new Error("VIRTUAL_COMMAND_INPUT_TOO_LARGE");
    const compare = flags.includes("-i") ? s => s.toLowerCase() : s => s;
    const needle = compare(remaining[0]);
    const selected = String(got.content || "").split(/\r?\n/)
      .map((line, index) => ({ line, number: index + 1 }))
      .filter(item => compare(item.line).includes(needle))
      .map(item => flags.includes("-n") ? `${item.number}:${item.line}` : item.line);
    return { stdout: selected.length ? selected.join("\n") + "\n" : "" };
  }
  if (program === "head" || program === "tail") {
    let n = 10;
    if (args[0] === "-n") {
      if (!/^\d{1,4}$/.test(args[1] || "")) throw new Error("VIRTUAL_COMMAND_INVALID_ARGUMENTS");
      n = Number(args[1]);
      if (n < 1 || n > 1000) throw new Error("VIRTUAL_COMMAND_INVALID_ARGUMENTS");
      name = args[2];
      if (args.length !== 3) throw new Error("VIRTUAL_COMMAND_INVALID_ARGUMENTS");
    } else { if (args.length !== 1) throw new Error("VIRTUAL_COMMAND_INVALID_ARGUMENTS"); name = args[0]; }
    const got = await invoke(dispatch, { action: "read", path: file(name), maxChars: READ_LIMIT });
    if (got.truncated) throw new Error("VIRTUAL_COMMAND_INPUT_TOO_LARGE");
    const lines = String(got.content || "").split(/\r?\n/);
    return { stdout: (program === "head" ? lines.slice(0, n) : lines.slice(-n)).join("\n") + "\n" };
  }
  if (program === "cat" || program === "wc") {
    if (args.length !== 1 && !(program === "wc" && args.length === 2 && ["-l", "-c", "-w"].includes(args[0]))) {
      throw new Error("VIRTUAL_COMMAND_INVALID_ARGUMENTS");
    }
    name = args[args.length - 1];
    const got = await invoke(dispatch, { action: "read", path: file(name), maxChars: READ_LIMIT });
    if (got.truncated) throw new Error("VIRTUAL_COMMAND_INPUT_TOO_LARGE");
    const content = String(got.content || "");
    if (program === "cat") return { stdout: content };
    const counts = {
      "-l": (content.match(/\n/g) || []).length,
      "-c": Buffer.byteLength(content),
      "-w": content.trim() ? content.trim().split(/\s+/).length : 0
    };
    return { stdout: `${counts[args[0] || "-l"]} ${name}\n` };
  }
  throw new Error("VIRTUAL_COMMAND_POLICY_DENIED");
}

async function invoke(dispatch, payload) {
  const result = await dispatch(payload);
  if (!result || result.ok !== true) {
    throw new Error(result?.error === "alias_not_owned" ? "VIRTUAL_COMMAND_PATH_DENIED" : "VIRTUAL_COMMAND_READ_FAILED");
  }
  return result;
}

async function withTimeout(promise, ms) {
  let timer;
  try { return await Promise.race([promise, new Promise((resolve, reject) => { timer = setTimeout(() => reject(new Error("VIRTUAL_COMMAND_TIMEOUT")), ms); })]); }
  finally { clearTimeout(timer); }
}

module.exports = { ALLOWED, OUTPUT_LIMIT, runHostedReadCommand, specification, tokenize, workspacePath };
