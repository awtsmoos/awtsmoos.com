// B"H
const { livenessSnapshot } = require("../../../../../../ayzarim/awtsmoosDynamicServer/websocket/core/clientLiveness.js");
const { VESSEL_TYPES, isBrowserVesselDescriptor, normalizeVesselType } = require("./vesselTypes.js");
const { nativeCapabilities } = require("./capabilities.js");
const { verifyTunnelResponse } = require("./responseContract.js");

/** B"H — Native tunnel evidence is public enough to prevent false burial. */
function publicNativeTunnel(client = {}) {
  const live = livenessSnapshot(client);
  return {
    connected: true,
    tunnelName: client.tunnelName,
    deviceName: client.deviceName || null,
    root: client.root || null,
    allowWrite: !!client.allowWrite,
    allowSecrets: !!client.allowSecrets,
    allowCommands: !!client.allowCommands,
    isAlive: live.isAlive,
    rawIsAlive: live.rawIsAlive,
    lastSeenAt: live.lastSeenAt,
    heartbeatAt: live.heartbeatAt,
    missedHeartbeats: live.missedHeartbeats,
    livenessState: live.livenessState,
    registeredAt: live.registeredAt,
    newestEvidenceAt: live.newestEvidenceAt,
    agentVersion: client.agentVersion || null,
    tools: client.tools || null,
    chrome: client.chrome || null,
    command: client.command || null,
    capabilities: nativeCapabilities(client),
    kind: VESSEL_TYPES.NATIVE,
    vesselType: VESSEL_TYPES.NATIVE
  };
}

function newestStamp(client = {}) {
  return Math.max(Number(client.lastSeenAt || 0), Number(client.heartbeatAt || 0), Number(client.registeredAt || 0));
}

function isNativeTunnelClient(client = {}) {
  if (!client.isTunnel || !client.tunnelName) return false;
  if (isBrowserVesselDescriptor(client)) return false;
  const type = normalizeVesselType(client.vesselType || client.kind || client.type);
  return !type || type === VESSEL_TYPES.NATIVE;
}

function listNativeTunnelClients($i) {
  const latest = new Map();
  if (!$i.ws?.clients) return [];
  for (const client of $i.ws.clients) {
    if (!isNativeTunnelClient(client)) continue;
    const old = latest.get(client.tunnelName);
    if (!old || newestStamp(client) >= newestStamp(old)) latest.set(client.tunnelName, client);
  }
  return [...latest.values()];
}

function listNativeTunnels($i) { return listNativeTunnelClients($i).map(publicNativeTunnel); }
function findNativeTunnelClient($i, tunnelName) { return listNativeTunnelClients($i).find(client => client.tunnelName === tunnelName) || null; }
async function sendNativeTunnel($i, tunnelName, payload, timeoutMs) { return verifyTunnelResponse(await $i.ws.sendTunnelRequest(tunnelName, payload, timeoutMs), payload, tunnelName); }

module.exports = { findNativeTunnelClient, isNativeTunnelClient, listNativeTunnelClients, listNativeTunnels, newestStamp, publicNativeTunnel, sendNativeTunnel };
