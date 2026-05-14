
// B"H

const { json } = require("../core/respond.js");
const { currentIdentity } = require("../core/auth.js");

function publicTunnel(client) {
  return {
    connected: true,
    tunnelName: client.tunnelName,
    deviceName: client.deviceName || null,
    root: client.root || null,
    allowWrite: !!client.allowWrite,
    allowSecrets: !!client.allowSecrets,
    allowCommands: !!client.allowCommands,
    isAlive: !!client.isAlive,
    agentVersion: client.agentVersion || null
  };
}

function listTunnels($i) {
  const out = [];

  if (!$i.ws?.clients) return out;

  for (const client of $i.ws.clients) {
    if (!client.isTunnel) continue;
    out.push(publicTunnel(client));
  }

  return out;
}

/**
 * B"H
 * OAuth/session helper for public GPTs.
 *
 * Since each logged-in Awtsmoos user normally has one active local tunnel,
 * this lets ChatGPT discover the connected tunnel after OAuth instead of
 * always asking the user to paste tunnelName.
 *
 * Later, when tunnels are tied to userId in the websocket registry, filter
 * by identity.userId here. For now, if exactly one tunnel is online, return it.
 */
async function myDevice($i) {
  const identity = currentIdentity($i);

  if (!identity.ok) {
    return json($i, {
      BH: "B\"H",
      ok: false,
      error: "not_authenticated",
      hint: "Sign in with Awtsmoos OAuth or open the control panel while logged in."
    }, 401);
  }

  const tunnels = listTunnels($i);

  if (tunnels.length === 1) {
    return json($i, {
      BH: "B\"H",
      ok: true,
      mode: "single_connected_tunnel",
      identity: {
        kind: identity.kind,
        userId: identity.userId,
        clientId: identity.clientId || null
      },
      tunnelName: tunnels[0].tunnelName,
      device: tunnels[0],
      guidance: "Use this tunnelName automatically for future fs calls."
    });
  }

  if (tunnels.length === 0) {
    return json($i, {
      BH: "B\"H",
      ok: false,
      error: "no_connected_tunnel",
      identity: {
        kind: identity.kind,
        userId: identity.userId,
        clientId: identity.clientId || null
      },
      installUrl: "https://awtsmoos.com/apps/tunnel-control/",
      windowsCommand: "irm https://awtsmoos.com/api/tunnel/install/windows | iex",
      unixCommand: "curl -fsSL https://awtsmoos.com/api/tunnel/install/unix | bash",
      guidance: "Tell the user to run or restart the Awtsmoos tunnel agent, then retry my-device."
    }, 404);
  }

  return json($i, {
    BH: "B\"H",
    ok: false,
    error: "multiple_tunnels_connected",
    tunnels,
    guidance: "Ask the user which tunnelName to use."
  }, 409);
}

module.exports = { myDevice };
