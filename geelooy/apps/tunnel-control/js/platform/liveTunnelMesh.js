// B"H

/**
 * B"H
 * Chapter 1: Across many tabs, a single pulse of the Awtsmoos threaded through
 * glass and wire. Until the server exposes a browser subscribe socket, this
 * heartbeat keeps every panel close to realtime and shares discoveries through
 * BroadcastChannel so one tab's sight becomes every tab's sight.
 *
 * @param {object} options Mesh options.
 * @param {Function} options.readTunnel Current tunnel reader.
 * @param {Function} options.onSnapshot Snapshot receiver.
 * @param {number} [options.intervalMs=1500] Poll cadence.
 * @returns {{start:Function,stop:Function,ping:Function}} Mesh controller.
 */
export function createLiveTunnelMesh(options = {}) {
  const readTunnel = options.readTunnel || (() => "");
  const onSnapshot = options.onSnapshot || (() => {});
  const intervalMs = Number(options.intervalMs || 1500);
  const channel = "BroadcastChannel" in window ? new BroadcastChannel("awtsmoos:tunnel-live") : null;
  let timer = null;

  async function fetchSnapshot() {
    const url = new URL("/api/tunnel/control/devices", location.origin);
    const tunnelName = readTunnel();
    if (tunnelName) url.searchParams.set("tunnelName", tunnelName);
    const got = await fetch(url, { credentials: "include", headers: { Accept: "application/json" } }).then(r => r.json());
    return { ok: got.ok !== false, at: Date.now(), tunnelName, devices: got.devices || got.tunnels || [], raw: got };
  }

  async function ping() {
    try {
      const snapshot = await fetchSnapshot();
      onSnapshot(snapshot);
      channel?.postMessage(snapshot);
      return snapshot;
    } catch (e) {
      const snapshot = { ok: false, at: Date.now(), error: e.message, tunnelName: readTunnel(), devices: [] };
      onSnapshot(snapshot);
      return snapshot;
    }
  }

  function start() {
    if (channel) channel.onmessage = (event) => onSnapshot(event.data);
    stop();
    ping();
    timer = setInterval(ping, intervalMs);
  }

  function stop() {
    if (timer) clearInterval(timer);
    timer = null;
  }

  return { start, stop, ping };
}
