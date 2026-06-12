/**
 * B"H
 * NPC mind entry.
 *
 * Chapter 86: heat is now computed before the final tactic is crowned. The bot
 * sees silence, combo momentum, kill hunger, and anti-peace first; then it
 * chooses pocket and tactic with that fire already in the room.
 */
import { updateProgress } from './blackboard/progressTracker.js';
import { diagnoseStuck } from './blackboard/stuckDetector.js';
import { validateAttack } from './combat/attackValidator.js';
import { combatPocket } from './combat/positionPlanner.js';
import { combatTactic } from './combat/tacticPlanner.js';
import { updateComboMomentum } from './combat/comboMomentum.js';
import { chooseState } from './hsm/stateMachine.js';
import { markRouteFailure } from './memory/actionMemory.js';
import { updatePositionLoopMemory } from './memory/positionLoopMemory.js';
import { buildWorld, chooseStableTarget } from './navigation/worldModel.js';
import { updateAggression } from './strategy/aggressionEscalation.js';
import { updateAntiPeace } from './strategy/antiPeace.js';
import { updateCombatHeat } from './strategy/combatHeat.js';
import { commandForState } from './commands/commandArbiter.js';

export function driveNpcMind(state) {
  for (const bot of state.fighters) {
    if (bot.human || bot.dead || bot.hidden) continue;
    const target = chooseStableTarget(bot, state.fighters, state.map);
    if (!target) continue;
    const world = buildWorld(bot, target, state);
    enrichViolence(bot, world);
    const progress = updateProgress(bot, target, routeFacade(world));
    const stuck = diagnoseStuck(bot, world, progress);
    if (stuck.stuck) markRouteFailure(bot, world, stuck.kind);
    const mode = chooseState(bot, world, stuck);
    bot.input = commandForState(bot, world, mode, stuck);
    exposeDebug(bot, world, progress, stuck, mode);
  }
}

function enrichViolence(bot, world) {
  updatePositionLoopMemory(bot);
  world.preAttackCheck = validateAttack(bot, world, world.combatTactic);
  world.comboMomentum = updateComboMomentum(bot, world);
  world.combatHeat = updateCombatHeat(bot, world);
  world.antiPeace = updateAntiPeace(bot, world);
  world.aggression = updateAggression(bot, world);
  world.combatPocket = combatPocket(bot, world);
  world.combatTactic = combatTactic(bot, world);
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
  bot.aiMind.debug = {
    state: mode,
    commitment: bot.aiMind.commitment?.name || 'none',
    opportunity: bot.aiMind.opportunity?.name || 'none',
    intent: bot.aiMind.opportunity?.intent || 'none',
    heat: Math.round(bot.aiMind.combatHeat?.heat || 0),
    antiPeace: bot.aiMind.antiPeace?.active ? `on:${bot.aiMind.antiPeace.frames}` : 'off',
    combo: bot.aiMind.comboMomentum?.active ? `on:${bot.aiMind.comboMomentum.frames}` : 'off',
    kill: bot.aiMind.combatHeat?.killMode ? 'kill' : 'normal',
    fatigue: bot.aiMind.opportunity?.fatigue?.stale ? `${bot.aiMind.opportunity.fatigue.name}:${bot.aiMind.opportunity.fatigue.frames}` : 'fresh',
    loop: bot.aiMind.positionLoop?.loopDetected ? 'loop' : 'clear',
    pressure: Math.round(bot.aiMind.pressure?.value || 0),
    aggression: Math.round((bot.aiMind.aggression?.value || 1) * 100),
    tactic: bot.aiMind.tactic || 'none',
    jumpReason: bot.aiMind.jumpReason || 'none',
    attackValid: bot.aiMind.attackCheck?.valid ?? false,
    attackReason: bot.aiMind.attackCheck?.reason || 'none',
    motion: `${Math.round(world.motion?.vx || 0)},${Math.round(world.motion?.vy || 0)}`,
    landing: world.landing?.active ? `${Math.round(world.landing.x)},${Math.round(world.landing.y)}` : 'none',
    stuck: stuck.kind,
    routeFound: world.route.found,
    routeAction: world.step?.action || 'same',
    noProgress: progress.noProgress,
    whiffs: Object.keys(bot.aiMind.memory?.whiffs || {}).length,
    target: world.target?.id
  };
}
