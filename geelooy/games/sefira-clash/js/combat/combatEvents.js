import { COMBAT_TUNING } from '../data/combatTuning.js';
import { shouldAnnounceCombo } from './comboSystem.js';

/**
 * B"H
 * Combat event forge.
 *
 * Chapter 3: the hit is no longer a mute collision. It becomes a herald with
 * direction, danger, combo thunder, launch prophecy, and cheap geometric glory
 * so renderers can paint meaning without expensive storms.
 */
export function buildHitEvent(attacker, target, attack, payload) {
  const side = Math.sign(attack.aim?.x || target.x - attacker.x) || attacker.face || 1;
  const heavy = payload.force >= COMBAT_TUNING.effects.heavyForce;
  const kill = target.damage >= COMBAT_TUNING.launch.killDangerPercent || payload.force >= COMBAT_TUNING.effects.killForce;
  return {
    type: 'hit', attackerId: attacker.id, targetId: target.id,
    human: attacker.human || target.human,
    x: target.x, y: target.y - 106, side,
    color: payload.color, letter: payload.letter,
    damage: payload.damage, force: payload.force,
    combo: payload.combo?.count || 1,
    comboScore: payload.combo?.score || 0,
    rapid: !!attack.rapid, charge: attack.charge || 0,
    fullCharge: !!attack.fullCharge,
    koDanger: kill,
    feel: heavy ? 'heavy' : attack.rapid ? 'rapid' : 'clean',
    vector: payload.vector || null,
    effectPack: effectPack(attack, heavy, kill)
  };
}

export function pushComboAnnouncements(state, attacker, target, combo) {
  if (!shouldAnnounceCombo(combo.count)) return;
  state.events.push({
    type: 'narrative', x: target.x, y: target.y - 150,
    text: `${combo.count}x COMBO`, color: '#fff4a8',
    score: combo.score, attackerId: attacker.id, targetId: target.id
  });
}

export function pushLaunchDebug(state, target, vector) {
  if (!state.debug || !vector) return;
  state.events.push({
    type: 'launchDebug', x: target.x, y: target.y - 96,
    vx: vector.x * COMBAT_TUNING.effects.debugVectorScale,
    vy: vector.y * COMBAT_TUNING.effects.debugVectorScale,
    force: vector.force
  });
}

export function registerHitDiagnostics(state, attack, event) {
  state.diagnostics ||= { hits: 0, rapidHits: 0, maxCombo: 0, comboScore: 0, killDangerHits: 0 };
  state.diagnostics.hits++;
  if (attack.rapid) state.diagnostics.rapidHits++;
  if (event.koDanger) state.diagnostics.killDangerHits++;
}

function effectPack(attack, heavy, kill) {
  return {
    sparks: attack.rapid ? 4 : heavy ? 10 : 7,
    ring: heavy || kill,
    slash: attack.limb === 'rightFoot' || attack.limb === 'weaponTip',
    streak: heavy || attack.rapid,
    shockwave: kill || attack.id === 'meteorKick'
  };
}
