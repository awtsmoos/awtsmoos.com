// B"H
const crypto = require('crypto');

/**
 * B"H
 * Names are vessels. A command job, worker, and receipt each receive their own
 * name so identity can survive mission wrappers and cancellation races.
 */
function nextId(prefix, bytes = 6) {
  return `${prefix}_${Date.now().toString(36)}_${crypto.randomBytes(bytes).toString('hex')}`;
}

function commandIds() {
  return {
    jobId: nextId('cmdjob', 6),
    workerId: nextId('worker', 5),
    receiptId: nextId('receipt', 5)
  };
}

module.exports = { nextId, commandIds };
