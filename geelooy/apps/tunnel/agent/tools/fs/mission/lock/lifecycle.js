// B"H
const Store = require('./store.js');
const Config = require('./config.js');
const Stuck = require('../stuckness/index.js');
const Heart = require('../heartbeat/index.js');
const Seed = require('../autoSeed/index.js');
function windowMs(payload = {}) { return payload.minimumInnovationWindowMs ?? payload.minimumRuntimeMs ?? 3600000; }
function workFrom(result = {}) { return result.workQueue || result.round?.workQueueProgress || result.workQueueProgress || null; }
function start(config, result = {}, payload = {}) {
  const missionId = result.missionId || result.mission?.id || payload.missionId;
  if (!missionId) return null;
  const seed = Seed.next(missionId, payload);
  const lock = { projectRoot: config.root, missionId, mode: payload.missionLockMode || Config.DEFAULT_MODE, releaseStatus: Config.LOCKED, releaseAllowed: false, startedAt: Config.now(), updatedAt: Config.now(), minimumUntil: Config.minimumUntil(windowMs(payload)), owner: payload.owner || 'daemon', lastMustCallNext: seed || result.mustCallNext || result.nextRequiredAction || null, blockedOn: gate(result), receipts: [], workQueue: workFrom(result), workProgress: workFrom(result)?.progress || null, filesTouched: [], testsRun: 0 };
  Store.set(config, lock); Heart.fromLock(config, lock); return lock;
}
function update(config, result = {}, payload = {}) {
  const lock = Store.get(config); if (!lock) return null;
  lock.updatedAt = Config.now(); lock.lastAction = result.action || payload.action || '';
  const next = result.mustCallNext || result.nextRequiredAction || null;
  if (next) { lock.lastMustCallNext = next; Stuck.apply(lock, next); }
  const work = workFrom(result);
  if (work) { lock.workQueue = work; lock.workProgress = work.progress || work; }
  if (Array.isArray(result.filesTouched)) lock.filesTouched = [...new Set([...(lock.filesTouched || []), ...result.filesTouched])];
  if (Number(result.testsRun || 0) > 0) lock.testsRun = Number(lock.testsRun || 0) + Number(result.testsRun || 0);
  if (result.releaseToken) lock.releaseToken = result.releaseToken;
  lock.blockedOn = gate(result) || lock.blockedOn || null;
  mark(lock, result);
  lock.releaseAllowed = lock.releaseAllowed === true && result.finalAnswerAllowed === true;
  lock.releaseStatus = lock.releaseAllowed ? 'releasable' : 'locked';
  Store.set(config, lock); Heart.fromLock(config, lock); return lock;
}
function mark(lock, result = {}) {
  if (result.action === 'missionReviewNext8Step' && result.mustCallNext?.action === 'missionRepeatBetter') lock.next8Completed = true;
  if (result.action === 'missionRepeatBetter') lock.repeatBetterDone = true;
  if (/Verify|Test|Scheduler|DaemonTick|command/i.test(result.action || '') || Number(result.testsRun || 0) > 0) lock.verificationSeen = true;
  if (Array.isArray(result.filesTouched) && result.filesTouched.length) lock.fileWriteSeen = true;
}
function gate(result = {}) {
  const q = result.multipleChoiceSelfInterrogation || result.next?.question;
  return q ? { action: 'missionAnswer', questionId: q.questionId || q.id, recommendedAnswer: q.recommendedAnswer || '', expectedAnswerFormat: q.expectedAnswerFormat || '' } : null;
}
module.exports = { start, update, gate, windowMs, workFrom };
