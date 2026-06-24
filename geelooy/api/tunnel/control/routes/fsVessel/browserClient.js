// B"H

const { VESSEL_TYPES, isBrowserVesselDescriptor } = require("./vesselTypes.js");
const { browserCapabilities } = require("./capabilities.js");
const { verifyTunnelResponse } = require("./responseContract.js");

/**
 * B"H
 * Chapter 10 and 811: The browser tab entered honestly, and its replies now
 * must wear the same request seal as native tunnel replies.
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

function listBrowserTunnels($i) {
  return listBrowserTunnelClients($i).map(publicBrowserTunnel);
}

function findBrowserTunnelClient($i, tunnelName) {
  return listBrowserTunnelClients($i).find(client => client.tunnelName === tunnelName) || null;
}

async function sendBrowserTunnel($i, tunnelName, payload, timeoutMs) {
  const result = await $i.ws.sendTunnelRequest(tunnelName, payload, timeoutMs);
  return verifyTunnelResponse(result, payload, tunnelName);
}

module.exports = { findBrowserTunnelClient, listBrowserTunnelClients, listBrowserTunnels, publicBrowserTunnel, sendBrowserTunnel };
