
// B"H

import { $, jsonText } from "../lib/dom.js";
import { me, device } from "../api/control.js";
import { callFs } from "../api/tunnel.js";
import { rememberTunnelName } from "../state/state.js";

function safe(value, fallback = "unknown") {
  if (value === undefined || value === null || value === "") return fallback;
  return String(value);
}

function setPill(id, textId, status, text) {
  const pill = $(id);
  const label = $(textId);

  if (!pill || !label) return;

  pill.classList.remove("connected", "warning", "danger", "warn");

  if (status === "good") pill.classList.add("connected");
  else if (status === "bad") pill.classList.add("danger");
  else pill.classList.add("warning");

  label.textContent = text;
}

function renderIdentityNice(got) {
  if (!got || got.ok === false) {
    setPill("authPill", "authText", "bad", "Not logged in");
    $("miniLogin").textContent = "Not logged in";
    $("userChip")?.classList.add("hidden");

    return [
      '<div class="status-card bad">',
      '<div class="status-card-icon">🔒</div>',
      '<div><strong>Not logged in</strong><span>Login is needed for setup, API keys, and wallet.</span></div>',
      '</div>'
    ].join("");
  }

  const identity = got.identity || got.user || got;
  const userId = safe(identity.userId || got.userId, "unknown user");
  const kind = safe(identity.kind || got.kind, "session");

  setPill("authPill", "authText", "good", "Logged in");
  $("miniLogin").textContent = userId;

  if ($("userName")) $("userName").textContent = userId;
  $("userChip")?.classList.remove("hidden");

  return [
    '<div class="status-card good">',
    '<div class="status-card-icon">👤</div>',
    '<div>',
    '<strong>Logged in as: ' + userId + '</strong>',
    '<span>Detected by: ' + kind + ' / control API</span>',
    '</div>',
    '</div>'
  ].join("");
}

async function loadLiveConfig(tunnelName) {
  if (!tunnelName) return null;

  try {
    const got = await callFs(tunnelName, { action: "configGet" });
    if (got && got.ok && got.config) return got.config;
  } catch (e) {}

  return null;
}

function extractTunnelName(got) {
  if (!got) return "";
  return (
    got.tunnelName ||
    got.device?.tunnelName ||
    got.tunnel?.tunnelName ||
    got.device?.name ||
    got.name ||
    ""
  );
}

function applyDiscoveredTunnelName(got, getTunnelName) {
  const current = getTunnelName();
  if (current) return current;

  const discovered = extractTunnelName(got);
  if (!discovered) return "";

  if ($("tunnelName")) $("tunnelName").value = discovered;

  rememberTunnelName(discovered);

  const url = new URL(location.href);
  url.searchParams.set("tunnelName", discovered);
  history.replaceState(null, "", url.toString());

  return discovered;
}

function renderDeviceNice(got, config, getTunnelName) {
  const effectiveTunnelName = applyDiscoveredTunnelName(got, getTunnelName);

  if (!got || got.ok === false || got.connected === false) {
    setPill("connectionPill", "connectionText", "bad", "Agent offline");
    $("miniAgent").textContent = "Offline";

    $("deviceSummary").innerHTML = [
      '<div class="status-card bad">',
      '<div class="status-card-icon">⚠️</div>',
      '<div><strong>Agent not connected</strong><span>Run the install/restart command and refresh.</span></div>',
      '</div>'
    ].join("");

    return;
  }

  const tunnel = got.device || got.tunnel || got;
  const name = safe(tunnel.tunnelName || tunnel.name || got.tunnelName || effectiveTunnelName, "unknown tunnel");

  const root = safe(
    config?.root || tunnel.root || got.root || got.projectRoot,
    "connected, but config not loaded"
  );

  const writes = config
    ? !!config.allowWrite
    : !!(tunnel.allowWrite ?? got.allowWrite);

  const version = safe(
    tunnel.agentVersion || got.agentVersion || config?.agentVersion,
    "connected"
  );

  setPill("connectionPill", "connectionText", "good", "Connected");
  $("miniAgent").textContent = "Connected";

  $("deviceSummary").innerHTML = [
    '<div class="status-grid">',
    '<div class="status-card good"><div class="status-card-icon">🟢</div><div><strong>Agent connected</strong><span>' + name + '</span></div></div>',
    '<div class="status-card"><div class="status-card-icon">📁</div><div><strong>Root</strong><span>' + root + '</span></div></div>',
    '<div class="status-card ' + (writes ? "good" : "") + '"><div class="status-card-icon">✍️</div><div><strong>Writes</strong><span>' + (writes ? "enabled" : "disabled") + '</span></div></div>',
    '<div class="status-card"><div class="status-card-icon">🧩</div><div><strong>Agent version</strong><span>' + version + '</span></div></div>',
    '</div>'
  ].join("");
}

export async function refreshLogin() {
  const got = await me();

  jsonText("identityBox", got);
  $("identitySummary").innerHTML = renderIdentityNice(got);

  return got;
}

export async function refreshDevice(getTunnelName) {
  const requestedTunnelName = getTunnelName();

  const got = await device(requestedTunnelName);
  const effectiveTunnelName = requestedTunnelName || extractTunnelName(got);
  const config = got && got.ok !== false && effectiveTunnelName
    ? await loadLiveConfig(effectiveTunnelName)
    : null;

  jsonText("deviceBox", { device: got, liveConfig: config });
  jsonText("miniStatus", { device: got, liveConfig: config });

  renderDeviceNice(got, config, getTunnelName);

  return got;
}

export async function refreshStatus(getTunnelName) {
  const results = await Promise.allSettled([
    refreshLogin(),
    refreshDevice(getTunnelName)
  ]);

  return results;
}
