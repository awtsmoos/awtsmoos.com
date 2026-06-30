// B"H
const { json } = require("../core/respond.js");
const { currentIdentity } = require("../core/auth.js");
const { listNativeTunnels } = require("./fsVessel/tunnelClient.js");
const { listBrowserTunnels } = require("./fsVessel/browserClient.js");
const { virtualOsDevice } = require("./fsVessel/virtualNames.js");
const { deviceWarnings, isLiveDevice, liveDevices } = require("./fsVessel/liveDevices.js");

function query($i) { return $i.paramKinds?.GET || $i.$_GET || $i.request?.query || {}; }
function identityPayload(identity) { return { kind: identity.kind, userId: identity.userId, clientId: identity.clientId || null }; }

/**
 * B"H
 * Chapter 13, rewritten after the ghost tunnel storm.
 *
 * The endpoint still reveals all known vessels for diagnostics, but it only
 * recommends live browser/native tunnels. A dead native agent must never be the
 * "recommended" route, because every agent that obeys it will fall into a 504.
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
  if (exact && isLiveDevice(exact)) return selected($i, identity, exact, nativeDevices, browserDevices, virtualDevice, "selected_vessel");
  if (exact && !isLiveDevice(exact)) return staleRequested($i, identity, exact, nativeDevices, browserDevices, virtualDevice);
  const recommended = recommend(nativeDevices, browserDevices, virtualDevice);
  if (recommended && !requested) return selected($i, identity, recommended, nativeDevices, browserDevices, virtualDevice, "recommended_vessel");
  if (!liveDevices(nativeDevices).length && !liveDevices(browserDevices).length) return noConnectedTunnel($i, identity, nativeDevices, browserDevices, virtualDevice);
  return multipleVessels($i, identity, requested, nativeDevices, browserDevices, virtualDevice, recommended);
}

function recommend(nativeDevices, browserDevices, virtualDevice) {
  const liveBrowsers = liveDevices(browserDevices);
  const liveNatives = liveDevices(nativeDevices);
  if (liveBrowsers.length === 1) return liveBrowsers[0];
  if (liveNatives.length === 1) return liveNatives[0];
  if (!liveBrowsers.length && !liveNatives.length) return virtualDevice;
  return null;
}

function base(identity, nativeDevices, browserDevices, virtualDevice) {
  return { BH: "B\"H", identity: identityPayload(identity), nativeDevices, browserDevices, virtualDevice, devices: [...browserDevices, ...nativeDevices, virtualDevice], warnings: deviceWarnings(nativeDevices, browserDevices) };
}

function notAuthenticated($i) {
  return json($i, { BH: "B\"H", ok: false, error: "not_authenticated", hint: "Sign in with Awtsmoos OAuth or open the control panel while logged in." }, 401);
}

function selected($i, identity, device, nativeDevices, browserDevices, virtualDevice, mode) {
  return json($i, { ...base(identity, nativeDevices, browserDevices, virtualDevice), ok: true, mode, tunnelName: device.tunnelName, device, recommended: device, tunnels: liveDevices(nativeDevices), guidance: "Use recommended.tunnelName, a live browser/native tunnel, or virtualDevice.tunnelName for hosted Awtsmoos OS." });
}

function staleRequested($i, identity, device, nativeDevices, browserDevices, virtualDevice) {
  const recommended = recommend(nativeDevices, browserDevices, virtualDevice);
  return json($i, { ...base(identity, nativeDevices, browserDevices, virtualDevice), ok: false, error: "tunnel_not_alive", requestedTunnelName: device.tunnelName, tunnelName: recommended?.tunnelName || virtualDevice.tunnelName, recommended, staleDevice: device, guidance: "Requested tunnel is registered but not alive. Restart it or route to virtualDevice.tunnelName." }, 409);
}

function noConnectedTunnel($i, identity, nativeDevices, browserDevices, virtualDevice) {
  return json($i, { ...base(identity, nativeDevices, browserDevices, virtualDevice), ok: false, error: "no_connected_tunnel", recommended: virtualDevice, tunnelName: virtualDevice.tunnelName, installUrl: "https://awtsmoos.com/apps/tunnel-control/", windowsCommand: "irm https://awtsmoos.com/api/tunnel/install/windows | iex", unixCommand: "curl -fsSL https://awtsmoos.com/api/tunnel/install/unix | bash", browserTabGuidance: "Open /apps/code or /apps/tunnel while logged in to register a browser-tab tunnel.", virtualFallbackGuidance: "Use /api/tunnel/control/fs/awtsmoos-virtual-os for hosted operations without an installed agent.", guidance: "Start a live native tunnel, open a browser-tab tunnel, or use the hosted Virtual OS." }, 404);
}

function multipleVessels($i, identity, requested, nativeDevices, browserDevices, virtualDevice, recommended) {
  return json($i, { ...base(identity, nativeDevices, browserDevices, virtualDevice), ok: false, error: "multiple_tunnels_connected", requestedTunnelName: requested || null, recommended, tunnelName: recommended?.tunnelName || null, tunnels: liveDevices(nativeDevices), guidance: requested ? "Requested vessel is not live/connected. Pick one returned live device or use virtualDevice.tunnelName." : "Multiple live vessels exist. Pick a tunnelName, or use recommended.tunnelName." }, 409);
}

module.exports = { myDevice, recommend };
