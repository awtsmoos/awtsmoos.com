// B"H
const AutoAsync = require('./autoAsync.js');
const Lock = require('./mission/lock/index.js');
const Envelope = require('./mission/envelope/index.js');
function should(action, payload) { return AutoAsync.shouldOffload(action, payload); }
/** B"H — Even subprocess receipts must remember the mission. */
async function maybe(config, payload) {
  if (!should(payload.action, payload)) return null;
  const receipt = await AutoAsync.offload(config, payload);
  return Envelope.wrap(Lock.active(config), receipt, payload);
}
module.exports = { maybe, should };
