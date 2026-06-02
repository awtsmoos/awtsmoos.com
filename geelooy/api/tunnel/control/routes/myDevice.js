// B"H
const { json } = require("../core/respond.js");
const { currentIdentity } = require("../core/auth.js");
const { listNativeTunnels } = require("./fsVessel/tunnelClient.js");
const { virtualOsDevice } = require("./fsVessel/virtualNames.js");

function query($i) {
  return $i.paramKinds?.GET || $i.$_GET || $i.request?.query || {};
}

function truthy(value) {
  return value === true || value === "true" || value === "1" || value === 1;
}

function identityPayload(identity) {
  return {
    kind: identity.kind,
    userId: identity.userId,
    clientId: identity.clientId || null
  };
}

/**
 * B"H
 * Chapter 9: The installer door stayed honest while the virtual crown waited.
 *
 * `my-device` still auto-selects only real local agents, so installation flow
 * remains truthful. Callers that understand hosted operations may add
 * `includeVirtual=1` and receive the Virtual OS descriptor beside the native
 * tunnel result.
 *
 * @param {object} $i Awtsmoos route context.
 * @returns {Promise<void>} JSON response.
 */
async function myDevice($i) {
  const identity = currentIdentity($i);
  if (!identity.ok) return notAuthenticated($i);

  const q = query($i);
  const requested = String(q.tunnelName || q.tunnel || "").trim();
  const includeVirtual = truthy(q.includeVirtual);
  const tunnels = listNativeTunnels($i);
  const virtualDevice = includeVirtual ? virtualOsDevice(true) : null;

  if (requested) {
    const exact = tunnels.find(t => t.tunnelName === requested);
    if (exact) return selected($i, identity, exact, tunnels, virtualDevice);
  }

  if (tunnels.length === 1) {
    return selected($i, identity, tunnels[0], tunnels, virtualDevice, "single_connected_tunnel");
  }

  if (tunnels.length === 0) {
    return noConnectedTunnel($i, identity, virtualDevice);
  }

  return multipleTunnels($i, identity, requested, tunnels, virtualDevice);
}

function notAuthenticated($i) {
  return json($i, {
    BH: "B\"H",
    ok: false,
    error: "not_authenticated",
    hint: "Sign in with Awtsmoos OAuth or open the control panel while logged in."
  }, 401);
}

function selected($i, identity, device, tunnels, virtualDevice, mode = "selected_tunnel") {
  return json($i, {
    BH: "B\"H",
    ok: true,
    mode,
    identity: identityPayload(identity),
    tunnelName: device.tunnelName,
    device,
    tunnels,
    ...(virtualDevice ? { virtualDevice } : {}),
    guidance: "Use this native tunnelName, or switch to virtualDevice.tunnelName for hosted Awtsmoos OS."
  });
}

function noConnectedTunnel($i, identity, virtualDevice) {
  return json($i, {
    BH: "B\"H",
    ok: false,
    error: "no_connected_tunnel",
    identity: identityPayload(identity),
    ...(virtualDevice ? { virtualDevice } : {}),
    installUrl: "https://awtsmoos.com/apps/tunnel-control/",
    windowsCommand: "irm https://awtsmoos.com/api/tunnel/install/windows | iex",
    unixCommand: "curl -fsSL https://awtsmoos.com/api/tunnel/install/unix | bash",
    virtualFallbackGuidance: virtualDevice
      ? "Use /api/tunnel/control/fs/awtsmoos-virtual-os for hosted operations without an installed agent."
      : "Add includeVirtual=1 to also receive the hosted Virtual OS device descriptor.",
    guidance: "Run or restart the Awtsmoos tunnel agent, then retry."
  }, 404);
}

function multipleTunnels($i, identity, requested, tunnels, virtualDevice) {
  return json($i, {
    BH: "B\"H",
    ok: false,
    error: "multiple_tunnels_connected",
    identity: identityPayload(identity),
    requestedTunnelName: requested || null,
    tunnels,
    ...(virtualDevice ? { virtualDevice } : {}),
    guidance: requested
      ? "Requested tunnelName is not connected. Pick one returned tunnel or use virtualDevice.tunnelName."
      : "Multiple native tunnels are connected. Use tunnelName query parameter, or switch to virtual OS."
  }, 409);
}

module.exports = { myDevice };
