// B"H

const { VESSEL_TYPES, isBrowserVesselDescriptor } = require("./vesselTypes.js");
const { browserCapabilities } = require("./capabilities.js");

/**
 * B"H
 * Chapter 10: The browser tab entered the registry without stealing the throne.
 *
 * Native clients and browser clients both arrive through websocket clients, but
 * the browser tab must be named honestly. These helpers filter and describe only
 * browser-tab vessels, leaving native policy in tunnelClient.js.
 */
function listBrowserTunnelClients($i) {
  const latest = new Map();
  if (!$i.ws?.clients) return [];
  for (const client of $i.ws.clients) {
    if (!client.isTunnel || !client.tunnelName) continue;
    if (!isBrowserVesselDescriptor(client)) continue;
    const old = latest.get(client.tunnelName);
    if (!old || (client.registeredAt || 0) >= (old.registeredAt || 0)) latest.set(client.tunnelName, client);
  }
  return [...latest.values()];
}

function publicBrowserTunnel(client) {
  return {
    connected: true,
    tunnelName: client.tunnelName,
    deviceName: client.deviceName || "Browser Tab",
    root: client.root || "browser://workspace",
    allowWrite: client.allowWrite !== false,
    allowSecrets: false,
    allowCommands: false,
    commandMode: "simulated",
    isAlive: !!client.isAlive,
    agentVersion: client.agentVersion || null,
    tools: client.tools || null,
    capabilities: browserCapabilities(client),
    registeredAt: client.registeredAt || null,
    kind: VESSEL_TYPES.BROWSER,
    vesselType: VESSEL_TYPES.BROWSER
  };
}

function listBrowserTunnels($i) { return listBrowserTunnelClients($i).map(publicBrowserTunnel); }
function findBrowserTunnelClient($i, tunnelName) { return listBrowserTunnelClients($i).find(client => client.tunnelName === tunnelName) || null; }
async function sendBrowserTunnel($i, tunnelName, payload, timeoutMs) {
  const result = await $i.ws.sendTunnelRequest(tunnelName, payload, timeoutMs);
  if (payload.controlRequestId && result.controlRequestId && result.controlRequestId !== payload.controlRequestId) {
    return { BH: "B\"H", ok: false, status: 409, error: "tunnel_response_request_id_mismatch", expectedControlRequestId: payload.controlRequestId, actualControlRequestId: result.controlRequestId, tunnelName };
  }
  return result;
}

module.exports = { findBrowserTunnelClient, listBrowserTunnelClients, listBrowserTunnels, publicBrowserTunnel, sendBrowserTunnel };
