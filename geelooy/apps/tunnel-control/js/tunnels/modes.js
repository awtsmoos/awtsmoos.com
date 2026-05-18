// B"H

export const TUNNEL_MODES = Object.freeze([
  {
    id: "local-agent",
    title: "Local Tunnel Agent",
    cta: "Install or restart local agent",
    description: "Full native files, commands, Chrome, and testing on the approved root.",
    href: "https://awtsmoos.com/apps/tunnel-control/",
    installCommandWindows: "irm https://awtsmoos.com/api/tunnel/install/windows | iex",
    installCommandUnix: "curl -fsSL https://awtsmoos.com/api/tunnel/install/unix | bash"
  },
  {
    id: "browser-tab-editor",
    title: "Browser Tab Editor Tunnel",
    cta: "Open the code editor",
    description: "Zero local install. A live editor tab becomes the workspace bridge.",
    href: "/apps/code"
  },
  {
    id: "virtual-os",
    title: "Virtual OS Tunnel",
    cta: "Open Awtsmoos OS",
    description: "Hosted workspace universe for alias roots, browser state, and AI continuity.",
    href: "/os"
  }
]);
