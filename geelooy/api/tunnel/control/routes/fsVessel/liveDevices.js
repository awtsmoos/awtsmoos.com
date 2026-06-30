// B"H

/**
 * B"H
 * Chapter 1228: A stale name is not a locked gate for the doctor.
 *
 * Registry liveness can lag behind websocket reality. Heavy work must not be
 * routed into ghosts, but control-plane probes, status, cancel, output pages and
 * doctors are the very messengers that prove whether the ghost is really gone.
 */
const CONTROL_ROUTE_ACTIONS = new Set(['heartbeat','tunnelHeartbeat','agentHeartbeat','ping','pong','status','tunnelStatus','agentStatus','commandStatus','commandPoll','commandJobStatus','jobStatus','commandJobOutputPage','commandOutputPage','commandCancel','commandJobCancel','commandWait','payloadEcho','configGet','tunnelDoctor','agentDoctor','runtimeSnapshot']);
function isLiveDevice(device = {}) { return !!device && device.isAlive !== false; }
function liveDevices(devices = []) { return (devices || []).filter(isLiveDevice); }
function staleDevices(devices = []) { return (devices || []).filter(device => !isLiveDevice(device)); }
function isControlRouteAction(payload = {}) { return CONTROL_ROUTE_ACTIONS.has(String(payload.action || '')); }
function deviceWarnings(nativeDevices = [], browserDevices = []) { const stale = [...staleDevices(browserDevices), ...staleDevices(nativeDevices)]; if (!stale.length) return []; return stale.map(device => ({ code:'stale_tunnel_not_routable', tunnelName:device.tunnelName || '', kind:device.kind || device.vesselType || 'unknown', isAlive:device.isAlive === false ? false : device.isAlive, guidance:'Heavy routing is paused for this stale tunnel, but status/cancel/output/doctor control actions may still be attempted.' })); }
function connectedNames(devices = []) { return liveDevices(devices).map(device => device.tunnelName).filter(Boolean); }
module.exports = { CONTROL_ROUTE_ACTIONS, connectedNames, deviceWarnings, isControlRouteAction, isLiveDevice, liveDevices, staleDevices };
