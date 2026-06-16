import { createAttackIntentMetrics } from '../metrics/attackIntentMetrics.js';

/** B"H — report vessel, a ledger before the clash starts speaking. */
export function createReport(map, frames, botCount, options, state) {
  return {
    map: map.id, options, requestedFrames: frames, botCount, framesRun: 0, winner: null,
    simMs: 0, framesPerSecond: 0, combatEnded: false, combatEndedAt: 0,
    lastStocks: Object.fromEntries(state.fighters.map(f => [f.id, f.stocks || 0])),
    attackCommands: 0, attackCommandsPerMinute: 0, activeAttackFrames: 0, rapidAttackCommands: 0, rapidAttackFrames: 0, charges: 0,
    jumps: 0, namelessJumps: 0, invalidAttackCommands: 0, idleNearEnemyFrames: 0, longestIdleNearEnemyWindow: 0, edgeBounceLoops: 0,
    rapidJailFrames: 0, rapidJailEscapes: 0, noStillnessCorrections: 0, frustrationActions: 0, antiPeaceFrames: 0, antiPeaceActivations: 0,
    comboMomentumFrames: 0, comboMomentumActivations: 0, killModeFrames: 0, forceEngageFrames: 0, hungerFrames: 0,
    starvingFrames: 0, revengeSwitches: 0, fakeRetreatFrames: 0, fakeRetreatActivations: 0, executionFrames: 0,
    threatDodgeFrames: 0, jumpDebtBlocks: 0, highJumpDebtFrames: 0, recoveries: 0, escapes: 0, hiddenRespawns: 0,
    itemsSpawned: 0, itemsPickedUp: 0, hazardsSpawned: 0, hazardHits: 0, objectiveSpawns: 0, objectiveClaims: 0,
    scarCount: 0, stageBornPowerups: 0, stageMood: null, storyBeats: 0, storyCallouts: {}, rivalryPairs: 0,
    attackIntent: createAttackIntentMetrics(), maxParticles: 0, nanFighters: 0, aiDriven: true,
    damageEnd: 0, peakDamage: 0, damageFrames: 0, damagePerMinute: 0, koCount: 0,
    loopDetectedFrames: 0, opportunityFatigueTriggers: 0, longestNoPressureWindow: 0, currentNoPressureWindow: 0,
    longestSameOpportunityWindow: 0, sameOpportunityWindow: {}, frameHadPressure: false, states: {}, opportunities: {}, intents: {},
    humanIntents: {}, commitments: {}, attackReasons: {}, jumpReasons: {}, samples: []
  };
}
