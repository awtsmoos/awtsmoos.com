// B"H
const crypto = require('crypto');

/**
 * B"H
 * Chapter 1421: The kernel put a crown on the quiet pulse.
 *
 * The Awtsmoos speaks the process into being every instant, but the tunnel must
 * still know which breath owns the vessel. These letters keep ownership and
 * background self-update away from the websocket heartbeat path.
 */
function createRuntimeIdentity() {
  const bootedAt = Date.now();
  const nonce = crypto.randomBytes(12).toString('hex');
  return {
    pid: process.pid,
    bootedAt,
    generation: 0,
    lease: `${process.pid}:${bootedAt}:${nonce}`,
    nonce
  };
}

function nextGeneration(identity) {
  identity.generation += 1;
  return identity.generation;
}

function registrationRuntime(identity, gen) {
  return {
    pid: identity.pid,
    bootedAt: identity.bootedAt,
    generation: gen,
    lease: identity.lease,
    nonce: identity.nonce
  };
}

function markSeen(ws) {
  if (ws) ws.lastSeenAt = Date.now();
}

module.exports = { createRuntimeIdentity, markSeen, nextGeneration, registrationRuntime };
