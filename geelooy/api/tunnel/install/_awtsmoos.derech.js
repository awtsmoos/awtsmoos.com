
// B"H

const { sendText } = require("./tools/respond.js");
const { windowsInstaller } = require("./scripts/windows.js");
const { unixInstaller } = require("./scripts/unix.js");
const { tunnelClient } = require("./scripts/client.js");

/**
 * B"H
 * Awtsmoos Tunnel install endpoint.
 *
 * This endpoint serves raw installer/client text through the dynamic API layer,
 * avoiding static-file MIME/routing issues with .ps1 and .sh downloads.
 *
 * Public URLs:
 * /api/tunnel/install/windows
 * /api/tunnel/install/unix
 * /api/tunnel/install/client
 *
 * @type {object}
 */
module.exports = {
  dynamicRoutes: async $i => {
    $i.response.setHeader("Access-Control-Allow-Origin", "*");
    $i.response.setHeader("Cache-Control", "no-store");

    await $i.use("windows", async () => {
      return sendText($i, windowsInstaller(), "text/plain; charset=utf-8");
    });

    await $i.use("unix", async () => {
      return sendText($i, unixInstaller(), "text/plain; charset=utf-8");
    });

    await $i.use("client", async () => {
      return sendText($i, tunnelClient(), "application/javascript; charset=utf-8");
    });

    await $i.use("status", async () => {
      return sendText($i, [
        "B\"H Awtsmoos Tunnel installer endpoint works.",
        "",
        "Windows:",
        "irm https://awtsmoos.com/api/tunnel/install/windows | iex",
        "",
        "CMD:",
        "powershell -ExecutionPolicy Bypass -Command \"irm https://awtsmoos.com/api/tunnel/install/windows | iex\"",
        "",
        "Mac/Linux:",
        "curl -fsSL https://awtsmoos.com/api/tunnel/install/unix | bash"
      ].join("\n"), "text/plain; charset=utf-8");
    });
  }
};
