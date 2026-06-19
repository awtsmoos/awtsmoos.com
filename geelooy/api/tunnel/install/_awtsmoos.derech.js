// B"H
const { sendText } = require("./tools/respond.js");
const { readTunnelDownload } = require("./tools/sourceFile.js");
const { buildAgentZip, manifestFiles } = require("./tools/zipBundle.js");
 
function clean(text) {
  return String(text || "").replace(/^\uFEFF/, "");
}
 
module.exports = {
  dynamicRoutes: async $i => {
    $i.response.setHeader("Access-Control-Allow-Origin", "*");
    $i.response.setHeader("Cache-Control", "no-store");
 
    await $i.use("windows", async () => {
      return sendText(
        $i,
        clean(readTunnelDownload("windows.ps1")),
        "text/plain; charset=utf-8"
      );
    });
 
    await $i.use("linux", async () => {
      return sendText(
        $i,
        clean(readTunnelDownload("unix.sh")),
        "text/plain; charset=utf-8"
      );
    });
 
    await $i.use("unix", async () => {
      return sendText(
        $i,
        clean(readTunnelDownload("unix.sh")),
        "text/plain; charset=utf-8"
      );
    });

    await $i.use("bundle-manifest", async () => {
      return sendText(
        $i,
        JSON.stringify({
          ok: true,
          files: manifestFiles().length,
          bundles: [{ name: "agent", url: "/api/tunnel/install/agent.zip" }]
        }),
        "application/json; charset=utf-8"
      );
    });

    await $i.use("agent.zip", async () => {
      $i.response.statusCode = 200;
      $i.response.setHeader("Content-Type", "application/zip");
      $i.response.setHeader("Content-Disposition", "attachment; filename=\"awtsmoos-agent.zip\"");
      return { mimeType: "application/zip", response: buildAgentZip() };
    });
  }
};
