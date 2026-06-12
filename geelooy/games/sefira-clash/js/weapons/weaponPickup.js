import { dist2 } from '../core/vectors.js';

/**
 * B"H
 * Weapon pickup resolver with player-local feedback metadata.
 *
 * Chapter 274: the tool binds to the hand that found it. If a bot picks up a
 * sword, the world may sparkle, but the phone does not buzz unless the human
 * hand is the one receiving the gift.
 */
export function resolveWeaponPickups(state) {
  for (const f of state.fighters) {
    if (f.dead || f.heldWeapon) continue;
    for (const w of state.weapons) {
      if (w.held) continue;
      if (dist2(f, w) >= 2500) continue;
      f.heldWeapon = w;
      w.held = true;
      state.events.push({ type: 'pickup', fighterId: f.id, actorId: f.id, human: !!f.human, x: f.x, y: f.y - 70, color: w.color });
      break;
    }
  }
}

export function syncHeldWeapons(state) {
  for (const f of state.fighters) {
    if (!f.heldWeapon) continue;
    f.heldWeapon.x = f.x + f.face * 38;
    f.heldWeapon.y = f.y - 62;
    f.heldWeapon.spin += 0.12 * f.face;
  }
}
