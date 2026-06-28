// B"H
const Plan = require('./plan.js');
const Store = require('./store.js');
function better(m, input = {}) {
  const prev = Store.current(m); if (prev) prev.status = 'reviewed';
  const gaps = (prev?.steps || []).filter(s => s.status !== 'done').map(s => `Recover ${s.title}`);
  const insights = (prev?.steps || []).map(s => `Improve after ${s.title}`).slice(0, 8);
  const steps = (gaps.length ? gaps : insights).concat(['simplify response','verify live','write receipt','repeat better']).slice(0, 8);
  return Plan.create(m, { ...input, previousRoundId: prev?.id || '', title: 'Better next 8 steps', steps });
}
module.exports = { better };
