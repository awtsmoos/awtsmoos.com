
// B"H

const { json } = require("../core/respond.js");
const { currentIdentity } = require("../core/auth.js");

async function devices($i) {
  const ident = currentIdentity($i);
  const devices = [];

  devices.push({
    tunnelName: "awtsmoos-virtual-os",
    deviceName: "Awtsmoos Virtual OS",
    root: "awtsmoos://virtual-os",
    allowWrite: true,
    allowSecrets: false,
    isAlive: true,
    synthetic: true,
    kind: "virtual-os",
    ownedByCurrentUser: !!ident.ok
  });

  devices.push({
    tunnelName: "awtsmoos-virtual-os",
    deviceName: "Awtsmoos Virtual OS",
    root: "awtsmoos://virtual-os",
    allowWrite: true,
    allowSecrets: false,
    isAlive: true,
    synthetic: true,
    kind: "virtual-os",
    ownedByCurrentUser: !!ident.ok
  });

  if ($i.ws?.clients) {
    for (const client of $i.ws.clients) {
      if (!client.isTunnel) continue;

      devices.push({
        tunnelName: client.tunnelName || null,
        deviceName: client.deviceName || null,
        root: client.root || null,
        allowWrite: !!client.allowWrite,
        allowSecrets: !!client.allowSecrets,
        isAlive: !!client.isAlive,
        ownedByCurrentUser: false
      });
    }
  }

  return json($i, {
    BH: "B\"H",
    ok: true,
    authenticated: !!ident.ok,
    identity: ident.ok ? ident : null,
    devices
  });
}

module.exports = { devices };
