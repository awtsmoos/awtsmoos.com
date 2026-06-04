// B"H

const {
  findNativeTunnelClient,
  listNativeTunnels,
  publicNativeTunnel,
  sendNativeTunnel
} = require("./tunnelClient.js");
const { sendVirtualOs } = require("./virtualClient.js");
const {
  VIRTUAL_OS_TUNNEL_NAME,
  hintsWantVirtualOs,
  isAutoTunnelName,
  isVirtualOsTunnelName
} = require("./virtualNames.js");

/**
 * B"H
 * Chapter 6: The Hidden Target Tore The Mask From The Route.
 *
 * A request may speak through the URL, through YAML, through a model tool
 * argument, or through a JSON body. Earlier, only `routeHints` were heard by
 * this resolver. The result: a caller could write `targetVessel: virtual-os`
 * and still be dragged into the native tunnel if the path wore a local
 * tunnelName. Now the Awtsmoos lets the explicit vessel request shine from
 * every garment before local metal is chosen.
 *
 * @param {object} options Routing options from the protected fs gateway.
 * @param {object} options.$i Awtsmoos request context.
 * @param {string} options.userId Authenticated user id.
 * @param {string} options.tunnelName Requested tunnel name.
 * @param {object} options.payload Action payload, including route hints.
 * @param {number} options.timeoutMs Request timeout.
 * @returns {{kind: string, tunnelName: string, send: Function}} Resolved vessel.
 */
function resolveFsVessel(options = {}) {
  const { $i, userId, tunnelName, payload = {}, timeoutMs } = options;
  const name = String(tunnelName || "").trim();
  const native = name ? findNativeTunnelClient($i, name) : null;
  const natives = listNativeTunnels($i);

  if (wantsVirtualOs(name, payload)) {
    return virtualVessel($i, userId, payload, "explicit_virtual_os");
  }

  if (native) {
    return nativeVessel($i, name, payload, timeoutMs, publicNativeTunnel(native));
  }

  if (isAutoTunnelName(name) && natives.length === 1) {
    const chosen = natives[0];
    return nativeVessel($i, chosen.tunnelName, payload, timeoutMs, chosen);
  }

  if (isAutoTunnelName(name) && hintsWantVirtualOs({ fallback: payload.fallback })) {
    return virtualVessel($i, userId, payload, "auto_fallback_virtual_os");
  }

  return missingVessel(name, natives);
}

/**
 * Determines whether any public request surface explicitly asks for Virtual OS.
 *
 * @param {string} tunnelName Requested tunnel name.
 * @param {object} payload Full action payload.
 * @returns {boolean} True when Virtual OS should win before native routing.
 */
function wantsVirtualOs(tunnelName, payload = {}) {
  return isVirtualOsTunnelName(tunnelName) ||
    hintsWantVirtualOs(payload.routeHints || {}) ||
    hintsWantVirtualOs(payload);
}

/**
 * Builds a native local-tunnel vessel.
 *
 * @param {object} $i Request context.
 * @param {string} tunnelName Local tunnel name.
 * @param {object} payload Payload for the local agent.
 * @param {number} timeoutMs Timeout for the relay.
 * @param {object} device Public native device descriptor.
 * @returns {object} Native vessel descriptor.
 */
function nativeVessel($i, tunnelName, payload, timeoutMs, device) {
  return {
    kind: "native-tunnel",
    tunnelName,
    device,
    async send() {
      const result = await sendNativeTunnel($i, tunnelName, payload, timeoutMs);
      return { ...result, vessel: "native-tunnel", tunnelName };
    }
  };
}

/**
 * Builds the hosted Virtual OS vessel.
 *
 * @param {object} $i Request context.
 * @param {string} userId Current user id.
 * @param {object} payload Payload for the hosted filesystem.
 * @param {string} reason Routing reason.
 * @returns {object} Virtual OS vessel descriptor.
 */
function virtualVessel($i, userId, payload, reason) {
  return {
    kind: "virtual-os",
    tunnelName: VIRTUAL_OS_TUNNEL_NAME,
    reason,
    async send() {
      return await sendVirtualOs($i, userId, payload);
    }
  };
}

/**
 * Creates a useful missing-vessel response with Virtual OS escape hatches.
 *
 * @param {string} tunnelName Requested tunnel name.
 * @param {object[]} nativeTunnels Connected native tunnels.
 * @returns {object} Missing vessel descriptor.
 */
function missingVessel(tunnelName, nativeTunnels) {
  return {
    kind: "missing",
    tunnelName,
    async send() {
      return {
        BH: "B\"H",
        ok: false,
        status: 404,
        error: "no_connected_tunnel",
        tunnelName: tunnelName || null,
        connectedTunnels: nativeTunnels,
        virtualFallback: {
          tunnelName: VIRTUAL_OS_TUNNEL_NAME,
          urlHint: `fs/${VIRTUAL_OS_TUNNEL_NAME}`,
          autoHint: "fs/auto?fallback=virtual-os",
          yamlComment: "# targetVessel: virtual-os"
        },
        guidance: "Use a connected local tunnelName, or set targetVessel=virtual-os for hosted Awtsmoos Virtual OS."
      };
    }
  };
}

module.exports = { resolveFsVessel, wantsVirtualOs };
