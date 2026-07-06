// B"H
/** B"H — A lagging native vessel is a wounded messenger, not a corpse. */
const RECOVERING_NATIVE_MS = Number(process.env.AWTSMOOS_NATIVE_RECOVERING_MS || 60 * 60 * 1000);
const CONTROL_ROUTE_ACTIONS = new Set([
  "heartbeat", "tunnelHeartbeat", "agentHeartbeat", "ping", "pong", "status",
  "tunnelStatus", "agentStatus", "commandStatus", "commandPoll", "commandJobStatus",
  "jobStatus", "commandJobOutputPage", "commandOutputPage", "commandCancel",
  "commandJobCancel", "commandWait", "commandJobWait", "payloadEcho", "configGet",
  "tunnelDoctor", "agentDoctor", "runtimeSnapshot", "tunnelLivenessTimeline"
]);

function stamp(value) {
  const parsed = typeof value === "number" ? value : Date.parse(value || "");
  return Number.isFinite(parsed) ? parsed : 0;
}

function recentStamp(value, maxAgeMs = RECOVERING_NATIVE_MS, now = Date.now()) {
  const time = stamp(value);
  return time > 0 && now - time >= 0 && now - time <= maxAgeMs;
}

function freshestStamp(device = {}) {
  return Math.max(stamp(device.lastSeenAt), stamp(device.heartbeatAt), stamp(device.newestEvidenceAt), stamp(device.registeredAt));
}

function isNative(device = {}) {
  const kind = String(device.kind || device.vesselType || device.type || "native-tunnel");
  return !kind.includes("browser") && !!device.tunnelName;
}

function isRecoveringNative(device = {}) {
  return isNative(device) && recentStamp(freshestStamp(device), RECOVERING_NATIVE_MS);
}

function isLiveDevice(device = {}) {
  return !!device && (device.isAlive !== false || isRecoveringNative(device));
}

function isControlRouteAction(payload = {}) {
  return CONTROL_ROUTE_ACTIONS.has(String(payload.action || ""));
}

function canRouteDevice(device = {}, payload = {}) {
  return isLiveDevice(device) || (isRecoveringNative(device) && isControlRouteAction(payload));
}

function liveDevices(devices = []) { return (devices || []).filter(isLiveDevice); }
function staleDevices(devices = []) { return (devices || []).filter(device => !isLiveDevice(device)); }
function connectedNames(devices = []) { return liveDevices(devices).map(device => device.tunnelName).filter(Boolean); }

function warningFor(device = {}) {
  const recovering = isRecoveringNative(device);
  return {
    code: recovering ? "degraded_or_recovering" : "stale_tunnel_not_routable",
    tunnelName: device.tunnelName || "",
    kind: device.kind || device.vesselType || "unknown",
    isAlive: device.isAlive === false ? false : device.isAlive,
    lastSeenAt: device.lastSeenAt || null,
    heartbeatAt: device.heartbeatAt || null,
    missedHeartbeats: device.missedHeartbeats || 0,
    guidance: recovering ? "Recent native evidence exists; route control/status/output/doctor actions and avoid hard-dead fallback." : "Heavy routing is paused after heartbeat grace. Try status/cancel/output/doctor actions before restart."
  };
}

function deviceWarnings(nativeDevices = [], browserDevices = []) {
  return [...browserDevices, ...nativeDevices].filter(device => !isLiveDevice(device)).map(warningFor);
}

module.exports = { CONTROL_ROUTE_ACTIONS, canRouteDevice, connectedNames, deviceWarnings, freshestStamp, isControlRouteAction, isLiveDevice, isRecoveringNative, liveDevices, recentStamp, staleDevices };
