// B"H

/**
 * B"H
 * Chapter 613: Devices became a constellation, not a table.
 * Live sockets are stars, usage events are traces, and the user can finally see
 * which vessels pulled light from the treasury.
 */
function deviceGraph(store, userId, liveDevices = []) {
  const usage = (store.usageEvents || []).filter(x => !userId || x.userId === userId);
  const nodes = new Map();
  const edges = [];
  const rootId = `user:${userId || "all"}`;
  node(nodes, rootId, userId || "All Users", "user", { active: true });
  for (const device of liveDevices || []) addLiveDevice(nodes, edges, rootId, device);
  for (const event of usage.slice(-160)) addUsageDevice(nodes, edges, rootId, event);
  return { nodes: [...nodes.values()], edges, devices: [...nodes.values()].filter(x => x.type === "device" || x.type === "vessel") };
}
function addLiveDevice(nodes, edges, rootId, device) {
  const id = `device:${device.tunnelName || device.deviceName || "unknown"}`;
  node(nodes, id, device.deviceName || device.tunnelName || "Device", "device", {
    tunnelName: device.tunnelName || null,
    root: device.root || null,
    live: true,
    allowWrite: !!device.allowWrite
  });
  edges.push({ from: rootId, to: id, kind: "connected", amount: 1 });
}
function addUsageDevice(nodes, edges, rootId, event) {
  const label = event.routeType || event.action || "Unknown Vessel";
  const id = `vessel:${label}`;
  node(nodes, id, label, "vessel", { live: false });
  edges.push({ from: rootId, to: id, kind: event.category || "routing", amount: Number(event.bytes || event.seconds || 1), at: event.at });
}
function node(nodes, id, label, type, meta = {}) {
  if (!nodes.has(id)) nodes.set(id, { id, label, type, ...meta });
  else Object.assign(nodes.get(id), meta);
}
module.exports = { deviceGraph };
