// B"H
function actionOf(next = {}) { return String(next.action || ''); }
function missionOf(next = {}) { return String(next.missionId || next.id || ''); }
function key(next = {}) {
  return JSON.stringify({ action: actionOf(next), missionId: missionOf(next), stepIndex: next.stepIndex, questionId: next.questionId, roundId: next.roundId });
}
function staleMission(lock = {}, next = {}) {
  const lockMission = String(lock.missionId || '');
  const nextMission = missionOf(next);
  return !!(lockMission && nextMission && lockMission !== nextMission);
}
function missingMission(lock = {}, next = {}) {
  return !missionOf(next) && actionOf(next).startsWith('mission') && actionOf(next) !== 'missionBootResume';
}
function detect(lock = {}, next = {}) {
  const k = key(next);
  const count = lock.lastNextKey === k ? Number(lock.repeatCount || 0) + 1 : 1;
  const repeated = count >= 3;
  return {
    key: k,
    count,
    repeated,
    staleMission: staleMission(lock, next),
    missingMission: missingMission(lock, next),
    stuck: repeated || staleMission(lock, next) || missingMission(lock, next)
  };
}
module.exports = { detect, key, staleMission, missingMission };
