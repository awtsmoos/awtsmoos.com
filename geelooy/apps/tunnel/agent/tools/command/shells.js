
// B"H

function shellArgs(shell, command) {
  if (process.platform === "win32") {
    if (shell === "cmd") {
      return {
        file: "cmd.exe",
        args: ["/d", "/s", "/c", command]
      };
    }

    return {
      file: "powershell.exe",
      args: ["-NoProfile", "-ExecutionPolicy", "Bypass", "-Command", command]
    };
  }

  if (shell === "sh") {
    return {
      file: "sh",
      args: ["-lc", command]
    };
  }

  return {
    file: "bash",
    args: ["-lc", command]
  };
}

module.exports = { shellArgs };
