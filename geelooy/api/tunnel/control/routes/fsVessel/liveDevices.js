// B"H

/**
 * B"H
 * Chapter 1227: The registry stopped mistaking a ghost for a gate.
 *
 * A tunnel can remain registered after its heartbeat dies. Discovery may show
 * that stale vessel for diagnostics, but routing may not send work into it and
 * wait for nginx to bury the answer. These helpers split "known" from "alive".
 */
function isLiveDevice(device = {}) {
  return !!device && device.isAlive !== false;
}

function liveDevices(devices = []) {
  return (devices || []).filter(isLiveDevice);
}

function staleDevices(devices = []) {
  return (devices || []).filter(device => !isLiveDevice(device));
}

function deviceWarnings(nativeDevices = [], browserDevices = []) {
  const stale = [...staleDevices(browserDevices), ...staleDevices(nativeDevices)];
  if (!stale.length) return [];
  return stale.map(device => ({
    code: 'stale_tunnel_not_routable',
    tunnelName: device.tunnelName || '',
    kind: device.kind || device.vesselType || 'unknown',
    isAlive: device.isAlive === false ? false : device.isAlive,
    guidance: 'This tunnel is registered but not alive. Restart the local/browser tunnel before routing work to it.'
  }));
}

function connectedNames(devices = []) {
  return liveDevices(devices).map(device => device.tunnelName).filter(Boolean);
}

module.exports = { connectedNames, deviceWarnings, isLiveDevice, liveDevices, staleDevices };
