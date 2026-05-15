/**
 * B\"H
 * @file QuestState.js
 * @description
 * Small quest-state helpers for multi-stage shlichus chains.
 */

export function createQuestLog() {
  return {
    activeChains: {},
    completedChains: [],
    completedStages: []
  };
}

export function startQuestChain(log, chain) {
  if (!log || !chain?.id) return log;

  if (!log.activeChains)log.activeChains = {};

  log.activeChains[chain.id] = {
    chainId: chain.id,
    stageIndex: 0,
    startedAt: Date.now()
  };

  return log;
}

export function getActiveStage(log, chain) {
  const state = log?.activeChains?.[chain?.id];
  if (!state || !chain?.stages) return null;

  return chain.stages[state.stageIndex] || null;
}

export function advanceQuestChain(log, chain) {
  if (!log || !chain?.id) return log;
  const state = log.activeChains?.[chain.id];
  if (!state) return log;

  const currentStage = chain.stages[state.stageIndex];
  if (currentStage) {
    log.completedStages.push(currentStage.id);
  }

  state.stageIndex += 1;

  if (state.stageIndex >= chain.stages.length) {
    delete log.activeChains[chain.id];
    log.completedChains.push(chain.id);
  }

  return log;
}

export function isQuestChainComplete(log, chainId) {
  return !!(log?.completedChains?.includes(chainId));
}
