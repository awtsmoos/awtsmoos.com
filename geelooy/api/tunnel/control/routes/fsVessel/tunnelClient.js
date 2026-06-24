// B"H

const { VESSEL_TYPES, isBrowserVesselDescriptor, normalizeVesselType } = require("./vesselTypes.js");
const { nativeCapabilities } = require("./capabilities.js");
const { verifyTunnelResponse } = require("./responseContract.js");

/**
 * B"H
 * Chapter 11 and 810: Native iron stopped swallowing the browser flame, and
 * every native response now must show the seal of the exact request.
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

function listNativeTunnels($i) {
  return listNativeTunnelClients($i).map(publicNativeTunnel);
}

function findNativeTunnelClient($i, tunnelName) {
  return listNativeTunnelClients($i).find(client => client.tunnelName === tunnelName) || null;
}

async function sendNativeTunnel($i, tunnelName, payload, timeoutMs) {
  const result = await $i.ws.sendTunnelRequest(tunnelName, payload, timeoutMs);
  return verifyTunnelResponse(result, payload, tunnelName);
}

module.exports = { findNativeTunnelClient, isNativeTunnelClient, listNativeTunnelClients, listNativeTunnels, publicNativeTunnel, sendNativeTunnel };
