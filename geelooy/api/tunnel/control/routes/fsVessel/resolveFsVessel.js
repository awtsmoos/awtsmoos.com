// B"H

const { findNativeTunnelClient, listNativeTunnels, publicNativeTunnel, sendNativeTunnel } = require("./tunnelClient.js");
const { findBrowserTunnelClient, listBrowserTunnels, publicBrowserTunnel, sendBrowserTunnel } = require("./browserClient.js");
const { sendVirtualOs } = require("./virtualClient.js");
const { VESSEL_TYPES, normalizeVesselType } = require("./vesselTypes.js");
const { VIRTUAL_OS_TUNNEL_NAME, hintsWantVirtualOs, isAutoTunnelName, isVirtualOsTunnelName } = require("./virtualNames.js");

/**
 * B"H
 * Chapter 12: Auto routing bowed before explicit will.
 *
 * The resolver now sees three real vessels: native installed agent, browser tab
 * tunnel, and hosted Virtual OS. Explicit targetVessel wins before tunnelName.
 * Auto prefers browser tab, then a single native tunnel, then hosted Virtual OS.
 */
function resolveFsVessel(options = {}) {
  const { $i, userId, tunnelName, payload = {}, timeoutMs } = options;
  const name = String(tunnelName || "").trim();
  const target = requestedVesselType(name, payload);
  const native = name ? findNativeTunnelClient($i, name) : null;
  const browser = name ? findBrowserTunnelClient($i, name) : null;
  const natives = listNativeTunnels($i);
  const browsers = listBrowserTunnels($i);

  if (target === VESSEL_TYPES.VIRTUAL_OS) return virtualVessel($i, userId, payload, "explicit_virtual_os");
  if (target === VESSEL_TYPES.BROWSER) {
    if (browser) return browserVessel($i, name, payload, timeoutMs, publicBrowserTunnel(browser), "explicit_browser_tab");
    if (isAutoTunnelName(name) && browsers.length === 1) return browserVessel($i, browsers[0].tunnelName, payload, timeoutMs, browsers[0], "explicit_browser_auto_single");
    return missingVessel(name, natives, browsers, "browser_tab_not_connected");
  }
  if (target === VESSEL_TYPES.NATIVE) {
    if (native) return nativeVessel($i, name, payload, timeoutMs, publicNativeTunnel(native), "explicit_native");
    if (isAutoTunnelName(name) && natives.length === 1) return nativeVessel($i, natives[0].tunnelName, payload, timeoutMs, natives[0], "explicit_native_auto_single");
    return missingVessel(name, natives, browsers, "native_tunnel_not_connected");
  }

  if (browser) return browserVessel($i, name, payload, timeoutMs, publicBrowserTunnel(browser), "exact_browser_tab");
  if (native) return nativeVessel($i, name, payload, timeoutMs, publicNativeTunnel(native), "exact_native_tunnel");
  if (isAutoTunnelName(name)) return autoVessel($i, userId, payload, timeoutMs, natives, browsers);
  return missingVessel(name, natives, browsers, "no_matching_vessel");
}

function requestedVesselType(tunnelName, payload = {}) {
  const explicit = normalizeVesselType(payload.targetVessel || payload.vessel || payload.fs || payload.routeHints?.targetVessel || "");
  if (explicit) return explicit;
  if (isVirtualOsTunnelName(tunnelName)) return VESSEL_TYPES.VIRTUAL_OS;
  if (isAutoTunnelName(tunnelName) && (hintsWantVirtualOs(payload.routeHints || {}) || hintsWantVirtualOs(payload))) return VESSEL_TYPES.VIRTUAL_OS;
  return "";
}

function autoVessel($i, userId, payload, timeoutMs, natives, browsers) {
  if (browsers.length === 1) return browserVessel($i, browsers[0].tunnelName, payload, timeoutMs, browsers[0], "auto_single_browser_tab");
  if (natives.length === 1) return nativeVessel($i, natives[0].tunnelName, payload, timeoutMs, natives[0], "auto_single_native_tunnel");
  if (hintsWantVirtualOs({ fallback: payload.fallback }) || (!browsers.length && !natives.length)) return virtualVessel($i, userId, payload, "auto_virtual_os");
  return missingVessel("auto", natives, browsers, "auto_ambiguous");
}

function nativeVessel($i, tunnelName, payload, timeoutMs, device, reason) {
  return { kind: VESSEL_TYPES.NATIVE, tunnelName, device, reason, async send() { const routedPayload = withProjectRoot(payload, device); const result = await sendNativeTunnel($i, tunnelName, routedPayload, timeoutMs); return { ...result, vessel: VESSEL_TYPES.NATIVE, tunnelName, routeReason: reason }; } };
}

function browserVessel($i, tunnelName, payload, timeoutMs, device, reason) {
  return { kind: VESSEL_TYPES.BROWSER, tunnelName, device, reason, async send() { const routedPayload = withProjectRoot(payload, device); const result = await sendBrowserTunnel($i, tunnelName, routedPayload, timeoutMs); return { ...result, vessel: VESSEL_TYPES.BROWSER, tunnelName, routeReason: reason }; } };
}

function withProjectRoot(payload = {}, device = {}) {
  if (payload.projectRoot || !device.root) return payload;
  payload.projectRoot = device.root;
  return payload;
}

function virtualVessel($i, userId, payload, reason) {
  return { kind: VESSEL_TYPES.VIRTUAL_OS, tunnelName: VIRTUAL_OS_TUNNEL_NAME, reason, async send() { const result = await sendVirtualOs($i, userId, payload); return { ...result, routeReason: reason }; } };
}

function missingVessel(tunnelName, nativeTunnels, browserTunnels, reason) {
  return { kind: VESSEL_TYPES.MISSING, tunnelName, reason, async send() { return { BH: "B\"H", ok: false, status: 404, error: "no_connected_tunnel", reason, tunnelName: tunnelName || null, nativeTunnels, browserTunnels, connectedTunnels: [...browserTunnels, ...nativeTunnels], virtualFallback: { tunnelName: VIRTUAL_OS_TUNNEL_NAME, urlHint: `fs/${VIRTUAL_OS_TUNNEL_NAME}`, autoHint: "fs/auto?fallback=virtual-os", yamlComment: "# targetVessel: virtual-os" }, guidance: "Use a connected native/browser tunnelName, open /apps/code for browser-tab mode, or set targetVessel=virtual-os." }; } };
}

function wantsVirtualOs(tunnelName, payload = {}) { return requestedVesselType(tunnelName, payload) === VESSEL_TYPES.VIRTUAL_OS; }
module.exports = { resolveFsVessel, requestedVesselType, wantsVirtualOs };
