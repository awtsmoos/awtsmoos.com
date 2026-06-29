// B"H
function run(m, input = {}, env) {
  m.selfImprovement ||= { policy: env.policy.defaults(input) };
  if (input.selfImprove === true || input.selfImprove === 'true') m.selfImprovement.policy.enabled = true;
  const role = env.roles.next(m, input);
  const ideas = ideasFor(role.role, input);
  const ledger = env.ledger.add(m, { ideas, category: input.category });
  const novelty = env.novelty.score({ ...input, proof: input.proof || ideas[0] }, m);
  const boredom = env.boredom.check(m, { noveltyScore: novelty.score });
  const receipt = env.receipts.add(m, { agentId: role.agentId, role: role.role, stage: boredom.boring ? 'forced_brainstorm' : 'self_improve', action: 'missionSelfImprovePulse', noveltyScore: novelty.score, innovations: ledger.added.length, proof: input.proof || ideas[0], next: { action: 'missionSelfImprovePulse', missionId: m.id } });
  const court = env.court.verdict(m, env);
  return { ok: true, role, ideas, ledger, novelty, boredom, receipt, court, mustCallNext: court.ok ? { action: 'missionSelfImproveCourt', missionId: m.id } : env.court.next(m, court), finalAnswerAllowed: false, mustContinue: true };
}
function ideasFor(role, input) {
  const focus = input.focus || 'mission';
  return [
    `${role}: inspect one overlooked edge of ${focus}`,
    `${role}: add proof or a regression test for ${focus}`,
    `${role}: find a smaller module boundary in ${focus}`,
    `${role}: write a future improvement ticket for ${focus}`,
    `${role}: challenge a current assumption in ${focus}`
  ];
}
module.exports = { run };
