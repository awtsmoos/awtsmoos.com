
// B"H

export const PANE_META = {
  setup: {
    kicker: "Setup",
    title: "Root and permissions",
    desc: "Choose the local root, save config, and control live agent abilities.",
    icon: "🛠️"
  },
  apiKeys: {
    kicker: "Keys",
    title: "API key vault",
    desc: "Create scoped keys and activate safe access for file tools.",
    icon: "🔐"
  },
  explorer: {
    kicker: "Files",
    title: "Project explorer",
    desc: "List, tree, read, preview, and bulk inspect the approved root.",
    icon: "📁"
  },
  terminal: {
    kicker: "Terminal",
    title: "Command runner",
    desc: "Run approved commands only when permission and scope allow it.",
    icon: "⌁"
  },
  chrome: {
    kicker: "Chrome",
    title: "Browser control",
    desc: "Find, launch, connect, navigate, click, type, and evaluate pages.",
    icon: "🌐"
  },
  usage: {
    kicker: "Usage",
    title: "Usage and limits",
    desc: "Inspect activity, limits, and tunnel request status.",
    icon: "📊"
  },
  docs: {
    kicker: "Docs",
    title: "Agent docs",
    desc: "Copy instructions and machine-readable API guidance.",
    icon: "📜"
  },
  account: {
    kicker: "Account",
    title: "Login status",
    desc: "Check session, account identity, and OAuth connection.",
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
