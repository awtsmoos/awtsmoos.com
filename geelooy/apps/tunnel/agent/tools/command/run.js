// B"H
const childProcess = require("child_process");
const path = require("path");
const fsp = require("fs/promises");
const crypto = require("crypto");
const { FOUR_MINUTES_MS } = require("../../lib/config.js");
const { shellArgs, fallbackShellArgs } = require("./shells.js");

function cleanRel(given, root) {
  let s = String(given || ".").replace(/\\/g, "/").replace(/^\/+/, "");
  const rootName = path.basename(root).toLowerCase();

  if (s.toLowerCase() === rootName) return ".";
  if (s.toLowerCase().startsWith(rootName + "/")) s = s.slice(rootName.length + 1);

  return s || ".";
}

function safeCwd(config, given) {
  const root = path.resolve(config.root);
  const raw = String(given || ".").trim();
  const cwd = path.isAbsolute(raw)
    ? path.resolve(raw)
    : path.resolve(root, cleanRel(raw, root));

  if (!cwd.toLowerCase().startsWith(root.toLowerCase())) {
    throw new Error("Command cwd outside root is blocked: " + cwd);
  }

  return cwd;
}

function trimOutput(text, max) {
  text = String(text || "");
  return text.length <= max ? { text, truncated: false } : { text: text.slice(0, max), truncated: true };
}

async function spillOutput(config, kind, text) {
  const dir = path.join(config.root, ".awtsmoos", "command-output");
  await fsp.mkdir(dir, { recursive: true });
  const id = `cmdout_${Date.now().toString(36)}_${crypto.randomBytes(4).toString("hex")}_${kind}.txt`;
  const rel = `.awtsmoos/command-output/${id}`;
  await fsp.writeFile(path.join(config.root, rel), String(text || ""), "utf8");
  return { ref: rel, bytes: Buffer.byteLength(String(text || ""), "utf8") };
}

async function spillOutput(config, kind, text) {
  const dir = path.join(config.root, ".awtsmoos", "command-output");
  await fsp.mkdir(dir, { recursive: true });
  const id = `cmdout_${Date.now().toString(36)}_${crypto.randomBytes(4).toString("hex")}_${kind}.txt`;
  const rel = `.awtsmoos/command-output/${id}`;
  await fsp.writeFile(path.join(config.root, rel), String(text || ""), "utf8");
  return { ref: rel, bytes: Buffer.byteLength(String(text || ""), "utf8") };
}

/**
 * B"H
 * Bounds local command time so real builds can breathe but frozen commands do not rule forever.
 *
 * @param {*} value Requested timeout.
 * @param {number} fallback Fallback timeout.
 * @returns {number} Timeout in milliseconds.
 */
function boundedTimeout(value, fallback = FOUR_MINUTES_MS) {
  const n = Number(value || fallback || FOUR_MINUTES_MS);
  if (!Number.isFinite(n)) return FOUR_MINUTES_MS;
  return Math.max(1000, Math.min(Math.floor(n), FOUR_MINUTES_MS));
}

function execPicked(config, picked, command, cwd, timeoutMs, maxOutput) {
  return new Promise(resolve => {
    const startedAt = Date.now();

    childProcess.execFile(
      picked.file,
      picked.args,
      { cwd, timeout: timeoutMs, windowsHide: false, maxBuffer: maxOutput + 20000 },
      async (err, stdout, stderr) => {
        const out = trimOutput(stdout, maxOutput);
        const er = trimOutput(stderr, maxOutput);
        const stdoutSpill = out.truncated ? await spillOutput(config, "stdout", stdout) : null;
        const stderrSpill = er.truncated ? await spillOutput(config, "stderr", stderr) : null;
        const durationMs = Date.now() - startedAt;
        const timedOut =
          err?.killed === true ||
          err?.signal === "SIGTERM" ||
          /timed out|timeout/i.test(err?.message || "");

        resolve({
          err,
          response: {
            ok: !err,
            action: "commandRun",
            command,
            shell: picked.shell,
            shellFile: picked.file,
            cwd,
            exitCode: err?.code ?? 0,
            signal: err?.signal || null,
            durationMs,
            timeoutMs,
            timedOut,
            stdout: out.text,
            stderr: er.text,
            stdoutRef: stdoutSpill?.ref || null,
            stderrRef: stderrSpill?.ref || null,
            stdoutBytes: stdoutSpill?.bytes || Buffer.byteLength(String(stdout || ""), "utf8"),
            stderrBytes: stderrSpill?.bytes || Buffer.byteLength(String(stderr || ""), "utf8"),
            truncated: out.truncated || er.truncated,
            guidance: out.truncated || er.truncated ? "Read stdoutRef/stderrRef with the read action for the full captured output." : null,
            error: err ? err.message : null
          }
        });
      }
    );
  });
}

async function runCommand(config, payload = {}) {
  if (!config.allowCommands || !config.tools.command || !config.command.enabled) {
    return { ok: false, action: "commandRun", error: "commands_disabled", message: "Enable commands, then Save Config." };
  }

  const command = String(payload.command || "").trim();
  if (!command) return { ok: false, action: "commandRun", error: "missing_command" };

  const shell = payload.shell || config.command.defaultShell || (process.platform === "win32" ? "powershell" : "bash");
  const cwd = safeCwd(config, payload.cwd || ".");
  const timeoutMs = boundedTimeout(payload.timeoutMs, config.command.timeoutMs);
  const maxOutput = Number(payload.maxChars || config.command.maxOutput || 120000);
  const first = await execPicked(config, shellArgs(shell, command), command, cwd, timeoutMs, maxOutput);

  if (first.err && first.err.code === "ENOENT") {
    const second = await execPicked(config, fallbackShellArgs(command), command, cwd, timeoutMs, maxOutput);
    second.response.firstShellError = first.response.error;
    return second.response;
  }

  return first.response;
}

module.exports = { runCommand, safeCwd, boundedTimeout };
