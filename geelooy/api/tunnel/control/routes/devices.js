// B"H

const { json } = require("../core/respond.js");
const { currentIdentity } = require("../core/auth.js");
const { listNativeTunnels } = require("./fsVessel/tunnelClient.js");
const { listBrowserTunnels } = require("./fsVessel/browserClient.js");
const { virtualOsDevice } = require("./fsVessel/virtualNames.js");
const { connectedNames, deviceWarnings, liveDevices } = require("./fsVessel/liveDevices.js");

/**
 * B"H
 * Chapter 8: Device discovery became one canonical mesh.
 *
 * This endpoint now matches `/my-device`: browser-tab vessels, native vessels,
 * stale diagnostics, and hosted Virtual OS all appear together. Only live
 * browser/native names are advertised as routable local tunnel names.
 */
async function devices($i) {
  const ident = currentIdentity($i);
  const nativeDevices = listNativeTunnels($i);
  const browserDevices = listBrowserTunnels($i);
  const virtualDevice = virtualOsDevice(!!ident.ok);
  const devices = [...browserDevices, ...nativeDevices, virtualDevice];
  const liveNative = liveDevices(nativeDevices);
  const liveBrowser = liveDevices(browserDevices);

  return json($i, {
    BH: "B\"H",
    ok: true,
    authenticated: !!ident.ok,
    identity: ident.ok ? ident : null,
    nativeDevices,
    browserDevices,
    virtualDevice,
    warnings: deviceWarnings(nativeDevices, browserDevices),
    switchHints: {
      virtualTunnelName: "awtsmoos-virtual-os",
      localTunnelNames: connectedNames(nativeDevices),
      browserTunnelNames: connectedNames(browserDevices),
      liveTunnelNames: [...connectedNames(browserDevices), ...connectedNames(nativeDevices)],
      yamlComment: "# targetVessel: virtual-os",
      apiExamples: [
        "/api/tunnel/control/fs/awtsmoos-virtual-os?action=list&p=.",
        "/api/tunnel/control/fs/auto?action=list&p=.&fallback=virtual-os"
      ]
    },
    recommended: liveBrowser[0] || liveNative[0] || virtualDevice,
    devices
  });
}

module.exports = { devices };
