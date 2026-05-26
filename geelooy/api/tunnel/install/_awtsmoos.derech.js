// B"H
const { sendText } = require("./tools/respond.js");
const { readTunnelDownload } = require("./tools/sourceFile.js");
 
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
 
    await $i.use("linux", async () => {
      return sendText(
        $i,
        readTunnelDownload("linux.sh"),
        "text/plain; charset=utf-8"
      );
    });
 
    await $i.use("unix", async () => {
      return sendText(
        $i,
        readTunnelDownload("linux.sh"),
        "text/plain; charset=utf-8"
      );
    });
 
    await $i.use("status", async () => {
      return sendText(
        $i,
        [
          'B"H Awtsmoos Tunnel installer endpoint works.',
          "",
          "Windows:",
          "irm https://awtsmoos.com/api/tunnel/install/windows | iex",
          "",
          "Linux/Mac:",
          "curl -fsSL https://awtsmoos.com/api/tunnel/install/linux | bash",
          "",
          "Manifest:",
          "https://awtsmoos.com/apps/tunnel/agent/manifest.txt"
        ].join("\n"),
        "text/plain; charset=utf-8"
      );
    });
  }
};