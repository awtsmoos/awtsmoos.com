// B"H

import { $ } from "../../lib/dom.js";
import { h } from "../../ui/core/html.js";
import { safe, setPill, setText } from "./statusText.js";
import { collectVessels, labelForVessel, VIRTUAL_OS_TUNNEL } from "../vessels/selector.js";
import { createModeCards, createModeLinks } from "../modes/modeCards.js";

/**
 * B"H
 * Chapter 21: Status became three lamps: native, browser, and hosted crown.
 */
export function miniCard(tone, title, lines = []) {
  return h("div", { classes: ["mini-card", tone], children: [h("strong", { text: title }), ...lines.map(line => h("span", { text: line }))] });
}

export function renderIdentityNice(got) {
  if (!got || got.ok === false) {
    setPill("authPill", "authText", "bad", "Not logged in");
    setText("miniLogin", "Not logged in");
    $("userChip")?.classList.add("hidden");
    return miniCard("warning", "Not logged in", ["Login is needed for setup, API keys, and hosted Virtual OS."]);
  }
  const identity = got.identity || got.user || got;
  const userId = safe(identity.userId || got.userId, "unknown user");
  const kind = safe(identity.kind || got.kind, "session");
  setPill("authPill", "authText", "good", "Logged in");
  setText("miniLogin", userId);
  setText("userName", userId);
  $("userChip")?.classList.remove("hidden");
  return miniCard("success", `Logged in as: ${userId}`, [`Detected by: ${kind} / control API`]);
}

export function offlineDeviceCard() {
  return miniCard("warning", "No native/browser tunnel connected", ["Open /apps/code for browser-tab mode, install native tunnel, or use Virtual OS."]);
}

export function connectedDeviceCard({ name, root, writes, version, vesselType }) {
  return miniCard("success", `Recommended: ${name}`, [`Vessel: ${vesselType || "native-tunnel"}`, `Root: ${root}`, `Writes: ${writes ? "enabled" : "disabled"}`, `Version: ${version}`]);
}

export function vesselFamiliesCard(got = {}) {
  const native = got.nativeDevices || got.tunnels || [];
  const browser = got.browserDevices || [];
  const virtual = got.virtualDevice === null ? null : (got.virtualDevice || { tunnelName: VIRTUAL_OS_TUNNEL });
  const lines = [
    `Native tunnels: ${native.length}`,
    `Browser tabs: ${browser.length}`,
    `Virtual OS: ${virtual ? "available" : "not available"}`,
    got.recommended?.tunnelName ? `Recommended: ${got.recommended.tunnelName}` : "Recommended: none"
  ];
  return miniCard(browser.length || native.length ? "success" : "warning", "Unified vessel map", lines);
}

export function deviceListCard(title, devices = [], emptyLine = "None connected") {
  if (!devices.length) return miniCard("warning", title, [emptyLine]);
  return miniCard("success", title, devices.slice(0, 5).map(d => `${d.tunnelName || d.name} — ${d.vesselType || d.kind || "vessel"}`));
}

export function selectedVesselCard(vessel) {
  if (!vessel) return miniCard("warning", "Target vessel", ["No target selected."]);
  return miniCard("success", "Target vessel", [labelForVessel(vessel), `Actions route to: ${vessel.tunnelName}`]);
}

export function vesselTableCard(got = {}, selectedName = "") {
  const vessels = collectVessels(got);
  if (!vessels.length) return miniCard("warning", "Active vessels", ["No vessels discovered."]);
  const table = h("table", { classes: ["awt-vessel-table"] });
  table.append(
    row(["Target", "Type", "Writes", "Root"]),
    ...vessels.map(vessel => row([
      vessel.tunnelName === selectedName ? `✓ ${vessel.tunnelName}` : vessel.tunnelName,
      vessel.vesselType || vessel.kind || "vessel",
      vessel.allowWrite === false ? "no" : "yes",
      vessel.root || (vessel.tunnelName === VIRTUAL_OS_TUNNEL ? "Hosted Awtsmoos OS" : "browser/session")
    ]))
  );
  return h("div", { classes: ["mini-card", "success", "awt-vessel-table-card"], children: [h("strong", { text: "Active tunnel/vessel table" }), table] });
}

export function modeOverviewCard(got = {}) {
  return h("div", { classes: ["mini-card", "success", "awt-mode-overview"], children: [h("strong", { text: "Three tunnel modes" }), createModeCards(got), createModeLinks()] });
}

function row(values) {
  return h("tr", { children: values.map(value => h("td", { text: value })) });
}
