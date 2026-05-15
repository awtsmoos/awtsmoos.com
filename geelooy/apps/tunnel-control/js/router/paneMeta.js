
// B"H

export const PANE_META = {
  setup: {
    kicker: "Setup",
    title: "Root and permissions",
    desc: "Choose root, save config, and control live agent abilities.",
    icon: "🛠️"
  },
  apiKeys: {
    kicker: "Keys",
    title: "API key vault",
    desc: "Create, activate, copy, and protect scoped tunnel keys.",
    icon: "🔐"
  },
  explorer: {
    kicker: "Files",
    title: "Project explorer",
    desc: "List, tree, read, preview, and bulk inspect project files.",
    icon: "📁"
  },
  terminal: {
    kicker: "Terminal",
    title: "Command runner",
    desc: "Run controlled commands inside the selected local root.",
    icon: "⌁"
  },
  chrome: {
    kicker: "Chrome",
    title: "Browser control",
    desc: "Find Chrome, launch/connect, navigate, click, type, and evaluate.",
    icon: "🌐"
  },
  usage: {
    kicker: "Usage",
    title: "Usage and limits",
    desc: "Inspect rate limits, request activity, and tunnel usage.",
    icon: "📊"
  },
  docs: {
    kicker: "Docs",
    title: "Agent docs",
    desc: "Copy instructions, machine docs, and OpenAPI references.",
    icon: "📜"
  },
  account: {
    kicker: "Account",
    title: "Login status",
    desc: "Check session identity and account connection.",
    icon: "👤"
  },
  install: {
    kicker: "Install",
    title: "Install or restart",
    desc: "Copy the one-command installer for Windows, Mac, or Linux.",
    icon: "⚡"
  },
  diagnostic: {
    kicker: "Diagnostic",
    title: "Diagnostics",
    desc: "Shell and pane detection diagnostics.",
    icon: "🧪"
  }
};

export const DASHBOARD_ORDER = [
  "setup",
  "apiKeys",
  "explorer",
  "terminal",
  "chrome",
  "usage",
  "docs",
  "account",
  "install",
  "diagnostic"
];
