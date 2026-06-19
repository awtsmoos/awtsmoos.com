// B"H

const { VESSEL_TYPES, isBrowserVesselDescriptor, normalizeVesselType } = require("./vesselTypes.js");
const { nativeCapabilities } = require("./capabilities.js");

/**
 * B"H
 * Chapter 11: Native iron stopped swallowing the browser flame.
 *
 * The websocket registry may contain local Node tunnels and browser-tab tunnels.
 * Native helpers now filter out browser and hosted descriptors so old auto logic
 * does not accidentally route shell-shaped requests into a browser tab.
 */
function publicNativeTunnel(client) {
  return {
    connected: true,
    tunnelName: client.tunnelName,
    deviceName: client.deviceName || null,
    root: client.root || null,
    allowWrite: !!client.allowWrite,
    allowSecrets: !!client.allowSecrets,
    allowCommands: !!client.allowCommands,
    isAlive: !!client.isAlive,
    agentVersion: client.agentVersion || null,
    tools: client.tools || null,
    chrome: client.chrome || null,
    command: client.command || null,
    capabilities: nativeCapabilities(client),
    registeredAt: client.registeredAt || null,
    kind: VESSEL_TYPES.NATIVE,
    vesselType: VESSEL_TYPES.NATIVE
  };
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
    if (!old || (client.registeredAt || 0) >= (old.registeredAt || 0)) latest.set(client.tunnelName, client);
  }
  return [...latest.values()];
}

function listNativeTunnels($i) { return listNativeTunnelClients($i).map(publicNativeTunnel); }
function findNativeTunnelClient($i, tunnelName) { return listNativeTunnelClients($i).find(client => client.tunnelName === tunnelName) || null; }
async function sendNativeTunnel($i, tunnelName, payload, timeoutMs) {
  const result = await $i.ws.sendTunnelRequest(tunnelName, payload, timeoutMs);
  if (payload.controlRequestId && result.controlRequestId && result.controlRequestId !== payload.controlRequestId) {
    return { BH: "B\"H", ok: false, status: 409, error: "tunnel_response_request_id_mismatch", expectedControlRequestId: payload.controlRequestId, actualControlRequestId: result.controlRequestId, tunnelName };
  }
  return result;
}

module.exports = { findNativeTunnelClient, isNativeTunnelClient, listNativeTunnelClients, listNativeTunnels, publicNativeTunnel, sendNativeTunnel };
