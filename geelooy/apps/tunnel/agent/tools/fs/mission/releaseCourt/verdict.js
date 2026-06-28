// B"H
const Quota = require('../evidenceQuota/index.js');
function issues(config, lock = {}, result = {}) { const out = []; if (!lock) out.push('no_lock'); if (Date.parse(lock?.minimumUntil || 0) > Date.now()) out.push('minimum_time_not_met'); if (!lock?.next8Completed) out.push('next8_not_completed'); if (!lock?.repeatBetterDone) out.push('repeat_better_missing'); if (!lock?.verificationSeen) out.push('verification_missing'); const q = Quota.issues(config, lock); return { issues:[...out, ...q.issues], quota:q }; }
function verdict(config, lock, result) { const got = issues(config, lock, result); return { ok: got.issues.length === 0, issues: got.issues, quota: got.quota, finalAnswerAllowed: got.issues.length === 0 }; }
module.exports = { verdict, issues };
