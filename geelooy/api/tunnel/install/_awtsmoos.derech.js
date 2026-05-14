
// B"H

const { sendText } = require("./tools/respond.js");
const { readTunnelDownload } = require("./tools/sourceFile.js");

/**
 * B"H
 * Awtsmoos Tunnel installer endpoint.
 *
 * The shell scripts are now tiny bootstraps.
 * They download one local Node control app, start it, and let the browser UI
 * guide the user through tunnel name, project root, write permissions, tests,
 * status, and GPT setup text.
 *
 * Public URLs:
 * /api/tunnel/install/windows
 * /api/tunnel/install/unix
 * /api/tunnel/install/local-app
 * /api/tunnel/install/status
 *
 * @type {object}
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

    await $i.use("local-app", async () => {
      return sendText(
        $i,
        readTunnelDownload("awtsmoos-local-app.js"),
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
        "Local app:",
        "https://awtsmoos.com/api/tunnel/install/local-app"
      ].join("\n"), "text/plain; charset=utf-8");
    });
  }
};
