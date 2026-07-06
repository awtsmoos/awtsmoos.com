// B"H
/**
 * B"H — The socket is only a garment; the tunnel soul is evidenced by frames,
 * pongs, workers, receipts, and time. A missed heartbeat is a question, not a
 * death sentence. This module keeps that mercy pure and testable.
 */
const DEFAULTS = {
  maxMissedHeartbeats: Number(process.env.AWTSMOOS_WS_MAX_MISSED_HEARTBEATS || 6),
  staleMs: Number(process.env.AWTSMOOS_WS_STALE_MS || 5 * 60 * 1000)
};

function stamp(value) {
  const parsed = typeof value === "number" ? value : Date.parse(value || "");
  return Number.isFinite(parsed) ? parsed : 0;
}

function recent(value, maxAgeMs, now = Date.now()) {
  const time = stamp(value);
  return time > 0 && now - time >= 0 && now - time <= maxAgeMs;
}

function freshestStamp(client = {}) {
  return Math.max(stamp(client.lastSeenAt), stamp(client.heartbeatAt), stamp(client.registeredAt));
}

function markSeen(client, now = Date.now()) {
  client.isAlive = true;
  client.lastSeenAt = now;
  client.heartbeatAt = now;
  client.missedHeartbeats = 0;
  return client;
}

function markHeartbeatSent(client, now = Date.now()) {
  if (client.awaitingPong || client.isAlive === false) client.missedHeartbeats = Number(client.missedHeartbeats || 0) + 1;
  client.awaitingPong = true;
  client.heartbeatPingAt = now;
  client.isAlive = false;
  return client;
}

function evidenceIsFresh(client, now = Date.now(), limits = DEFAULTS) {
  return recent(freshestStamp(client), limits.staleMs, now);
}

function shouldTerminate(client, now = Date.now(), limits = DEFAULTS) {
  const missed = Number(client?.missedHeartbeats || 0);
  return missed >= limits.maxMissedHeartbeats && !evidenceIsFresh(client, now, limits);
}

function stateFor(client = {}, now = Date.now(), limits = DEFAULTS) {
  if (client.isAlive !== false) return "active";
  if (evidenceIsFresh(client, now, limits)) return "waiting_for_pong_or_frame";
  if (Number(client.missedHeartbeats || 0) >= limits.maxMissedHeartbeats) return "stale_terminate_ready";
  return "degraded_or_recovering";
}

function livenessSnapshot(client = {}, now = Date.now(), limits = DEFAULTS) {
  const fresh = freshestStamp(client);
  const rawIsAlive = client.isAlive === false ? false : client.isAlive;
  return {
    isAlive: rawIsAlive !== false || recent(fresh, limits.staleMs, now),
    rawIsAlive,
    lastSeenAt: stamp(client.lastSeenAt) || null,
    heartbeatAt: stamp(client.heartbeatAt) || null,
    registeredAt: stamp(client.registeredAt) || null,
    newestEvidenceAt: fresh || null,
    missedHeartbeats: Number(client.missedHeartbeats || 0),
    livenessState: stateFor(client, now, limits)
  };
}

module.exports = { DEFAULTS, freshestStamp, livenessSnapshot, markHeartbeatSent, markSeen, recent, shouldTerminate };
