
// B"H

const { json } = require("../core/respond.js");
const { query } = require("../core/request.js");

/**
 * B"H
 * Returns only the requested tunnel's status.
 *
 * The hosted client no longer displays every connected device. It simply
 * verifies whether the tunnel name currently in the page is connected.
 */
async function device($i) {
  const q = query($i);
  const tunnelName = q.tunnelName || q.name || "";

  if (!tunnelName) {
    return json($i, {
      BH: "B\"H",
      ok: false,
      error: "missing_tunnelName"
    }, 400);
  }

  let found = null;

  if ($i.ws?.clients) {
    for (const client of $i.ws.clients) {
      if (!client.isTunnel) continue;
      if (client.tunnelName !== tunnelName) continue;

      found = {
        connected: true,
        tunnelName: client.tunnelName,
        deviceName: client.deviceName || null,
        root: client.root || null,
        allowWrite: !!client.allowWrite,
        allowSecrets: !!client.allowSecrets,
        isAlive: !!client.isAlive
      };
      break;
    }
  }

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
