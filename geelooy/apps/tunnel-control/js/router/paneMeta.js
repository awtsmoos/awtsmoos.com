
// B"H

export const PANE_META = {
  setup: {
    kicker: "Setup",
    title: "Root and permissions",
    desc: "Choose the project root and decide exactly what the agent can do.",
    icon: "🛠️"
  },
  apiKeys: {
    kicker: "Keys",
    title: "API key vault",
    desc: "Create and activate scoped keys for file, command, and browser tools.",
    icon: "🔐"
  },
  explorer: {
    kicker: "Files",
    title: "Project explorer",
    desc: "List, tree, read, preview, and bulk inspect real files.",
    icon: "📁"
  },
  terminal: {
    kicker: "Terminal",
    title: "Command runner",
    desc: "Run approved commands inside the selected local root.",
    icon: "⌁"
  },
  chrome: {
    kicker: "Chrome",
    title: "Browser control",
    desc: "Find Chrome, launch/connect, navigate, click, type, and evaluate pages.",
    icon: "🌐"
  },
  usage: {
    kicker: "Usage",
    title: "Usage and limits",
    desc: "Inspect tunnel activity, limits, and request results.",
    icon: "📊"
  },
  docs: {
    kicker: "Docs",
    title: "Agent docs",
    desc: "Copy instructions, OpenAPI, and machine-readable docs.",
    icon: "📜"
  },
  account: {
    kicker: "Account",
    title: "Login status",
    desc: "Check session identity and OAuth connection.",
    icon: "👤"
  },
  install: {
    kicker: "Install",
    title: "Install or restart",
    desc: "Copy the one-command installer for Windows, Mac, or Linux.",
    icon: "⚡"
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
  "install"
];
