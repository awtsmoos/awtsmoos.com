// B"H

const { json } = require("../core/respond.js");
const { currentIdentity } = require("../core/auth.js");
const { listNativeTunnels } = require("./fsVessel/tunnelClient.js");
const { virtualOsDevice } = require("./fsVessel/virtualNames.js");

/**
 * B"H
 * Chapter 8: The duplicate phantom was folded back into one clear vessel.
 *
 * Devices now exposes one hosted Virtual OS plus all connected native tunnels.
 * The virtual entry tells ChatGPT, Minimax, and any YAML custom-action runner
 * that no installed agent is required for hosted Awtsmoos OS operations.
 *
 * @param {object} $i Awtsmoos route context.
 * @returns {Promise<void>} JSON response.
 */
async function devices($i) {
  const ident = currentIdentity($i);
  const nativeDevices = listNativeTunnels($i);
  const devices = [virtualOsDevice(!!ident.ok), ...nativeDevices];

  return json($i, {
    BH: "B\"H",
    ok: true,
    authenticated: !!ident.ok,
    identity: ident.ok ? ident : null,
    switchHints: {
      virtualTunnelName: "awtsmoos-virtual-os",
      localTunnelNames: nativeDevices.map(device => device.tunnelName),
      yamlComment: "# targetVessel: virtual-os",
      apiExamples: [
        "/api/tunnel/control/fs/awtsmoos-virtual-os?action=list&p=.",
        "/api/tunnel/control/fs/auto?action=list&p=.&fallback=virtual-os"
      ]
    },
    devices
  });
}

module.exports = { devices };
