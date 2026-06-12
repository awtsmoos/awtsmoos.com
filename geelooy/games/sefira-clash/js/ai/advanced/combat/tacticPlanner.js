import { pickAttackFamily } from './families/attackFamilyPicker.js';
import { killConfirmTactic } from './killConfirmPlanner.js';
import { tastePenalty } from '../memory/actionTasteMemory.js';

/**
 * B"H
 * Combat tactic planner with KO family intelligence.
 *
 * Chapter 209: tactics no longer begin as buttons. The bot chooses a family
 * from KO intent — rapid, kick, charge, anti-air, meteor, grab — then old taste
 * memory and kill-confirm polish keep it lawful and adaptive.
 */
export function combatTactic(bot, world) {
  if (world.threatVision?.panic && !world.combat?.canHitNow) return tactic('AvoidThreat', 'none', world.threatVision.safestX, 0, false, 'none');
  const c = world.combat;
  let chosen = pickAttackFamily(bot, world);
  chosen = avoidBitter(bot, chosen, c);
  chosen = killConfirmTactic(bot, world, chosen);
  return chosen;
}

function avoidBitter(bot, chosen, combat) {
  if (!chosen.instant || tastePenalty(bot, chosen.kind) < 55) return chosen;
  if (chosen.button === 'punch' && combat.canHitNow) return tactic('TasteSwitchKick', 'kick', chosen.aimX, chosen.aimY, true, 'kick');
  if (chosen.button === 'kick' && combat.reachableClose) return tactic('TasteSwitchPunch', 'punch', chosen.aimX, chosen.aimY, true, 'jab');
  return chosen;
}

function tactic(kind, button, aimX, aimY, instant, family) {
  return { kind, button, aimX: Math.sign(aimX || 1), aimY, instant, family };
}
