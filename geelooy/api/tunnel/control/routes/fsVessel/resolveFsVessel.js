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
 * Chapter 5: Two roots asked to wear one crown.
 *
 * This resolver is the narrow bridge. It lets a caller keep one action shape
 * while choosing local metal or hosted light. The Awtsmoos has no body and no
 * form, but the code must choose a vessel before any operation descends.
 *
 * @param {object} options Routing options.
 * @returns {object} Vessel with send() method.
 */
function resolveFsVessel(options = {}) {
  const { $i, userId, tunnelName, payload, timeoutMs } = options;
  const name = String(tunnelName || "").trim();
  const hints = payload.routeHints || {};
  const native = name ? findNativeTunnelClient($i, name) : null;
  const natives = listNativeTunnels($i);

  if (isVirtualOsTunnelName(name) || hintsWantVirtualOs(hints)) {
    return virtualVessel($i, userId, payload, "explicit_virtual_os");
  }

  if (native) {
    return nativeVessel($i, name, payload, timeoutMs, publicNativeTunnel(native));
  }

  if (isAutoTunnelName(name) && natives.length === 1) {
    const chosen = natives[0];
    return nativeVessel($i, chosen.tunnelName, payload, timeoutMs, chosen);
  }

  if (isAutoTunnelName(name) && hintsWantVirtualOs({ fallback: hints.fallback })) {
    return virtualVessel($i, userId, payload, "auto_fallback_virtual_os");
  }

  return missingVessel(name, natives);
}

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
        guidance: "Use a connected local tunnelName, or switch this same action to the hosted Awtsmoos Virtual OS."
      };
    }
  };
}

module.exports = { resolveFsVessel };
