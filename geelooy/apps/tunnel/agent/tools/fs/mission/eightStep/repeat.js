// B"H
const Plan = require('./plan.js');
const Store = require('./store.js');

function repeatCount(m) {
  return Store.ensure(m).rounds.length;
}

function loopWarning(count) {
  return count >= 3 ? 'POSSIBLE_RECURSIVE_RECOVERY_LOOP: repeatBetter created multiple next8 rounds.' : '';
}

/**
 * B"H
 * Repeat better may continue, but it must say why and count its own footsteps.
 */
function better(m, input = {}) {
  const prev = Store.current(m);
  if (prev) prev.status = 'reviewed';
  const gaps = (prev?.steps || []).filter(s => s.status !== 'done').map(s => `Recover ${s.title}`);
  const insights = (prev?.steps || []).map(s => `Improve after ${s.title}`).slice(0, 8);
  const steps = (gaps.length ? gaps : insights).concat(['simplify response', 'verify live', 'write receipt', 'repeat better']).slice(0, 8);
  const count = repeatCount(m) + 1;
  const round = Plan.create(m, { ...input, previousRoundId: prev?.id || '', title: 'Better next 8 steps', steps });
  round.repeatCount = count;
  round.loopWarning = loopWarning(count);
  return round;
}

module.exports = { better, repeatCount, loopWarning };
