
// B"H

import { $, jsonText } from "../lib/dom.js";
import { me, device } from "../api/control.js";
import { callFs } from "../api/tunnel.js";
import { rememberTunnelName } from "../state/state.js";

/**
 * B"H
 * Safe display text.
 *
 * @param {unknown} value Value.
 * @param {string} fallback Fallback.
 * @returns {string} Display value.
 */
function safe(value, fallback = "unknown") {
  if (value === undefined || value === null || value === "") return fallback;
  return String(value);
}

/**
 * B"H
 * Sets a status pill.
 *
 * @param {string} id Pill id.
 * @param {string} textId Text node id.
 * @param {string} status Status key.
 * @param {string} text Text.
 * @returns {void}
 */
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

/**
 * B"H
 * Renders identity summary.
 *
 * @param {object} got Identity response.
 * @returns {string} HTML.
 */
function renderIdentityNice(got) {
  if (!got || got.ok === false) {
    setPill("authPill", "authText", "bad", "Not logged in");
    if ($("miniLogin")) $("miniLogin").textContent = "Not logged in";
    $("userChip")?.classList.add("hidden");

    return [
      "<div class='mini-card warning'>",
      "<strong>Not logged in</strong>",
      "<span>Login is needed for setup, API keys, and wallet.</span>",
      "</div>"
    ].join("");
  }

  const identity = got.identity || got.user || got;
  const userId = safe(identity.userId || got.userId, "unknown user");
  const kind = safe(identity.kind || got.kind, "session");

  setPill("authPill", "authText", "good", "Logged in");
  if ($("miniLogin")) $("miniLogin").textContent = userId;
  if ($("userName")) $("userName").textContent = userId;
  $("userChip")?.classList.remove("hidden");

  return [
    "<div class='mini-card success'>",
    "<strong>Logged in as: " + userId + "</strong>",
    "<span>Detected by: " + kind + " / control API</span>",
    "</div>"
  ].join("");
}

/**
 * B"H
 * Loads live config through the agent.
 *
 * @param {string} tunnelName Tunnel name.
 * @returns {Promise<object|null>} Config object.
 */
async function loadLiveConfig(tunnelName) {
  if (!tunnelName) return null;

  try {
    const got = await callFs(tunnelName, { action: "configGet" });
    if (got && got.ok && got.config) return got.config;
  } catch (e) {}

  return null;
}

/**
 * B"H
 * Extracts a tunnel name.
 *
 * @param {object} got Device response.
 * @returns {string} Tunnel name.
 */
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

/**
 * B"H
 * Applies discovered tunnel without adding it to URL.
 *
 * @param {object} got Device response.
 * @param {Function} getTunnelName Tunnel reader.
 * @returns {string} Effective tunnel name.
 */
function applyDiscoveredTunnelName(got, getTunnelName) {
  const current = getTunnelName();
  if (current) return current;

  const discovered = extractTunnelName(got);
  if (!discovered) return "";

  if ($("tunnelName")) $("tunnelName").value = discovered;
  rememberTunnelName(discovered);

  return discovered;
}

/**
 * B"H
 * Renders device summary.
 *
 * @param {object} got Device response.
 * @param {object|null} config Live config.
 * @param {Function} getTunnelName Tunnel reader.
 * @returns {void}
 */
function renderDeviceNice(got, config, getTunnelName) {
  const effectiveTunnelName = applyDiscoveredTunnelName(got, getTunnelName);

  if (!got || got.ok === false || got.connected === false) {
    setPill("connectionPill", "connectionText", "bad", "Agent offline");
    if ($("miniAgent")) $("miniAgent").textContent = "Offline";

    if ($("deviceSummary")) {
      $("deviceSummary").innerHTML = [
        "<div class='mini-card warning'>",
        "<strong>Agent not connected</strong>",
        "<span>Run the install/restart command and refresh.</span>",
        "</div>"
      ].join("");
    }

    return;
  }

  const tunnel = got.device || got.tunnel || got;
  const name = safe(
    tunnel.tunnelName || tunnel.name || got.tunnelName || effectiveTunnelName,
    "unknown tunnel"
  );
  const root = safe(
    config?.root || tunnel.root || got.root || got.projectRoot,
    "connected, but config not loaded"
  );
  const writes = config ? !!config.allowWrite : !!(tunnel.allowWrite ?? got.allowWrite);
  const version = safe(
    tunnel.agentVersion || got.agentVersion || config?.agentVersion,
    "connected"
  );

  setPill("connectionPill", "connectionText", "good", "Connected");
  if ($("miniAgent")) $("miniAgent").textContent = "Connected";

  if ($("deviceSummary")) {
    $("deviceSummary").innerHTML = [
      "<div class='mini-card success'>",
      "<strong>Agent connected: " + name + "</strong>",
      "<span>Root: " + root + "</span>",
      "<span>Writes: " + (writes ? "enabled" : "disabled") + "</span>",
      "<span>Agent version: " + version + "</span>",
      "</div>"
    ].join("");
  }
}

/**
 * B"H
 * Refreshes login.
 *
 * @returns {Promise<object>} Identity response.
 */
export async function refreshLogin() {
  const got = await me();

  if ($("identityBox")) jsonText("identityBox", got);
  if ($("identitySummary")) $("identitySummary").innerHTML = renderIdentityNice(got);

  return got;
}

/**
 * B"H
 * Refreshes device.
 *
 * @param {Function} getTunnelName Tunnel reader.
 * @returns {Promise<object>} Device response.
 */
export async function refreshDevice(getTunnelName) {
  const requestedTunnelName = getTunnelName();
  const got = await device(requestedTunnelName);
  const effectiveTunnelName = requestedTunnelName || extractTunnelName(got);
  const config =
    got && got.ok !== false && effectiveTunnelName
      ? await loadLiveConfig(effectiveTunnelName)
      : null;

  if ($("deviceBox")) jsonText("deviceBox", { device: got, liveConfig: config });
  if ($("miniStatus")) jsonText("miniStatus", { device: got, liveConfig: config });

  renderDeviceNice(got, config, getTunnelName);
  return got;
}

/**
 * B"H
 * Refreshes login and device status.
 *
 * @param {Function} getTunnelName Tunnel reader.
 * @returns {Promise<Array>} Settled results.
 */
export async function refreshStatus(getTunnelName) {
  return await Promise.allSettled([
    refreshLogin(),
    refreshDevice(getTunnelName)
  ]);
}
