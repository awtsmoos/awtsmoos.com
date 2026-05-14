
// B"H

const { sendText } = require("./tools/respond.js");
const { readTunnelDownload } = require("./tools/sourceFile.js");

/**
 * B"H
 * Installer endpoint.
 *
 * IMPORTANT:
 * The actual Node agent is no longer served through this dynamic API route.
 * Dynamic routes may wrap responses depending on the server pipeline, which can
 * corrupt JS downloads. The agent is now static public content under:
 *
 *   /apps/tunnel/agent/manifest.json
 *   /apps/tunnel/agent/main.js
 *
 * This route only serves tiny bootstrap scripts and status text.
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
        "Static agent manifest:",
        "https://awtsmoos.com/apps/tunnel/agent/manifest.json",
        "",
        "Hosted control panel:",
        "https://awtsmoos.com/apps/tunnel-control/"
      ].join("\n"), "text/plain; charset=utf-8");
    });

    await $i.use("agent", async () => {
      return sendText($i, [
        "B\"H",
        "Do not download the agent from this API route anymore.",
        "Use the static manifest instead:",
        "https://awtsmoos.com/apps/tunnel/agent/manifest.json"
      ].join("\n"), "text/plain; charset=utf-8");
    });
  }
};
