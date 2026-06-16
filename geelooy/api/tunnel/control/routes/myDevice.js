// B"H
const { json } = require("../core/respond.js");
const { currentIdentity } = require("../core/auth.js");
const { listNativeTunnels } = require("./fsVessel/tunnelClient.js");
const { listBrowserTunnels } = require("./fsVessel/browserClient.js");
const { virtualOsDevice } = require("./fsVessel/virtualNames.js");

function query($i) { return $i.paramKinds?.GET || $i.$_GET || $i.request?.query || {}; }
function identityPayload(identity) { return { kind: identity.kind, userId: identity.userId, clientId: identity.clientId || null }; }

/**
 * B"H
 * Chapter 13: My device became my vessels.
 *
 * The old route answered only the native installed agent question. Production
 * tunnel-control needs the whole truth: native agents, browser-tab agents, and
 * hosted Virtual OS. Old fields remain for compatibility, while new arrays give
 * every AI and UI a complete routing map.
 */
async function myDevice($i) {
  const identity = currentIdentity($i);
  if (!identity.ok) return notAuthenticated($i);
  const q = query($i);
  const requested = String(q.tunnelName || q.tunnel || "").trim();
  const nativeDevices = listNativeTunnels($i);
  const browserDevices = listBrowserTunnels($i);
  const virtualDevice = virtualOsDevice(true);
  const allDevices = [...browserDevices, ...nativeDevices, virtualDevice];
  const exact = requested ? allDevices.find(t => t.tunnelName === requested || t.aliases?.includes(requested)) : null;
  if (exact) return selected($i, identity, exact, nativeDevices, browserDevices, virtualDevice, "selected_vessel");
  const recommended = recommend(nativeDevices, browserDevices, virtualDevice);
  if (recommended && !requested) return selected($i, identity, recommended, nativeDevices, browserDevices, virtualDevice, "recommended_vessel");
  if (!nativeDevices.length && !browserDevices.length) return noConnectedTunnel($i, identity, virtualDevice);
  return multipleVessels($i, identity, requested, nativeDevices, browserDevices, virtualDevice, recommended);
}

function recommend(nativeDevices, browserDevices, virtualDevice) {
  if (browserDevices.length === 1) return browserDevices[0];
  if (nativeDevices.length === 1) return nativeDevices[0];
  return virtualDevice;
}

function base(identity, nativeDevices, browserDevices, virtualDevice) {
  return { BH: "B\"H", identity: identityPayload(identity), nativeDevices, browserDevices, virtualDevice, devices: [...browserDevices, ...nativeDevices, virtualDevice] };
}

function notAuthenticated($i) {
  return json($i, { BH: "B\"H", ok: false, error: "not_authenticated", hint: "Sign in with Awtsmoos OAuth or open the control panel while logged in." }, 401);
}

function selected($i, identity, device, nativeDevices, browserDevices, virtualDevice, mode) {
  return json($i, { ...base(identity, nativeDevices, browserDevices, virtualDevice), ok: true, mode, tunnelName: device.tunnelName, device, recommended: device, tunnels: nativeDevices, guidance: "Use recommended.tunnelName, a listed browser/native tunnel, or virtualDevice.tunnelName for hosted Awtsmoos OS." });
}

function noConnectedTunnel($i, identity, virtualDevice) {
  return json($i, { ...base(identity, [], [], virtualDevice), ok: false, error: "no_connected_tunnel", recommended: virtualDevice, tunnelName: virtualDevice.tunnelName, installUrl: "https://awtsmoos.com/apps/tunnel-control/", windowsCommand: "irm https://awtsmoos.com/api/tunnel/install/windows | iex", unixCommand: "curl -fsSL https://awtsmoos.com/api/tunnel/install/unix | bash", browserTabGuidance: "Open /apps/code or /apps/tunnel while logged in to register a browser-tab tunnel.", virtualFallbackGuidance: "Use /api/tunnel/control/fs/awtsmoos-virtual-os for hosted operations without an installed agent.", guidance: "Start a native tunnel, open a browser-tab tunnel, or use the hosted Virtual OS." }, 404);
}

function multipleVessels($i, identity, requested, nativeDevices, browserDevices, virtualDevice, recommended) {
  return json($i, { ...base(identity, nativeDevices, browserDevices, virtualDevice), ok: false, error: "multiple_tunnels_connected", requestedTunnelName: requested || null, recommended, tunnelName: recommended?.tunnelName || null, tunnels: nativeDevices, guidance: requested ? "Requested vessel is not connected. Pick one returned device or use virtualDevice.tunnelName." : "Multiple vessels exist. Pick a tunnelName, or use recommended.tunnelName." }, 409);
}

module.exports = { myDevice };
