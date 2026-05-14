
// B"H
const childProcess = require("child_process");
const path = require("path");
const { shellArgs } = require("./shells.js");

function safeCwd(config, given) {
  const root = path.resolve(config.root);
  const cwd = given
    ? (path.isAbsolute(given) ? path.resolve(given) : path.resolve(root, given))
    : root;

  if (!cwd.toLowerCase().startsWith(root.toLowerCase())) {
    throw new Error("Command cwd outside root is blocked: " + cwd);
  }

  return cwd;
}

function trimOutput(text, max) {
  text = String(text || "");
  if (text.length <= max) {
    return {
      text,
      truncated: false
    };
  }

  return {
    text: text.slice(0, max),
    truncated: true
  };
}

async function runCommand(config, payload = {}) {
  if (!config.allowCommands || !config.tools.command || !config.command.enabled) {
    return {
      ok: false,
      action: "commandRun",
      error: "commands_disabled",
      message: "Enable Allow terminal commands and Terminal tool in the dashboard, then Save Config."
    };
  }

  const command = String(payload.command || "").trim();

  if (!command) {
    return {
      ok: false,
      action: "commandRun",
      error: "missing_command"
    };
  }

  const shell = payload.shell || config.command.defaultShell || (process.platform === "win32" ? "powershell" : "bash");
  const cwd = safeCwd(config, payload.cwd || ".");
  const timeoutMs = Math.min(Number(payload.timeoutMs || config.command.timeoutMs || 20000), 120000);
  const maxOutput = Math.min(Number(payload.maxChars || config.command.maxOutput || 120000), 500000);
  const picked = shellArgs(shell, command);

  return await new Promise(resolve => {
    const startedAt = Date.now();

    childProcess.execFile(
      picked.file,
      picked.args,
      {
        cwd,
        timeout: timeoutMs,
        windowsHide: false,
        maxBuffer: maxOutput + 20000
      },
      (err, stdout, stderr) => {
        const out = trimOutput(stdout, maxOutput);
        const er = trimOutput(stderr, maxOutput);

        resolve({
          ok: !err,
          action: "commandRun",
          command,
          shell,
          cwd,
          exitCode: err?.code ?? 0,
          signal: err?.signal || null,
          durationMs: Date.now() - startedAt,
          stdout: out.text,
          stderr: er.text,
          truncated: out.truncated || er.truncated,
          error: err ? err.message : null
        });
      }
    );
  });
}

module.exports = {
  runCommand
};
