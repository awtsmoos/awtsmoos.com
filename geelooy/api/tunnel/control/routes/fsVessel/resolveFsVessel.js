// B"H

const { findNativeTunnelClient, listNativeTunnels, publicNativeTunnel, sendNativeTunnel } = require("./tunnelClient.js");
const { findBrowserTunnelClient, listBrowserTunnels, publicBrowserTunnel, sendBrowserTunnel } = require("./browserClient.js");
const { sendVirtualOs } = require("./virtualClient.js");
const { VESSEL_TYPES, normalizeVesselType } = require("./vesselTypes.js");
const { VIRTUAL_OS_TUNNEL_NAME, hintsWantVirtualOs, isAutoTunnelName, isVirtualOsTunnelName } = require("./virtualNames.js");
const { isControlRouteAction, isLiveDevice, liveDevices } = require("./liveDevices.js");

/** B"H — Chapter 13: the doctor may enter the sickroom even when the guard says stale. */
function resolveFsVessel(options = {}) {
  const { $i, userId, tunnelName, payload = {}, timeoutMs } = options;
  const name = String(tunnelName || "").trim(), target = requestedVesselType(name, payload);
  const nativeClient = name ? findNativeTunnelClient($i, name) : null, browserClient = name ? findBrowserTunnelClient($i, name) : null;
  const native = nativeClient ? publicNativeTunnel(nativeClient) : null, browser = browserClient ? publicBrowserTunnel(browserClient) : null;
  const allNatives = listNativeTunnels($i), allBrowsers = listBrowserTunnels($i), natives = liveDevices(allNatives), browsers = liveDevices(allBrowsers);
  if (target === VESSEL_TYPES.VIRTUAL_OS) return virtualVessel($i, userId, payload, "explicit_virtual_os");
  if (target === VESSEL_TYPES.BROWSER) return resolveBrowser($i, name, payload, timeoutMs, browser, browsers, allNatives, allBrowsers);
  if (target === VESSEL_TYPES.NATIVE) return resolveNative($i, name, payload, timeoutMs, native, natives, allNatives, allBrowsers);
  if (browser && (isLiveDevice(browser) || isControlRouteAction(payload))) return browserVessel($i, name, payload, timeoutMs, browser, isLiveDevice(browser) ? "exact_browser_tab" : "stale_browser_control_probe");
  if (browser) return staleVessel(name, allNatives, allBrowsers, "browser_tab_not_alive");
  if (native && (isLiveDevice(native) || isControlRouteAction(payload))) return nativeVessel($i, name, payload, timeoutMs, native, isLiveDevice(native) ? "exact_native_tunnel" : "stale_native_control_probe");
  if (native) return staleVessel(name, allNatives, allBrowsers, "native_tunnel_not_alive");
  if (isAutoTunnelName(name)) return autoVessel($i, userId, payload, timeoutMs, allNatives, allBrowsers, natives, browsers);
  return missingVessel(name, allNatives, allBrowsers, "no_matching_vessel");
}
function resolveBrowser($i, name, payload, timeoutMs, browser, browsers, allNatives, allBrowsers) { if (browser && (isLiveDevice(browser) || isControlRouteAction(payload))) return browserVessel($i, name, payload, timeoutMs, browser, isLiveDevice(browser) ? "explicit_browser_tab" : "stale_browser_control_probe"); if (browser) return staleVessel(name, allNatives, allBrowsers, "browser_tab_not_alive"); if (isAutoTunnelName(name) && browsers.length === 1) return browserVessel($i, browsers[0].tunnelName, payload, timeoutMs, browsers[0], "explicit_browser_auto_single"); return missingVessel(name, allNatives, allBrowsers, "browser_tab_not_connected"); }
function resolveNative($i, name, payload, timeoutMs, native, natives, allNatives, allBrowsers) { if (native && (isLiveDevice(native) || isControlRouteAction(payload))) return nativeVessel($i, name, payload, timeoutMs, native, isLiveDevice(native) ? "explicit_native" : "stale_native_control_probe"); if (native) return staleVessel(name, allNatives, allBrowsers, "native_tunnel_not_alive"); if (isAutoTunnelName(name) && natives.length === 1) return nativeVessel($i, natives[0].tunnelName, payload, timeoutMs, natives[0], "explicit_native_auto_single"); return missingVessel(name, allNatives, allBrowsers, "native_tunnel_not_connected"); }
function requestedVesselType(tunnelName, payload = {}) { const explicit = normalizeVesselType(payload.targetVessel || payload.vessel || payload.fs || payload.routeHints?.targetVessel || ""); if (explicit) return explicit; if (isVirtualOsTunnelName(tunnelName)) return VESSEL_TYPES.VIRTUAL_OS; if (isAutoTunnelName(tunnelName) && (hintsWantVirtualOs(payload.routeHints || {}) || hintsWantVirtualOs(payload))) return VESSEL_TYPES.VIRTUAL_OS; return ""; }
function autoVessel($i, userId, payload, timeoutMs, allNatives, allBrowsers, natives, browsers) { if (browsers.length === 1) return browserVessel($i, browsers[0].tunnelName, payload, timeoutMs, browsers[0], "auto_single_browser_tab"); if (natives.length === 1) return nativeVessel($i, natives[0].tunnelName, payload, timeoutMs, natives[0], "auto_single_native_tunnel"); if (hintsWantVirtualOs({ fallback: payload.fallback }) || (!browsers.length && !natives.length)) return virtualVessel($i, userId, payload, "auto_virtual_os"); return missingVessel("auto", allNatives, allBrowsers, "auto_ambiguous"); }
function nativeVessel($i, tunnelName, payload, timeoutMs, device, reason) { return { kind:VESSEL_TYPES.NATIVE, tunnelName, device, reason, async send() { const result = await sendNativeTunnel($i, tunnelName, withProjectRoot(payload, device), timeoutMs); return { ...result, vessel:VESSEL_TYPES.NATIVE, tunnelName, routeReason:reason }; } }; }
function browserVessel($i, tunnelName, payload, timeoutMs, device, reason) { return { kind:VESSEL_TYPES.BROWSER, tunnelName, device, reason, async send() { const result = await sendBrowserTunnel($i, tunnelName, withProjectRoot(payload, device), timeoutMs); return { ...result, vessel:VESSEL_TYPES.BROWSER, tunnelName, routeReason:reason }; } }; }
function withProjectRoot(payload = {}, device = {}) { return payload.projectRoot || !device.root ? payload : { ...payload, projectRoot:device.root }; }
function virtualVessel($i, userId, payload, reason) { return { kind:VESSEL_TYPES.VIRTUAL_OS, tunnelName:VIRTUAL_OS_TUNNEL_NAME, reason, async send() { const result = await sendVirtualOs($i, userId, payload); return { ...result, routeReason:reason }; } }; }
function staleVessel(tunnelName, nativeTunnels, browserTunnels, reason) { const stale = [...browserTunnels, ...nativeTunnels].find(t => t.tunnelName === tunnelName) || null; return vesselError(tunnelName, nativeTunnels, browserTunnels, reason, "tunnel_not_alive", 409, stale); }
function missingVessel(tunnelName, nativeTunnels, browserTunnels, reason) { return vesselError(tunnelName, nativeTunnels, browserTunnels, reason, "no_connected_tunnel", 404, null); }
function vesselError(tunnelName, nativeTunnels, browserTunnels, reason, error, status, staleDevice) { return { kind:VESSEL_TYPES.MISSING, tunnelName, reason, async send() { return { BH:"B\"H", ok:false, status, error, reason, tunnelName:tunnelName || null, staleDevice, nativeTunnels, browserTunnels, connectedTunnels:[...liveDevices(browserTunnels), ...liveDevices(nativeTunnels)], virtualFallback:{ tunnelName:VIRTUAL_OS_TUNNEL_NAME, urlHint:`fs/${VIRTUAL_OS_TUNNEL_NAME}`, autoHint:"fs/auto?fallback=virtual-os", yamlComment:"# targetVessel: virtual-os" }, guidance:error === "tunnel_not_alive" ? "Requested tunnel is stale for heavy routing. Try status/cancel/output/doctor control actions, restart only if those fail, or use targetVessel=virtual-os." : "Use a connected native/browser tunnelName, open /apps/code for browser-tab mode, or set targetVessel=virtual-os." }; } }; }
function wantsVirtualOs(tunnelName, payload = {}) { return requestedVesselType(tunnelName, payload) === VESSEL_TYPES.VIRTUAL_OS; }
module.exports = { resolveFsVessel, requestedVesselType, wantsVirtualOs };
