
// B"H

const { json } = require("../core/respond.js");
const { query } = require("../core/request.js");

function publicTunnel(client) {
  return {
    connected: true,
    tunnelName: client.tunnelName,
    deviceName: client.deviceName || null,
    root: client.root || null,
    allowWrite: !!client.allowWrite,
    allowSecrets: !!client.allowSecrets,
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
 * Returns requested tunnel status.
 *
 * If tunnelName is missing and exactly one agent is connected, return that one.
 * This lets the hosted control panel recover after it opens without query params.
 */
async function device($i) {
  const q = query($i);
  const tunnelName = q.tunnelName || q.name || "";
  const tunnels = listTunnels($i);

  if (!tunnelName) {
    if (tunnels.length === 1) {
      const found = tunnels[0];

      return json($i, {
        BH: "B\"H",
        ok: true,
        recovered: true,
        tunnelName: found.tunnelName,
        connected: true,
        device: found
      });
    }

    return json($i, {
      BH: "B\"H",
      ok: false,
      error: "missing_tunnelName",
      connectedTunnels: tunnels.length,
      hint: "Open the control panel with ?tunnelName=awt-... or connect exactly one agent."
    }, 400);
  }

  const found = tunnels.find(t => t.tunnelName === tunnelName) || null;

  return json($i, {
    BH: "B\"H",
    ok: true,
    tunnelName,
    connected: !!found,
    device: found || {
      connected: false,
      tunnelName
    }
  });
}

module.exports = { device };
