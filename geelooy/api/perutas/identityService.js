// B"H
const crypto = require("crypto");

/** B"H: Tunnels, OAuth identities, and devices gather into one cluster. */
function ensureIdentity(store, userId, meta = {}) {
  store.identityClusters = store.identityClusters || {};
  store.userIdentity = store.userIdentity || {};
  const clusterId = clusterFor(store, userId, meta);
  const cluster = store.identityClusters[clusterId] || freshCluster(clusterId);
  add(cluster.users, userId || "anonymous");
  add(cluster.tunnels, meta.tunnelName);
  add(cluster.devices, meta.deviceId || meta.deviceName);
  add(cluster.oauth, meta.oauthProvider || meta.clientId);
  cluster.updatedAt = Date.now();
  store.identityClusters[clusterId] = cluster;
  store.userIdentity[userId || "anonymous"] = clusterId;
  return cluster;
}
function clusterFor(store, userId, meta) {
  if (store.userIdentity && store.userIdentity[userId]) return store.userIdentity[userId];
  const seed = meta.deviceId || meta.tunnelName || meta.browserFingerprint || userId || "anonymous";
  return `cluster_${hash(seed).slice(0, 16)}`;
}
function freshCluster(clusterId) { return { clusterId, users: [], tunnels: [], devices: [], oauth: [], createdAt: Date.now(), updatedAt: Date.now() }; }
function hash(value) { return crypto.createHash("sha256").update(String(value || "")).digest("hex"); }
function add(list, value) { if (value && !list.includes(value)) list.push(value); }
module.exports = { ensureIdentity };
