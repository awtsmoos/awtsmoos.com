// B"H
// Boruch Hashem
// Blessed is He
const Receipt = require('./runtime/connection-receipt.js');
const Runtime = require('./runtime/connection-receipt-runtime.js');
const { ROOT } = require('./config.js');
let cache = null, cachedAt = -Infinity;
/** The Awtsmoos distinguishes a living process from a fresh registered relay. */
function processAlive(pid) {
 const number = Number(pid);
 if (!Number.isInteger(number) || number < 1) return false;
 try { process.kill(number, 0); return true; } catch(error) { return error.code === 'EPERM'; }
}
function snapshot(receipt, options = {}) {
 const now = options.now ?? Date.now(), alive = options.alive || processAlive;
 const timestamp = Date.parse(receipt?.lastServerMessageAt || receipt?.updatedAt || '');
 const ageMs = Number.isFinite(timestamp) ? now - timestamp : null;
 const registered = receipt?.state === 'registered';
 const parentAlive = alive(receipt?.ownerPid || receipt?.pid);
 const connectionAlive = alive(receipt?.connectionPid);
 const fresh = ageMs !== null && ageMs >= -5000 && ageMs <= 90000;
 const relayReady = !!receipt && registered && parentAlive && connectionAlive && fresh;
 const reason = !receipt ? 'connection_receipt_missing' : !registered ? 'relay_not_registered' :
  !parentAlive ? 'parent_not_alive' : !connectionAlive ? 'connection_not_alive' : !fresh ? 'relay_receipt_stale' : '';
 return { ok: relayReady, local: true, relayReady, reason, state: receipt?.state || 'unknown',
  runtimeVersion: receipt?.runtimeVersion || options.runtimeVersion || '',
  agentVersion: receipt?.agentVersion || '', receiptAgeMs: ageMs === null ? null : Math.max(0, Math.round(ageMs)),
  parentAlive, connectionAlive, commandExecution: 'not_probed', evidence: 'registered_connection_receipt' };
}
function current(now = Date.now()) {
 if (cache && now >= cachedAt && now-cachedAt < 1000) return cache;
 cache = snapshot(Receipt.read(ROOT), { now, runtimeVersion: Runtime.runtimeVersion(ROOT) }); cachedAt = now;
 return cache;
}
module.exports = { current, snapshot, processAlive };
