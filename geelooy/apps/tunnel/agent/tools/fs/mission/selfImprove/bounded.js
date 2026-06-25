// B"H
/**
 * B"H
 * Chapter 614: The endless river accepted a measuring cup.
 * Not because the river became small, but because the vessel needed proof.
 * Each bounded pulse is a counted spark of Awtsmoos in code: no vague glow,
 * only receipts, courts, summits, and a next action that refuses sleep.
 */
function run(m, input = {}, env) {
  const startedAt = new Date().toISOString();
  const maxPulses = cap(input.maxPulses ?? input.cycles ?? 3, 1, 200);
  const maxRuntimeMs = cap(input.maxRuntimeMs ?? 30 * 1000, 0, 60 * 60 * 1000);
  const stopWhenCourtPasses = input.stopWhenCourtPasses !== false;
  const pulses = [];
  let reason = 'max_pulses_reached';
  for (let i = 0; i < maxPulses; i++) {
    if (Date.now() - Date.parse(startedAt) > maxRuntimeMs) { reason = 'runtime_budget_exhausted'; break; }
    const pulse = env.pulse.run(m, { ...input, pulseIndex: i, focus: input.focus || 'bounded self improvement' }, env);
    pulses.push(pulse.receipt || pulse);
    const every = Number(m.selfImprovement?.policy?.summitEveryCycles || input.summitEveryCycles || 0);
    if (every > 0 && (i + 1) % every === 0) env.summit.run(m, input, env);
    if (stopWhenCourtPasses && pulse.court?.ok) { reason = 'court_passed'; break; }
  }
  const court = env.court.verdict(m, env);
  const runReceipt = receipt(startedAt, pulses, court, reason);
  m.selfImproveBoundedRuns ||= [];
  m.selfImproveBoundedRuns.push(runReceipt);
  return {
    ok: true, startedAt, endedAt: runReceipt.endedAt, pulses: pulses.length,
    reason, court, runReceipt, finalAnswerAllowed: court.ok,
    mustContinue: !court.ok, mustCallNext: court.ok ? { action: 'missionSelfImproveCourt', missionId: m.id } : env.court.next(m, court)
  };
}
function receipt(startedAt, pulses, court, reason) {
  return { id: `sirun_${Date.now().toString(36)}`, startedAt, endedAt: new Date().toISOString(), pulses: pulses.length, reason, court };
}
function cap(value, min, max) { const n = Number(value); return Math.max(min, Math.min(max, Number.isFinite(n) ? n : min)); }
function status(m) { return { count: (m.selfImproveBoundedRuns || []).length, recent: (m.selfImproveBoundedRuns || []).slice(-10) }; }
module.exports = { run, status };
