
// B"H
const childProcess = require("child_process");
const path = require("path");
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

function execPicked(picked, command, cwd, timeoutMs, maxOutput) {
  return new Promise(resolve => {
    const startedAt = Date.now();

    childProcess.execFile(
      picked.file,
      picked.args,
      { cwd, timeout: timeoutMs, windowsHide: false, maxBuffer: maxOutput + 20000 },
      (err, stdout, stderr) => {
        const out = trimOutput(stdout, maxOutput);
        const er = trimOutput(stderr, maxOutput);

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
            durationMs: Date.now() - startedAt,
            stdout: out.text,
            stderr: er.text,
            truncated: out.truncated || er.truncated,
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
  const timeoutMs = Number(payload.timeoutMs || config.command.timeoutMs || 20000);
  const maxOutput = Number(payload.maxChars || config.command.maxOutput || 120000);
  const first = await execPicked(shellArgs(shell, command), command, cwd, timeoutMs, maxOutput);

  if (first.err && first.err.code === "ENOENT") {
    const second = await execPicked(fallbackShellArgs(command), command, cwd, timeoutMs, maxOutput);
    second.response.firstShellError = first.response.error;
    return second.response;
  }

  return first.response;
}

module.exports = { runCommand, safeCwd };
