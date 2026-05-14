
// B"H

import { $ } from "../lib/dom.js";
import { callFs } from "../api/tunnel.js";

function render(got) {
  if (!got.ok) {
    return [
      "FAILED",
      got.error || "",
      got.message || "",
      got.stderr || ""
    ].filter(Boolean).join("\n");
  }

  return [
    "Exit code: " + got.exitCode,
    "Duration: " + got.durationMs + "ms",
    "",
    "STDOUT:",
    got.stdout || "",
    "",
    "STDERR:",
    got.stderr || ""
  ].join("\n");
}

export function mountTerminal(getTunnelName) {
  $("runCommandBtn").onclick = async () => {
    $("commandOut").textContent = "Running...";

    const got = await callFs(getTunnelName(), {
      action: "commandRun",
      command: $("commandText").value,
      shell: $("commandShell").value,
      cwd: $("commandCwd").value,
      timeoutMs: $("commandTimeout").value
    });

    $("commandOut").textContent = render(got);
  };
}
