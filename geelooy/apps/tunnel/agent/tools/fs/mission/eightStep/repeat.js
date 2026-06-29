// B"H
const Plan = require('./plan.js');
const Store = require('./store.js');
const Work = require('../workQueue/index.js');
function repeatCount(m) { return Store.ensure(m).rounds.length; }
function loopWarning(count, summary = {}) {
  if (count >= 3 && Number(summary.done || 0) === 0) return 'NON_PROGRESSING_MISSION_LOOP: no concrete work debt has been completed after multiple rounds.';
  if (count >= 3) return 'MISSION_CONTINUATION_LOOP: continuing because remaining work debt still exists.';
  return '';
}
function remainingTitles(summary = {}) { return (summary.remaining || []).map(x => `${x.kind}: ${x.title}`); }
function better(m, input = {}) {
  const prev = Store.current(m);
  if (prev) prev.status = 'reviewed';
  const summary = Work.summary(m);
  const count = repeatCount(m) + 1;
  const steps = remainingTitles(summary).slice(0, 8);
  if (!steps.length) steps.push('Run final live verification', 'Review git diff', 'Confirm release conditions', 'Prepare final answer');
  const round = Plan.create(m, { ...input, previousRoundId: prev?.id || '', title: 'Find remaining concrete work', steps });
  round.round.repeatCount = count;
  round.round.loopWarning = loopWarning(count, summary);
  round.round.workQueueProgress = summary;
  return { ...round, repeatCount: count, loopWarning: round.round.loopWarning, workQueue: summary, repeatMeaning: 'find_remaining_work_not_blind_repeat' };
}
module.exports = { better, repeatCount, loopWarning, remainingTitles };
