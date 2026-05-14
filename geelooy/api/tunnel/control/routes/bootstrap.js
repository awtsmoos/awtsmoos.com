
// B"H
const { json } = require("../core/respond.js");

async function bootstrap($i) {
  return json($i, {
    BH: "B\"H",
    ok: true,
    name: "Awtsmoos Tunnel Control Bootstrap",
    setupUrl: "https://awtsmoos.com/apps/tunnel-control/",
    installCommandWindows: "irm https://awtsmoos.com/api/tunnel/install/windows | iex",
    installCommandMacLinux: "curl -fsSL https://awtsmoos.com/api/tunnel/install/unix | bash",
    docsHuman: "https://awtsmoos.com/api/tunnel/control/docs",
    docsJson: "https://awtsmoos.com/api/tunnel/control/docs.json",
    openapi: "https://awtsmoos.com/api/tunnel/control/openapi",
    privacyPolicy: "https://awtsmoos.com/apps/tunnel-control/privacy.html",
    howToGetTunnelName: [
      "Open the setup URL.",
      "Run the installer.",
      "The hosted control panel opens with ?tunnelName=awt-...",
      "Copy the tunnelName from the URL or dashboard and paste it into the GPT chat."
    ],
    firstUserPrompt: "Please open https://awtsmoos.com/apps/tunnel-control/ and run the installer. When the control panel opens, copy the tunnelName from the URL or dashboard and paste it here. It should look like awt-your-name-1234.",
    gptBehavior: [
      "Never assume or hardcode a tunnelName.",
      "Ask the user for their tunnelName if missing.",
      "After receiving tunnelName, call awtsmoosTunnelAction with action=list and p=.",
      "Then call action=tree with p=., depth=2, limit=150.",
      "Use read/bulk before writing.",
      "Use write/bulkWrite only after explaining exact paths and changes.",
      "Use commandRun only when the user approves diagnostics/tests.",
      "Use nodeScriptRun for sandboxed calculations/analysis.",
      "Use Chrome actions only when browser testing is needed."
    ]
  });
}

module.exports = { bootstrap };
