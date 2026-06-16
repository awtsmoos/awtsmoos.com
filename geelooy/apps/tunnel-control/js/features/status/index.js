// B"H

import { $, jsonText } from "../../lib/dom.js";
import { me, myDevice } from "../../api/control.js";
import { safe, setPill, setText } from "./statusText.js";
import {
  connectedDeviceCard,
  deviceListCard,
  offlineDeviceCard,
  renderIdentityNice,
  selectedVesselCard,
  vesselFamiliesCard,
  vesselTableCard,
  modeOverviewCard
} from "./summaryCards.js";
import { loadLiveConfig } from "./liveConfig.js";
import { applyDiscoveredTunnelName, extractTunnelName } from "./tunnelDiscovery.js";
import { bindTargetSelect, chooseTargetVessel, renderTargetOptions } from "../vessels/selector.js";

/**
 * B"H
 * Chapter 32: The status renderer stepped into the testable light.
 */
export function renderDeviceNice(got, config, getTunnelName) {
  const effectiveTunnelName = applyDiscoveredTunnelName(got, getTunnelName);
  const summary = $("deviceSummary");
  const nativeDevices = got?.nativeDevices || got?.tunnels || [];
  const browserDevices = got?.browserDevices || [];
  const virtualDevice = got?.virtualDevice || null;
  const recommended = got?.recommended || got?.device || got?.tunnel || null;
  const selected = chooseTargetVessel(got || {}, $("targetVesselSelect")?.value || effectiveTunnelName);

  renderTargetOptions($("targetVesselSelect"), got || {}, selected?.tunnelName || effectiveTunnelName);
  bindTargetSelect($("targetVesselSelect"), name => setText("selectedTargetVessel", name));
  setText("selectedTargetVessel", selected?.tunnelName || "No target");

  if (!got) {
    setPill("connectionPill", "connectionText", "bad", "Unknown");
    setText("miniAgent", "Unknown");
    summary?.replaceChildren(offlineDeviceCard());
    return;
  }

  if (browserDevices.length || nativeDevices.length || virtualDevice || got.virtualDevice !== null) {
    const tunnel = selected || recommended || virtualDevice || {};
    const name = safe(tunnel.tunnelName || tunnel.name || got.tunnelName || effectiveTunnelName, "awtsmoos-virtual-os");
    const root = safe(config?.root || tunnel.root || got.root || got.projectRoot, tunnel.vesselType === "virtual-os" ? "Hosted Awtsmoos OS" : "connected");
    const writes = config ? !!config.allowWrite : !!(tunnel.allowWrite ?? got.allowWrite ?? true);
    const version = safe(tunnel.agentVersion || got.agentVersion || config?.agentVersion, tunnel.vesselType || "available");
    setPill("connectionPill", "connectionText", browserDevices.length || nativeDevices.length ? "good" : "warn", browserDevices.length || nativeDevices.length ? "Connected" : "Virtual OS");
    setText("miniAgent", name);
    summary?.replaceChildren(
      modeOverviewCard(got),
      vesselFamiliesCard(got),
      selectedVesselCard(selected),
      vesselTableCard(got, selected?.tunnelName || name),
      connectedDeviceCard({ name, root, writes, version, vesselType: tunnel.vesselType || tunnel.kind }),
      deviceListCard("Browser-tab tunnels", browserDevices, "Open /apps/code and enable Browser Tunnel."),
      deviceListCard("Native tunnels", nativeDevices, "Install/start the native tunnel for host shell access.")
    );
    return;
  }

  setPill("connectionPill", "connectionText", "bad", "No vessel");
  setText("miniAgent", "No vessel");
  summary?.replaceChildren(offlineDeviceCard());
}

export async function refreshLogin() {
  const got = await me();
  if ($("identityBox")) jsonText("identityBox", got);
  $("identitySummary")?.replaceChildren(renderIdentityNice(got));
  return got;
}

export async function refreshDevice(getTunnelName) {
  const requestedTunnelName = getTunnelName();
  const got = await myDevice();
  const effectiveTunnelName = requestedTunnelName || extractTunnelName(got);
  const config = got && got.ok !== false && effectiveTunnelName && effectiveTunnelName !== got.virtualDevice?.tunnelName ? await loadLiveConfig(effectiveTunnelName) : null;
  if ($("deviceBox")) jsonText("deviceBox", { device: got, liveConfig: config });
  if ($("miniStatus")) jsonText("miniStatus", { device: got, liveConfig: config });
  renderDeviceNice(got, config, getTunnelName);
  return got;
}

export async function refreshStatus(getTunnelName) {
  return await Promise.allSettled([refreshLogin(), refreshDevice(getTunnelName)]);
}
