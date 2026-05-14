
// B"H
const { json } = require("../core/respond.js");

async function bootstrap($i) {
  return json($i, {
    BH: "B\"H",
    ok: true,
    name: "Awtsmoos Tunnel Control Bootstrap",
    setupUrl: "https://awtsmoos.com/apps/tunnel-control/",
    controlPanelUrl: "https://awtsmoos.com/apps/tunnel-control/",
    installCommandWindows: "irm https://awtsmoos.com/api/tunnel/install/windows | iex",
    restartCommandWindows: "irm https://awtsmoos.com/api/tunnel/install/windows | iex",
    installCommandMacLinux: "curl -fsSL https://awtsmoos.com/api/tunnel/install/unix | bash",
    restartCommandMacLinux: "curl -fsSL https://awtsmoos.com/api/tunnel/install/unix | bash",
    docsHuman: "https://awtsmoos.com/api/tunnel/control/docs",
    docsJson: "https://awtsmoos.com/api/tunnel/control/docs.json",
    openapi: "https://awtsmoos.com/api/tunnel/control/openapi",
    myDevice: "https://awtsmoos.com/api/tunnel/control/my-device",
    privacyPolicy: "https://awtsmoos.com/apps/tunnel-control/privacy.html",

    modes: {
      installNew: {
        userSays: ["install", "set up", "I don't have it"],
        response: "Open the setup page and run the installer command for your OS. After it says connected, I can auto-detect your one connected tunnel after Awtsmoos login."
      },
      alreadyInstalled: {
        userSays: ["already installed", "start it", "restart it", "I have it"],
        response: "Run the same installer command again. It refreshes the agent, reuses your saved tunnel name, and starts the tunnel."
      },
      oauthAutoDetect: {
        userSays: ["I'm logged in", "connected", "start"],
        response: "After OAuth sign-in, call /api/tunnel/control/my-device. If exactly one tunnel is connected, use its tunnelName automatically."
      },
      manualFallback: {
        userSays: ["auto detect failed"],
        response: "Ask the user to copy tunnelName from the control panel URL or dashboard."
      }
    },

    howToGetTunnelName: [
      "Best: Sign in with Awtsmoos OAuth, then call /api/tunnel/control/my-device.",
      "If exactly one local agent is connected, the API returns the tunnelName automatically.",
      "Fallback: open https://awtsmoos.com/apps/tunnel-control/ and copy the tunnelName from the URL or dashboard."
    ],

    firstUserPrompt: "Are you installing Awtsmoos Tunnel for the first time, or is it already installed and you just need to start it?",

    gptBehavior: [
      "Do not hardcode a tunnelName.",
      "First ask whether the user needs installation or already has the agent installed.",
      "If installing, give the setup page and OS command.",
      "If already installed, tell the user to run the same installer command again to restart/reuse saved config.",
      "After OAuth sign-in, call awtsmoosMyDevice.",
      "If my-device returns exactly one connected tunnel, use that tunnelName automatically.",
      "Only ask the user to paste tunnelName if my-device returns no tunnel or multiple tunnels.",
      "After tunnelName is known, call list with p=.",
      "Then call tree with p=., depth=2, limit=150.",
      "For bulk reads, use maxFiles=3, maxChars=8000, totalMaxChars=24000 by default.",
      "Never bulk read the whole app at once."
    ]
  });
}

module.exports = { bootstrap };
