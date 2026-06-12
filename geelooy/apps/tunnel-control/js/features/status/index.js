// B"H

import { $, jsonText } from "../../lib/dom.js";
import { me, device } from "../../api/control.js";
import { safe, setPill, setText } from "./statusText.js";
import { connectedDeviceCard, offlineDeviceCard, renderIdentityNice } from "./summaryCards.js";
import { loadLiveConfig } from "./liveConfig.js";
import { applyDiscoveredTunnelName, extractTunnelName } from "./tunnelDiscovery.js";

/**
 * B"H
 * Chapter 378: Status Split Into Lamps But Kept One Flame.
 */
function renderDeviceNice(got, config, getTunnelName) {
  const effectiveTunnelName = applyDiscoveredTunnelName(got, getTunnelName);
  const summary = $("deviceSummary");

  if (!got || got.ok === false || got.connected === false) {
    setPill("connectionPill", "connectionText", "bad", "Agent offline");
    setText("miniAgent", "Offline");
    summary?.replaceChildren(offlineDeviceCard());
    return;
  }

  const tunnel = got.device || got.tunnel || got;
  const name = safe(tunnel.tunnelName || tunnel.name || got.tunnelName || effectiveTunnelName, "unknown tunnel");
  const root = safe(config?.root || tunnel.root || got.root || got.projectRoot, "connected, but config not loaded");
  const writes = config ? !!config.allowWrite : !!(tunnel.allowWrite ?? got.allowWrite);
  const version = safe(tunnel.agentVersion || got.agentVersion || config?.agentVersion, "connected");

  setPill("connectionPill", "connectionText", "good", "Connected");
  setText("miniAgent", "Connected");
  summary?.replaceChildren(connectedDeviceCard({ name, root, writes, version }));
}

export async function refreshLogin() {
  const got = await me();

  if ($("identityBox")) jsonText("identityBox", got);
  $("identitySummary")?.replaceChildren(renderIdentityNice(got));

  return got;
}

export async function refreshDevice(getTunnelName) {
  const requestedTunnelName = getTunnelName();
  const got = await device(requestedTunnelName);
  const effectiveTunnelName = requestedTunnelName || extractTunnelName(got);
  const config = got && got.ok !== false && effectiveTunnelName
    ? await loadLiveConfig(effectiveTunnelName)
    : null;

  if ($("deviceBox")) jsonText("deviceBox", { device: got, liveConfig: config });
  if ($("miniStatus")) jsonText("miniStatus", { device: got, liveConfig: config });

  renderDeviceNice(got, config, getTunnelName);
  return got;
}

export async function refreshStatus(getTunnelName) {
  return await Promise.allSettled([
    refreshLogin(),
    refreshDevice(getTunnelName)
  ]);
}
