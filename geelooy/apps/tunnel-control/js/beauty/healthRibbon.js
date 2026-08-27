// B"H

import { el, text } from "./dom.js";
import { onBeautyEvent } from "./events.js";

/**
 * B"H
 * Chapter 393: The Health Ribbon Became Six Watchmen.
 */
const chips = ["Auth", "Tunnel", "API Key", "Files", "Browser", "Runtime"];

export function mountHealthRibbon(root) {
  const nodes = chips.map(label => chip(label));
  const wrap = el("section", { classes: ["awt-health-ribbon"], children: nodes });
  root.append(wrap);

  refresh(nodes);
  setInterval(() => refresh(nodes), 4000);
  onBeautyEvent(() => refresh(nodes));
}

function chip(label) {
  return el("div", { classes: ["awt-health-chip"], children: [
    text("span", "●"),
    text("strong", label),
    text("small", "checking")
  ] });
}

function refresh(nodes) {
  const body = document.body;
  const values = [
    body.classList.contains("awt-home-mode") || body.classList.contains("awt-workspace-mode"),
    !!window.awtsGetTunnelName?.(),
    document.getElementById("apiKeyPill")?.classList.contains("connected"),
    body.classList.contains("awt-can-write"),
    body.classList.contains("awt-can-browser"),
    !!window.awtsActiveWorkspaceRuntime
  ];
  nodes.forEach((node, index) => {
    const ok = !!values[index];
    node.dataset.state = ok ? "good" : "warn";
    node.querySelector("small").textContent = ok ? "ready" : "watch";
  });
}
