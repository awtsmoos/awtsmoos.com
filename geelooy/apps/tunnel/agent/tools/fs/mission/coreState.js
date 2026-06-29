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
  function finalizationPolicy(input = {}) {
    return {
      finalizationAction: 'missionFinalize',
      reportIsFinal: false,
      earlyFinalBehavior: 'block_and_continue',
      minimumProductiveCycles: env.num(input.minimumProductiveCycles, 12),
      minimumProductiveMs: env.num(input.minimumProductiveMs ?? input.minimumInnovationWindowMs, 60 * 60 * 1000),
      minimumProtocolCycles: env.num(input.minimumProtocolCycles, 12),
      requireQueueClear: input.requireQueueClear !== false,
      requireCycleArtifacts: input.requireCycleArtifacts !== false,
      requireBossProtocolWhenEnabled: true
    };
  }
  function bossProtocol(input = {}) {
    const enabled = input.bossProtocol === true || input.bossProtocol === 'true' || input.selfBoss === true || input.selfBoss === 'true';
    return {
      enabled,
      minimumCycles: env.num(input.minimumProtocolCycles, 12),
      minimumIdeasPerBrainstorm: env.num(input.minimumIdeasPerBrainstorm, 50),
      minimumStagesPerCycle: 8,
      currentCycle: 1,
      currentStage: env.ProtocolStages?.first ? env.ProtocolStages.first() : 'WILD_BRAINSTORM',
      startedAt: env.now(),
      answers: []
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
      collaboration: null, continuationQueue: [], innovationCycles: [],
      protocolCycles: [], bossProtocol: bossProtocol(input),
      earlyFinalAttempts: [], finalizations: [],
      automation: { enabled: input.auto === true || input.automation === true, cycles: 0, maxCycles: Number(input.maxCycles || 1000), mode: input.mode || 'guided' },
      autonomyPolicy: autonomyPolicy(input),
      finalizationPolicy: finalizationPolicy(input),
      metadata: input.metadata || {},
      innovationPolicy: env.Innovation.create(input),
      lease: env.Lease.create(input),
      constitution: { entropyThreshold: env.num(input.entropyThreshold, 25) }
    };
  }
  return { autonomyPolicy, finalizationPolicy, bossProtocol, shape };
}

/**
 * B"H
 * Shape is the clay before footsteps. It now carries the boss protocol from
 * birth, so reports and finalization can see whether the mission has become
 * its own stubborn foreman.
 */
module.exports = { createState };
