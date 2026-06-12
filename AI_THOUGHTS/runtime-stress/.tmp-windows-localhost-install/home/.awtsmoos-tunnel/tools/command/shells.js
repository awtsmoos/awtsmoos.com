
// B"H
const fs = require("fs");
const path = require("path");

function exists(p) {
  try { fs.accessSync(p); return true; }
  catch (_e) { return false; }
}

function firstExisting(paths, fallback) {
  return paths.find(exists) || fallback;
}

function winSystem32(name) {
  const root = process.env.SystemRoot || process.env.WINDIR || "C:\\Windows";
  return path.join(root, "System32", name);
}

function winShell(shell) {
  const wanted = String(shell || "").toLowerCase();

  if (wanted === "cmd") {
    return {
      file: firstExisting([winSystem32("cmd.exe")], "cmd.exe"),
      argsFor: command => ["/d", "/s", "/c", command],
      shell: "cmd"
    };
  }

  if (wanted === "pwsh") {
    return {
      file: firstExisting([
        "C:\\Program Files\\PowerShell\\7\\pwsh.exe",
        "C:\\Program Files (x86)\\PowerShell\\7\\pwsh.exe"
      ], "pwsh.exe"),
      argsFor: command => ["-NoProfile", "-ExecutionPolicy", "Bypass", "-Command", command],
      shell: "pwsh"
    };
  }

  const ps = firstExisting([
    winSystem32("WindowsPowerShell\\v1.0\\powershell.exe"),
    "C:\\Windows\\Sysnative\\WindowsPowerShell\\v1.0\\powershell.exe",
    "powershell.exe"
  ], "powershell.exe");

  return {
    file: ps,
    argsFor: command => ["-NoProfile", "-ExecutionPolicy", "Bypass", "-Command", command],
    shell: "powershell"
  };
}

function shellArgs(shell, command) {
  if (process.platform === "win32") {
    const picked = winShell(shell || "powershell");
    return { file: picked.file, args: picked.argsFor(command), shell: picked.shell };
  }

  if (shell === "sh") return { file: "sh", args: ["-lc", command], shell: "sh" };
  return { file: "bash", args: ["-lc", command], shell: "bash" };
}

function fallbackShellArgs(command) {
  if (process.platform === "win32") return shellArgs("cmd", command);
  return shellArgs("sh", command);
}

module.exports = { shellArgs, fallbackShellArgs };
