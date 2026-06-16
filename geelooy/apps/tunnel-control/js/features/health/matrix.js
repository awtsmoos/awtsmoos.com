// B"H

import { h } from "../../ui/core/html.js";

const CHECKS = Object.freeze([
  ["auth", "Auth", "Signed-in session controls hosted and account-scoped actions."],
  ["native", "Native", "Installed local tunnel for host filesystem and shell."],
  ["browser", "Browser tab", "Workspace vessel from /apps/code or /apps/tunnel."],
  ["virtual", "Virtual OS", "Hosted Awtsmoos OS fallback vessel."],
  ["fs", "Filesystem", "List/read/write action surface."],
  ["command", "Command", "Shell or simulated command surface."],
  ["chrome", "Chrome", "Chrome debug/browser automation surface."],
  ["ai", "AI tools", "Provider and agent action surface." ]
]);

/**
 * B"H
 * Chapter: The Control Room Learned To Tell The Truth.
 *
 * This matrix is not a promise. It is a compact oath from whatever data the
 * page already holds: session, runtime, tunnel discovery, and provider config.
 * Green means proven by local state; amber means possible but still waiting;
 * red means no vessel has revealed that capability yet.
 */
export function buildHealthMatrix(ctx = {}) {
  const session = ctx.session || {};
  const runtime = ctx.runtime || {};
  const tunnel = runtime.tunnel || ctx.tunnel || {};
  const raw = tunnel.raw || ctx.device || {};
  const devices = normalizeDevices(ctx.devices || raw || {});
  const tools = tunnel.raw?.tools || raw.tools || raw.device?.tools || {};
  const command = tunnel.raw?.command || raw.command || raw.device?.command || {};
  const chrome = tunnel.raw?.chrome || raw.chrome || raw.device?.chrome || {};
  const providers = ctx.providers || raw.providers || [];

  const native = devices.some(device => typeOf(device) === "native-tunnel") || runtime.mode === "native-tunnel" || tunnel.connected === true;
  const browser = devices.some(device => typeOf(device) === "browser-tab") || runtime.mode === "browser-tab-editor";
  const virtual = devices.some(device => typeOf(device) === "virtual-os") || runtime.mode === "virtual-os" || raw.virtualDevice !== null;
  const fs = Boolean(tools.fsRead || tools.fsList || tunnel.connected || virtual || browser);
  const cmd = Boolean(tools.command || command.enabled || runtime.mode === "browser-tab-editor");
  const chromeReady = Boolean(tools.chrome || chrome.enabled || chrome.port);
  const ai = Boolean(providers.length || raw.aiAgents || virtual || native);

  return CHECKS.map(([key, label, detail]) => ({ key, label, detail, ...statusFor(key, { session, native, browser, virtual, fs, cmd, chromeReady, ai }) }));
}

export function summarizeHealth(checks = []) {
  const ready = checks.filter(check => check.tone === "good").length;
  const waiting = checks.filter(check => check.tone === "warn").length;
  const blocked = checks.filter(check => check.tone === "bad").length;
  return { ready, waiting, blocked, total: checks.length };
}

export function createHealthMatrix(ctx = {}) {
  const checks = buildHealthMatrix(ctx);
  const summary = summarizeHealth(checks);
  return h("section", { classes: ["awt-health-panel"], children: [
    h("div", { classes: ["awt-health-head"], children: [
      h("div", { children: [h("div", { classes: ["awt-mini-kicker"], text: "Unified Tunnel Health" }), h("h3", { text: "Mission-control readiness" })] }),
      h("strong", { text: `${summary.ready}/${summary.total} ready` })
    ] }),
    h("div", { classes: ["awt-health-grid"], children: checks.map(healthCard) })
  ] });
}

function healthCard(check) {
  return h("article", { classes: ["awt-health-card", `is-${check.tone}`], children: [
    h("strong", { text: check.label }),
    h("span", { text: check.status }),
    h("small", { text: check.detail })
  ] });
}

function statusFor(key, state) {
  if (key === "auth") return state.session.loggedIn === false ? bad("Sign in needed") : good("Session available");
  if (key === "native") return state.native ? good("Native ready") : warn("Install/start native tunnel");
  if (key === "browser") return state.browser ? good("Browser vessel ready") : warn("Open /apps/code");
  if (key === "virtual") return state.virtual ? good("Hosted fallback ready") : warn("Login required");
  if (key === "fs") return state.fs ? good("FS route ready") : bad("No FS vessel");
  if (key === "command") return state.cmd ? good("Commands ready") : warn("Commands limited");
  if (key === "chrome") return state.chromeReady ? good("Chrome ready") : warn("Chrome not proven");
  if (key === "ai") return state.ai ? good("AI route ready") : warn("Provider not proven");
  return warn("Unknown");
}

function normalizeDevices(value = {}) {
  const all = [];
  for (const item of value.nativeDevices || value.tunnels || []) all.push({ ...item, vesselType: item.vesselType || "native-tunnel" });
  for (const item of value.browserDevices || []) all.push({ ...item, vesselType: item.vesselType || "browser-tab" });
  if (value.virtualDevice !== null) all.push(value.virtualDevice || { tunnelName: "awtsmoos-virtual-os", vesselType: "virtual-os" });
  return all;
}

function typeOf(device = {}) { return device.vesselType || device.kind || "vessel"; }
function good(status) { return { tone: "good", status }; }
function warn(status) { return { tone: "warn", status }; }
function bad(status) { return { tone: "bad", status }; }
