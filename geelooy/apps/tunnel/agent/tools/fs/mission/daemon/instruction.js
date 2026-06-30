// B"H
const Lease = require('../../continuation/lease.js');

/**
 * B"H — The tunnel receives a calm sentence, not thunder.
 * It can steer, recover, or tick again; it only stops the mission when the user
 * gives a verified stop or safety requires a pause.
 */
function instruction(lease) {
  if (!Lease.active(lease)) return '';
  return 'The mission is still under its continuation lease. Choose the next useful action, steer if needed, and keep going until the user gives a verified stop or a safety rule blocks progress.';
}
module.exports = { instruction };
