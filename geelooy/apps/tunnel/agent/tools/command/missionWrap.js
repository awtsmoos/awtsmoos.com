// B"H
const Lock = require('../fs/mission/lock/index.js');
const Runtime = require('../fs/actionRuntime.js');
const Boot = require('../fs/mission/implicitBoot/index.js');
const Envelope = require('../fs/mission/envelope/index.js');
async function prepare(config, payload = {}) {
  const active = await Runtime.healthyActive(config);
  const boot = await Boot.maybeStart(config, payload, active);
  return { active:boot?.lock || active, boot };
}
async function run(config, payload, fn) {
  const mission = await prepare(config, payload);
  const result = await fn(config, payload);
  const lock = Lock.active(config) || mission.active;
  return Boot.annotate(Envelope.wrap(lock, result, payload), mission.boot);
}
/** B"H — Top-level command tools also enter the mission river. */
module.exports = { prepare, run };
