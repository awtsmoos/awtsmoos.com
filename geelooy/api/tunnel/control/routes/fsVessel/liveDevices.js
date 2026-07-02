// B"H

/**
 * B"H
 * Chapter 1802: The stale label was humbled.
 *
 * A native tunnel that recently registered is not a corpse merely because one
 * heartbeat bit flickered false during event-loop pressure. Heavy routing may
 * still fail if the socket is truly gone, but discovery, routing choice, and UI
 * warnings now treat recent native evidence as recovering instead of dead.
 */
const RECOVERING_NATIVE_MS = Number(process.env.AWTSMOOS_NATIVE_RECOVERING_MS || 30 * 60 * 1000);
const CONTROL_ROUTE_ACTIONS = new Set(['heartbeat','tunnelHeartbeat','agentHeartbeat','ping','pong','status','tunnelStatus','agentStatus','commandStatus','commandPoll','commandJobStatus','jobStatus','commandJobOutputPage','commandOutputPage','commandCancel','commandJobCancel','commandWait','commandJobWait','payloadEcho','configGet','tunnelDoctor','agentDoctor','runtimeSnapshot','tunnelLivenessTimeline']);
function isLiveDevice(device = {}) { return !!device && (device.isAlive !== false || isRecoveringNative(device)); }
function isRecoveringNative(device = {}) {
  if (!device || !device.tunnelName) return false;
  const kind = String(device.kind || device.vesselType || device.type || 'native-tunnel');
  if (kind.includes('browser')) return false;
  return recentStamp(device.lastSeenAt || device.heartbeatAt || device.registeredAt, RECOVERING_NATIVE_MS);
}
function recentStamp(value, maxAgeMs) {
  const stamp = typeof value === 'number' ? value : Date.parse(value || '');
  return Number.isFinite(stamp) && Date.now() - stamp >= 0 && Date.now() - stamp <= maxAgeMs;
}
function liveDevices(devices = []) { return (devices || []).filter(isLiveDevice); }
function staleDevices(devices = []) { return (devices || []).filter(device => !isLiveDevice(device)); }
function isControlRouteAction(payload = {}) { return CONTROL_ROUTE_ACTIONS.has(String(payload.action || '')); }
function deviceWarnings(nativeDevices = [], browserDevices = []) {
  const stale = [...staleDevices(browserDevices), ...staleDevices(nativeDevices)];
  if (!stale.length) return [];
  return stale.map(device => ({ code:'stale_tunnel_not_routable', tunnelName:device.tunnelName || '', kind:device.kind || device.vesselType || 'unknown', isAlive:device.isAlive === false ? false : device.isAlive, guidance:'Heavy routing is paused for this stale tunnel, but status/cancel/output/doctor control actions may still be attempted.' }));
}
function connectedNames(devices = []) { return liveDevices(devices).map(device => device.tunnelName).filter(Boolean); }
module.exports = { CONTROL_ROUTE_ACTIONS, connectedNames, deviceWarnings, isControlRouteAction, isLiveDevice, isRecoveringNative, liveDevices, recentStamp, staleDevices };
