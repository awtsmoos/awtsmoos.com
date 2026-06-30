// B"H
const pct = (xs, p) => xs.length ? [...xs].sort((a, b) => a - b)[Math.min(xs.length - 1, Math.floor(xs.length * p))] : 0;
const avg = xs => xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : 0;

export function createLongRunRecorder() {
  const frames = [], actions = [], violations = [];
  const counts = { movementSteps:0, collisionContacts:0, blockedCollisions:0, triggerEvents:0, targetChanges:0, combatActions:0, cutsceneEvents:0 };
  function recordFrame(costMs, result = {}, phase = "") {
    frames.push(costMs);
    counts.movementSteps++;
    counts.collisionContacts += result.hits?.length || 0;
    if (result.blocked) counts.blockedCollisions++;
    counts.triggerEvents += result.triggerEvents?.length || 0;
    actions.push({ frame:frames.length, phase, blocked:Boolean(result.blocked) });
  }
  function addViolation(type, detail = {}) { violations.push({ type, ...detail }); }
  function addCount(name, amount = 1) { counts[name] = (counts[name] || 0) + amount; }
  function summary(extra = {}) {
    const worst = frames.length ? Math.max(...frames) : 0;
    return {
      frames:frames.length,
      actions:actions.length,
      averageFrameCostMs:Number(avg(frames).toFixed(3)),
      p95FrameCostMs:Number(pct(frames, .95).toFixed(3)),
      p99FrameCostMs:Number(pct(frames, .99).toFixed(3)),
      worstFrameCostMs:Number(worst.toFixed(3)),
      violations,
      ...counts,
      ...extra
    };
  }
  return { frames, actions, violations, recordFrame, addViolation, addCount, summary };
}

export default createLongRunRecorder;
