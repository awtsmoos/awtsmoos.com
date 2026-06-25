// B"H

function createState(env) {
  function autonomyPolicy(input = {}) {
    return {
      neverAskHumanUntilBlocked: input.neverAskHumanUntilBlocked !== false,
      allowSelfQuestions: input.allowSelfQuestions !== false,
      allowSelfBrainstorm: input.allowSelfBrainstorm !== false,
      allowSelfMail: input.allowSelfMail === true || input.selfMail === true,
      requireHumanForDestructive: input.requireHumanForDestructive !== false,
      minRuntimeBeforeHumanQuestionMs: env.num(input.minRuntimeBeforeHumanQuestionMs, 1800000),
      maxRepeatedFailureBeforeHuman: env.num(input.maxRepeatedFailureBeforeHuman, 5),
      maxSelfBrainstormCycles: env.num(input.maxSelfBrainstormCycles, 12),
      selfQuestionEveryActions: env.num(input.selfQuestionEveryActions, 3),
      selfQuestionEveryMs: env.num(input.selfQuestionEveryMs, 300000),
      maxAutopilotRounds: env.num(input.maxAutopilotRounds, 200),
      mailEveryRounds: env.num(input.mailEveryRounds, 10),
      startedAtMs: Date.now()
    };
  }
  function shape(input = {}, mid = env.id()) {
    return {
      BH: 'B"H', id: env.clean(mid),
      goal: String(input.goal || input.prompt || input.query || 'Untitled mission'),
      status: 'active', phase: 'planning', createdAt: env.now(),
      updatedAt: env.now(), heartbeatAt: env.now(),
      definitionOfDone: env.list(input.definitionOfDone || input.criteria, [
        'implementation exists', 'evidence recorded', 'verification passed', 'supervisor accepts completion'
      ]),
      tasks: [], evidence: [], events: [], questions: [], answers: [],
      discoveries: [], blockers: [], jobs: [], scripts: [], brainstorms: [], mail: [],
      checkpoints: [], escalations: [], stepPlans: [], chunkPlans: [],
      refrigeratedStates: [], thawHistory: [], nextPlans: [], longRun: null,
      collaboration: null,
      automation: { enabled: input.auto === true || input.automation === true, cycles: 0, maxCycles: Number(input.maxCycles || 1000), mode: input.mode || 'guided' },
      autonomyPolicy: autonomyPolicy(input),
      metadata: input.metadata || {},
      innovationPolicy: env.Innovation.create(input),
      lease: env.Lease.create(input),
      constitution: { entropyThreshold: env.num(input.entropyThreshold, 25) }
    };
  }
  return { autonomyPolicy, shape };
}

/**
 * B"H
 * Shape is the clay before footsteps. It receives lease, constitution,
 * innovation, and autonomy without knowing the later battles of the mission.
 */
module.exports = { createState };
