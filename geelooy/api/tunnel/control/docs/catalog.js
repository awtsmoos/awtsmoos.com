
// B"H

const apiCatalog = {
  BH: "B\"H",
  name: "Awtsmoos Tunnel Control API",
  version: "1.3.0",
  baseUrl: "https://awtsmoos.com",
  actionSchema: "https://awtsmoos.com/api/tunnel/control/openapi",
  machineDocs: "https://awtsmoos.com/api/tunnel/control/docs.json",
  wallet: "https://awtsmoos.com/apps/wallet/",
  auth: {
    dashboardSession: "Browser login is allowed for setup/root-picker/wallet actions.",
    apiKey: {
      header: "x-awtsmoos-api-key",
      format: "ak_..."
    },
    oauth: {
      type: "authorization_code",
      authorizationUrl: "https://awtsmoos.com/api/oauth/authorize",
      tokenUrl: "https://awtsmoos.com/api/oauth/token",
      scopes: [
        "profile",
        "tunnel.read",
        "tunnel.write",
        "tunnel.command",
        "tunnel.browser",
        "tunnel.admin"
      ]
    }
  },
  actions: [
    { action: "list", scope: "tunnel.read", params: ["p"], summary: "List a folder under the approved root." },
    { action: "tree", scope: "tunnel.read", params: ["p", "depth", "limit"], summary: "Capped tree view." },
    { action: "read", scope: "tunnel.read", params: ["p", "maxChars"], summary: "Read one text file." },
    { action: "md", scope: "tunnel.read", params: ["p", "maxChars"], summary: "Read one file wrapped as markdown code." },
    { action: "bulk", scope: "tunnel.read", params: ["paths64", "maxChars"], summary: "Bulk read specific paths." },
    { action: "write", scope: "tunnel.write", params: ["p", "content64"], summary: "Write one file." },
    { action: "bulkWrite", scope: "tunnel.write", params: ["files64"], summary: "Write many files." },
    { action: "commandRun", scope: "tunnel.command", params: ["command64", "shell", "cwd", "timeoutMs"], summary: "Run an approved terminal command." },
    { action: "nodeScriptRun", scope: "tunnel.command", params: ["script64", "input64"], summary: "Run sandboxed JavaScript with readText/list helpers only." },
    { action: "chromeFind", scope: "tunnel.browser", params: [], summary: "Find Chrome/Edge." },
    { action: "chromeLaunch", scope: "tunnel.browser", params: ["chromePath", "port"], summary: "Launch/connect Chrome DevTools." },
    { action: "chromeStatus", scope: "tunnel.browser", params: ["port"], summary: "Inspect Chrome pages." },
    { action: "chromeNavigate", scope: "tunnel.browser", params: ["url"], summary: "Navigate a page." },
    { action: "chromeWaitForSelector", scope: "tunnel.browser", params: ["selector"], summary: "Wait for selector." },
    { action: "chromeClick", scope: "tunnel.browser", params: ["selector"], summary: "Click selector." },
    { action: "chromeType", scope: "tunnel.browser", params: ["selector", "text64"], summary: "Type into selector." },
    { action: "chromeEval", scope: "tunnel.browser", params: ["expression64"], summary: "Evaluate page JavaScript." },
    { action: "chromeRunScript", scope: "tunnel.browser", params: ["script64"], summary: "Run a JSON browser automation script." }
  ],
  nodeScriptExample: {
    action: "nodeScriptRun",
    script: "const pkg = await readText('package.json'); console.log(pkg.slice(0, 120)); return { length: pkg.length };"
  },
  chromeScriptExample: [
    { "type": "goto", "url": "https://awtsmoos.com" },
    { "type": "waitForSelector", "selector": "body" },
    { "type": "eval", "expression": "document.title" }
  ]
};

module.exports = { apiCatalog };
