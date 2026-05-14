
// B"H

const { sendText } = require("./tools/respond.js");
const { readTunnelDownload } = require("./tools/sourceFile.js");

/**
 * B"H
 * Awtsmoos Tunnel install endpoint.
 *
 * Step 1 architecture:
 * - shell scripts are tiny bootstraps
 * - local machine downloads one quiet agent
 * - hosted control panel lives on awtsmoos.com
 * - no setup questions in terminal
 *
 * Public URLs:
 * /api/tunnel/install/windows
 * /api/tunnel/install/unix
 * /api/tunnel/install/agent
 * /api/tunnel/install/status
 */
module.exports = {
  dynamicRoutes: async $i => {
    $i.response.setHeader("Access-Control-Allow-Origin", "*");
    $i.response.setHeader("Cache-Control", "no-store");

    await $i.use("windows", async () => {
      return sendText(
        $i,
        readTunnelDownload("windows.ps1"),
        "text/plain; charset=utf-8"
      );
    });

    await $i.use("unix", async () => {
      return sendText(
        $i,
        readTunnelDownload("unix.sh"),
        "text/plain; charset=utf-8"
      );
    });

    await $i.use("agent", async () => {
      return sendText(
        $i,
        readTunnelDownload("awtsmoos-agent.js"),
        "application/javascript; charset=utf-8"
      );
    });

    await $i.use("status", async () => {
      return sendText($i, [
        "B\"H Awtsmoos Tunnel installer endpoint works.",
        "",
        "Windows PowerShell:",
        "irm https://awtsmoos.com/api/tunnel/install/windows | iex",
        "",
        "Windows CMD:",
        "powershell -ExecutionPolicy Bypass -Command \"irm https://awtsmoos.com/api/tunnel/install/windows | iex\"",
        "",
        "Mac/Linux:",
        "curl -fsSL https://awtsmoos.com/api/tunnel/install/unix | bash",
        "",
        "Hosted control panel:",
        "https://awtsmoos.com/geelooy/apps/tunnel-control",
        "",
        "Agent:",
        "https://awtsmoos.com/api/tunnel/install/agent"
      ].join("\n"), "text/plain; charset=utf-8");
    });
  }
};
