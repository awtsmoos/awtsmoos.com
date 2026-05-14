
// B"H

const apiCatalog = {
  BH: "B\"H",
  ok: true,
  name: "Awtsmoos Tunnel Control API",
  version: "1.6.0",
  base: "https://awtsmoos.com",
  setup: {
    controlPanel: "https://awtsmoos.com/apps/tunnel-control/",
    windows: "irm https://awtsmoos.com/api/tunnel/install/windows | iex",
    unix: "curl -fsSL https://awtsmoos.com/api/tunnel/install/unix | bash",
    openapiOAuth: "https://awtsmoos.com/api/tunnel/control/openapi",
    openapiApiKey: "https://awtsmoos.com/api/tunnel/control/openapi-key"
  },
  bulkReadPolicy: {
    summary: "Bulk reads are capped to avoid GPT/tool-call timeouts.",
    recommended: {
      maxFiles: 3,
      maxChars: 8000,
      totalMaxChars: 24000
    },
    hardCaps: {
      maxFiles: 10,
      maxChars: 30000,
      totalMaxChars: 60000
    },
    workflow: [
      "Use tree with depth=2 and limit=150 first.",
      "Use read for a single important file.",
      "Use bulk only for 2-5 small files.",
      "If a file is truncated, use nextOffsetChars with read/md to continue.",
      "Do not request huge maxChars across many files."
    ]
  },
  actions: [
    {
      action: "list",
      scope: "tunnel.read",
      summary: "List one directory inside the approved root.",
      params: ["p"]
    },
    {
      action: "tree",
      scope: "tunnel.read",
      summary: "Get a capped directory tree.",
      params: ["p", "depth", "limit"]
    },
    {
      action: "read",
      scope: "tunnel.read",
      summary: "Read one text file. Use offsetChars for chunks.",
      params: ["p", "maxChars", "offsetChars"]
    },
    {
      action: "md",
      scope: "tunnel.read",
      summary: "Read one text file wrapped in markdown fence. Use offsetChars for chunks.",
      params: ["p", "maxChars", "offsetChars"]
    },
    {
      action: "bulk",
      scope: "tunnel.read",
      summary: "Read multiple files with maxFiles and totalMaxChars safety caps.",
      params: ["paths64", "maxFiles", "maxChars", "totalMaxChars", "offsetChars"]
    },
    {
      action: "write",
      scope: "tunnel.write",
      summary: "Write one UTF-8 text file.",
      params: ["p", "content64"]
    },
    {
      action: "bulkWrite",
      scope: "tunnel.write",
      summary: "Write multiple UTF-8 text files. Capped at 20 files per request.",
      params: ["files64", "writes64"]
    },
    {
      action: "nodeScriptRun",
      scope: "tunnel.command",
      summary: "Run sandboxed JavaScript helper code.",
      params: ["script64", "input64"]
    },
    {
      action: "commandRun",
      scope: "tunnel.command",
      summary: "Run approved terminal diagnostics inside the approved root.",
      params: ["command64", "shell", "cwd", "timeoutMs"]
    },
    {
      action: "chromeFind",
      scope: "tunnel.browser",
      summary: "Find local Chrome installation.",
      params: []
    },
    {
      action: "chromeLaunch",
      scope: "tunnel.browser",
      summary: "Launch or connect to Chrome debug mode.",
      params: ["chromePath", "port", "userDataDir"]
    },
    {
      action: "chromeNavigate",
      scope: "tunnel.browser",
      summary: "Navigate Chrome to a URL.",
      params: ["url", "port"]
    },
    {
      action: "chromeRunScript",
      scope: "tunnel.browser",
      summary: "Run a multi-step browser test script.",
      params: ["script64", "port"]
    }
  ],
  agentInstructions: [
    "Never bulk read the whole app at once.",
    "Prefer tree then targeted read.",
    "Use bulk only for related small files.",
    "Set maxFiles around 3-5 and totalMaxChars around 12000-24000.",
    "When a file returns truncated=true, continue with offsetChars=nextOffsetChars.",
    "Before writing, read the exact current file first and explain the change."
  ]
};

module.exports = { apiCatalog };
