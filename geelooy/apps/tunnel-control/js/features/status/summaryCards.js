// B"H

import { $ } from "../../lib/dom.js";
import { h } from "../../ui/core/html.js";
import { safe, setPill, setText } from "./statusText.js";

/**
 * B"H
 * Chapter 375: Summary Cards Became Honest Mirrors.
 */
export function miniCard(tone, title, lines = []) {
  return h("div", {
    classes: ["mini-card", tone],
    children: [
      h("strong", { text: title }),
      ...lines.map(line => h("span", { text: line }))
    ]
  });
}

export function renderIdentityNice(got) {
  if (!got || got.ok === false) {
    setPill("authPill", "authText", "bad", "Not logged in");
    setText("miniLogin", "Not logged in");
    $("userChip")?.classList.add("hidden");

    return miniCard("warning", "Not logged in", [
      "Login is needed for setup, API keys, and wallet."
    ]);
  }

  const identity = got.identity || got.user || got;
  const userId = safe(identity.userId || got.userId, "unknown user");
  const kind = safe(identity.kind || got.kind, "session");

  setPill("authPill", "authText", "good", "Logged in");
  setText("miniLogin", userId);
  setText("userName", userId);
  $("userChip")?.classList.remove("hidden");

  return miniCard("success", `Logged in as: ${userId}`, [
    `Detected by: ${kind} / control API`
  ]);
}

export function offlineDeviceCard() {
  return miniCard("warning", "Agent not connected", [
    "Run the install/restart command and refresh."
  ]);
}

export function connectedDeviceCard({ name, root, writes, version }) {
  return miniCard("success", `Agent connected: ${name}`, [
    `Root: ${root}`,
    `Writes: ${writes ? "enabled" : "disabled"}`,
    `Agent version: ${version}`
  ]);
}
