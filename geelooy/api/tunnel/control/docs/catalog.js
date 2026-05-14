
// B"H

const apiCatalog = {
  BH: "B\"H",
  name: "Awtsmoos Tunnel Control API",
  version: "1.1.0",
  baseUrl: "https://awtsmoos.com",
  auth: {
    dashboardSession: "Browser login is allowed for setup/root-picker actions only.",
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
  endpoints: [
    {
      id: "me",
      method: "GET",
      path: "/api/tunnel/control/me",
      auth: "session, api key, or OAuth",
      description: "Returns current identity and dashboard auth status."
    },
    {
      id: "device",
      method: "GET",
      path: "/api/tunnel/control/device?tunnelName=NAME",
      auth: "session",
      description: "Checks whether the named local tunnel is connected."
    },
    {
      id: "apiKeys",
      method: "GET",
      path: "/api/tunnel/control/api-keys",
      auth: "session",
      description: "Lists server-side key records for the logged-in user. Raw key secret is not shown again."
    },
    {
      id: "createApiKey",
      method: "GET/POST",
      path: "/api/tunnel/control/api-keys/create",
      auth: "session",
      description: "Creates a scoped API key. Copy the returned raw key immediately."
    },
    {
      id: "usage",
      method: "GET",
      path: "/api/tunnel/control/usage",
      auth: "session",
      description: "Returns usage rows, total requests, daily bytes, and rate-limit data."
    },
    {
      id: "tunnel",
      method: "GET",
      path: "/api/tunnel/control/fs/{tunnelName}",
      auth: "API key or OAuth for file/terminal/browser actions",
      description: "Main tunnel bridge endpoint. Select the action query param."
    },
    {
      id: "openapi",
      method: "GET",
      path: "/api/tunnel/control/openapi",
      auth: "public",
      description: "OpenAPI YAML for Custom GPT Actions."
    },
    {
      id: "docs",
      method: "GET",
      path: "/api/tunnel/control/docs",
      auth: "public",
      description: "Human-readable API docs."
    },
    {
      id: "docsJson",
      method: "GET",
      path: "/api/tunnel/control/docs.json",
      auth: "public",
      description: "Machine-readable docs for other AIs and tools."
    }
  ],
  actions: [
    { action: "list", scope: "tunnel.read", params: ["p"] },
    { action: "tree", scope: "tunnel.read", params: ["p", "depth", "limit"] },
    { action: "read", scope: "tunnel.read", params: ["p", "maxChars"] },
    { action: "md", scope: "tunnel.read", params: ["p", "maxChars"] },
    { action: "bulk", scope: "tunnel.read", params: ["paths64", "maxChars"] },
    { action: "write", scope: "tunnel.write", params: ["p", "content64"] },
    { action: "bulkWrite", scope: "tunnel.write", params: ["files64 or writes64"] },
    { action: "configGet", scope: "session safe", params: [] },
    { action: "configSet", scope: "session safe", params: ["root", "allowWrite", "allowCommands", "tools64", "commandConfig64", "chrome64"] },
    { action: "rootBrowse", scope: "session safe", params: ["absolutePath"] },
    { action: "rootSelect", scope: "session safe", params: ["absolutePath"] },
    { action: "commandRun", scope: "tunnel.command", params: ["command64", "shell", "cwd", "timeoutMs"] },
    { action: "chromeFind", scope: "tunnel.browser", params: [] },
    { action: "chromeLaunch", scope: "tunnel.browser", params: ["chromePath", "port"] },
    { action: "chromeStatus", scope: "tunnel.browser", params: ["port"] },
    { action: "chromeNavigate", scope: "tunnel.browser", params: ["url", "port"] },
    { action: "chromeWaitForSelector", scope: "tunnel.browser", params: ["selector", "timeoutMs"] },
    { action: "chromeClick", scope: "tunnel.browser", params: ["selector"] },
    { action: "chromeType", scope: "tunnel.browser", params: ["selector", "text64"] },
    { action: "chromeEval", scope: "tunnel.browser", params: ["expression64"] },
    { action: "chromeRunScript", scope: "tunnel.browser", params: ["script64"] }
  ],
  scriptExample: [
    { "type": "goto", "url": "https://awtsmoos.com" },
    { "type": "waitForSelector", "selector": "body" },
    { "type": "eval", "expression": "document.title" }
  ]
};

module.exports = { apiCatalog };
