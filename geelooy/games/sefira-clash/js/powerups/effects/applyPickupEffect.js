/**
 * B"H
 * Pickup effect applier.
 *
 * Adventure Sparks are small blessings and campaign truth. Arena relics remain
 * timed powers. The player should feel every pickup immediately without turning
 * a platform level into random overpowering chaos.
 */
export function applyPickupEffect(state, fighter, orb) {
  fighter.buffs ||= {};
  if (orb.id === 'adventureSpark') return collectSpark(fighter, orb);
  if (orb.id === 'chesedHeal') return heal(fighter, 35);
  if (orb.id === 'shofarBlast') return fireShofar(state, fighter, orb);
  fighter.buffs[orb.id] = Math.max(fighter.buffs[orb.id] || 0, orb.duration || 480);
  if (orb.id === 'shieldCrystal') fighter.buffs.ohrShield = Math.max(fighter.buffs.ohrShield || 0, 220);
  if (orb.id === 'wingRelic') fighter.airJumps = Math.max(fighter.airJumps || 0, 1);
}

function collectSpark(f, orb) {
  heal(f, orb.hiddenSpark ? 10 : 6);
  f.buffs.netzachBoots = Math.max(f.buffs.netzachBoots || 0, orb.hiddenSpark ? 180 : 90);
}

function heal(f, amount) {
  f.damage = Math.max(0, (f.damage || 0) - amount);
}

function fireShofar(state, f, orb) {
  state.events.push({ type: 'hit', attackerId: f.id, targetId: f.id, human: !!f.human, x: f.x, y: f.y - 90, color: orb.color, letter: 'ש', damage: 0, force: 36, side: f.face || 1, fullCharge: true });
  f.buffs.shofarEcho = 180;
}
