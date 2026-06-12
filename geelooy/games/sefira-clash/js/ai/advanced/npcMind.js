/** B"H - NPC mind entry with full realistic AI systems wired. */
import { updateProgress } from './blackboard/progressTracker.js';
import { diagnoseStuck } from './blackboard/stuckDetector.js';
import { validateAttack } from './combat/attackValidator.js';
import { combatPocket } from './combat/positionPlanner.js';
import { combatTactic } from './combat/tacticPlanner.js';
import { updateComboMomentum } from './combat/comboMomentum.js';
import { updateRapidJailBreaker } from './combat/rapidJailBreaker.js';
import { debugPacket } from './debug/npcDebugPacket.js';
import { updateFightMomentum } from './emotion/fightMomentum.js';
import { updateHunger } from './emotion/hungerSystem.js';
import { updateRevengeMemory } from './emotion/revengeMemory.js';
import { chooseState } from './hsm/stateMachine.js';
import { markRouteFailure, updateActionMemory } from './memory/actionMemory.js';
import { updateActionTaste } from './memory/actionTasteMemory.js';
import { updateCombatFrustration } from './memory/combatFrustration.js';
import { updateEdgePoisonMemory } from './memory/edgePoisonMemory.js';
import { updateJumpDebt } from './memory/jumpDebt.js';
import { updatePositionLoopMemory } from './memory/positionLoopMemory.js';
import { buildWorld, chooseStableTarget } from './navigation/worldModel.js';
import { threatVision } from './sense/threatVision.js';
import { updateAggression } from './strategy/aggressionEscalation.js';
import { updateAntiPeace } from './strategy/antiPeace.js';
import { updateCombatHeat } from './strategy/combatHeat.js';
import { executionVision } from './strategy/executionVision.js';
import { updateFakeRetreat } from './strategy/fakeRetreat.js';
import { chooseHumanIntent } from './strategy/humanIntent.js';
import { updateNoStillnessLaw } from './strategy/noStillnessLaw.js';
import { updateRivalry } from './strategy/rivalrySystem.js';
import { commandForState } from './commands/commandArbiter.js';

export function driveNpcMind(state) {
  for (const bot of state.fighters) {
    if (bot.human || bot.dead || bot.hidden) continue;
    updateActionMemory(bot, roughWorld(bot));
    updateRevengeMemory(bot);
    const target = chooseStableTarget(bot, state.fighters, state.map);
    if (!target) continue;
    const world = buildWorld(bot, target, state);
    enrichMind(bot, world);
    const progress = updateProgress(bot, target, routeFacade(world));
    const stuck = diagnoseStuck(bot, world, progress);
    if (stuck.stuck) markRouteFailure(bot, world, stuck.kind);
    const mode = chooseState(bot, world, stuck);
    bot.input = commandForState(bot, world, mode, stuck);
    exposeDebug(bot, world, progress, stuck, mode);
  }
}

function enrichMind(bot, world) {
  updatePositionLoopMemory(bot, world);
  world.edgePoison = updateEdgePoisonMemory(bot, world);
  world.preAttackCheck = validateAttack(bot, world, world.combatTactic);
  world.comboMomentum = updateComboMomentum(bot, world);
  world.rapidJail = updateRapidJailBreaker(bot);
  world.combatHeat = updateCombatHeat(bot, world);
  world.huntClock = world.combatHeat.hunt;
  world.rivalry = updateRivalry(bot, world);
  world.hunger = updateHunger(bot, world);
  world.momentum = updateFightMomentum(bot, world);
  world.threatVision = threatVision(bot, world);
  world.execution = executionVision(bot, world);
  world.fakeRetreat = updateFakeRetreat(bot, world);
  world.antiPeace = updateAntiPeace(bot, world);
  world.aggression = updateAggression(bot, world);
  world.taste = updateActionTaste(bot);
  world.jumpDebt = updateJumpDebt(bot);
  world.combatPocket = combatPocket(bot, world);
  world.combatTactic = combatTactic(bot, world);
  world.frustration = updateCombatFrustration(bot, world);
  world.noStillness = updateNoStillnessLaw(bot, world);
  world.humanIntent = chooseHumanIntent(bot, world, world.preAttackCheck);
  bot.aiMind.humanIntent = world.humanIntent;
  bot.aiMind.koIntent = world.koIntent;
  bot.aiMind.combatTactic = world.combatTactic;
}

function roughWorld(bot) {
  return { combatTactic: bot.aiMind?.combatTactic || { kind: bot.aiMind?.tactic || 'unknown' }, current: null, goal: null, step: null };
}

function routeFacade(world) {
  return { current: world.current?.p, action: world.step?.action || (world.current?.id === world.goal?.id ? 'same' : 'none') };
}

function exposeDebug(bot, world, progress, stuck, mode) {
  bot.ai ||= {};
  bot.ai.mode = mode;
  bot.ai.routeFail = stuck.stuck ? (bot.ai.routeFail || 0) + 1 : Math.max(0, (bot.ai.routeFail || 0) - 2);
  bot.ai.stuck = progress.noProgress;
  bot.ai.edgeHover = stuck.kind === 'ledge' ? 30 : Math.max(0, (bot.ai.edgeHover || 0) - 2);
  bot.aiMind.debug = debugPacket(bot, world, progress, stuck, mode);
}
