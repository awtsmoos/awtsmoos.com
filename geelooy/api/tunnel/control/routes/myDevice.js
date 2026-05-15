
// B"H
const { json } = require("../core/respond.js");
const { currentIdentity } = require("../core/auth.js");

function query($i) {
  return $i.paramKinds?.GET || $i.$_GET || $i.request?.query || {};
}

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
    agentVersion: client.agentVersion || null,
    tools: client.tools || null,
    chrome: client.chrome || null,
    command: client.command || null,
    registeredAt: client.registeredAt || null
  };
}

function listTunnels($i) {
  const latestByName = new Map();

  if (!$i.ws?.clients) return [];

  for (const client of $i.ws.clients) {
    if (!client.isTunnel || !client.tunnelName) continue;

    const old = latestByName.get(client.tunnelName);
    if (!old || (client.registeredAt || 0) >= (old.registeredAt || 0)) {
      latestByName.set(client.tunnelName, client);
    }
  }

  return Array.from(latestByName.values()).map(publicTunnel);
}

function identityPayload(identity) {
  return {
    kind: identity.kind,
    userId: identity.userId,
    clientId: identity.clientId || null
  };
}

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

  const q = query($i);
  const requested = String(q.tunnelName || q.tunnel || "").trim();
  const tunnels = listTunnels($i);

  if (requested) {
    const exact = tunnels.find(t => t.tunnelName === requested);

    if (exact) {
      return json($i, {
        BH: "B\"H",
        ok: true,
        mode: "selected_tunnel",
        identity: identityPayload(identity),
        tunnelName: exact.tunnelName,
        device: exact,
        tunnels,
        guidance: "Selected the requested tunnelName."
      });
    }
  }

  if (tunnels.length === 1) {
    return json($i, {
      BH: "B\"H",
      ok: true,
      mode: "single_connected_tunnel",
      identity: identityPayload(identity),
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
      identity: identityPayload(identity),
      installUrl: "https://awtsmoos.com/apps/tunnel-control/",
      windowsCommand: "irm https://awtsmoos.com/api/tunnel/install/windows | iex",
      unixCommand: "curl -fsSL https://awtsmoos.com/api/tunnel/install/unix | bash",
      guidance: "Run or restart the Awtsmoos tunnel agent, then retry."
    }, 404);
  }

  return json($i, {
    BH: "B\"H",
    ok: false,
    error: "multiple_tunnels_connected",
    identity: identityPayload(identity),
    requestedTunnelName: requested || null,
    tunnels,
    guidance: requested
      ? "Requested tunnelName is not connected. Pick one of the returned tunnel names."
      : "Multiple tunnels are connected. Use tunnelName query parameter to select one."
  }, 409);
}

module.exports = { myDevice };
