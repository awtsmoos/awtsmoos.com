// B"H

/**
 * B"H
 * Chapter 3: The native tunnels marched like iron rivers under the palace.
 *
 * This module knows only living websocket tunnel clients. It does not decide
 * policy. It only lists, finds, and sends into the real local agent when the
 * resolver has already chosen that vessel.
 *
 * @param {object} client Websocket client registered as a tunnel.
 * @returns {object} Public tunnel descriptor.
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
    registeredAt: client.registeredAt || null,
    kind: "native-tunnel"
  };
}

/**
 * B"H
 * Lists latest native tunnel clients by tunnel name.
 *
 * @param {object} $i Awtsmoos route context.
 * @returns {Array<object>} Latest registered native tunnel clients.
 */
function listNativeTunnelClients($i) {
  const latest = new Map();
  if (!$i.ws?.clients) return [];

  for (const client of $i.ws.clients) {
    if (!client.isTunnel || !client.tunnelName) continue;
    const old = latest.get(client.tunnelName);
    if (!old || (client.registeredAt || 0) >= (old.registeredAt || 0)) {
      latest.set(client.tunnelName, client);
    }
  }

  return [...latest.values()];
}

/**
 * B"H
 * Lists public native tunnel descriptors.
 *
 * @param {object} $i Awtsmoos route context.
 * @returns {Array<object>} Public descriptors.
 */
function listNativeTunnels($i) {
  return listNativeTunnelClients($i).map(publicNativeTunnel);
}

/**
 * B"H
 * Finds a native tunnel client by name.
 *
 * @param {object} $i Awtsmoos route context.
 * @param {string} tunnelName Requested tunnel name.
 * @returns {object|null} Native tunnel client or null.
 */
function findNativeTunnelClient($i, tunnelName) {
  return listNativeTunnelClients($i).find(
    client => client.tunnelName === tunnelName
  ) || null;
}

/**
 * B"H
 * Sends the payload through the websocket relay to a native agent.
 *
 * @param {object} $i Awtsmoos route context.
 * @param {string} tunnelName Native tunnel name.
 * @param {object} payload Action payload.
 * @param {number} timeoutMs Timeout in milliseconds.
 * @returns {Promise<object>} Native agent result.
 */
async function sendNativeTunnel($i, tunnelName, payload, timeoutMs) {
  return await $i.ws.sendTunnelRequest(tunnelName, payload, timeoutMs);
}

module.exports = {
  findNativeTunnelClient,
  listNativeTunnelClients,
  listNativeTunnels,
  publicNativeTunnel,
  sendNativeTunnel
};
