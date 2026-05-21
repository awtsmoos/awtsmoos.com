/**
 * B"H
 * Chapter 8: The Four Winds Enter The Courtroom.
 *
 * The Awtsmoos lets a verse become a blade of clarity. Pshat stands as
 * earth, remez flows as water, derush burns as fire, and sod rises as air.
 * These tables are intentionally tiny and pure so every UI, NPC, and battle
 * layer can resolve debate turns without guessing.
 */

export const TORAH_DEBATE_TYPES = Object.freeze({
  pshat: Object.freeze({ world: 'Asiyah', element: 'earth', beats: ['sod'], weakTo: ['derush'] }),
  remez: Object.freeze({ world: 'Yetzirah', element: 'water', beats: ['derush'], weakTo: ['sod'] }),
  derush: Object.freeze({ world: 'Beriah', element: 'fire', beats: ['pshat'], weakTo: ['remez'] }),
  sod: Object.freeze({ world: 'Atzilus', element: 'air', beats: ['remez'], weakTo: ['pshat'] })
});

export const TORAH_DEBATE_ACTIONS = Object.freeze({
  open: 'openTorahDebate',
  selectPassage: 'selectInventoryPassage',
  playPirush: 'playPirushType',
  resolveTurn: 'resolveDebateTurn',
  reward: 'grantDebateReward',
  close: 'closeTorahDebate'
});

export function resolveDebateType(attackerType, defenderType) {
  const attacker = TORAH_DEBATE_TYPES[attackerType];
  if (!attacker) return 'invalid';
  if (attacker.beats.includes(defenderType)) return 'strong';
  if (attacker.weakTo.includes(defenderType)) return 'weak';
  return 'neutral';
}
