// B"H
const D = require('./detect.js');
const R = require('./recover.js');
function apply(lock, next) {
  const got = D.detect(lock, next);
  lock.lastNextKey = got.key;
  lock.repeatCount = got.count;
  lock.loopDiagnostics = {
    repeated: got.repeated,
    staleMission: got.staleMission,
    missingMission: got.missingMission,
    repeatCount: got.count,
    lastNextKey: got.key,
    updatedAt: new Date().toISOString()
  };
  if (got.stuck) lock.lastMustCallNext = R.next(lock, got);
  return { lock, stuck: got.stuck, diagnostics: lock.loopDiagnostics };
}
module.exports = { apply, detect: D.detect, recoverNext: R.next };
