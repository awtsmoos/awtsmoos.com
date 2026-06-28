// B"H
function key(next = {}) { return JSON.stringify({ action: next.action, missionId: next.missionId, stepIndex: next.stepIndex, questionId: next.questionId }); }
function detect(lock = {}, next = {}) { const k = key(next); const count = lock.lastNextKey === k ? Number(lock.repeatCount || 0) + 1 : 1; return { key: k, count, stuck: count >= 3 }; }
module.exports = { detect, key };
